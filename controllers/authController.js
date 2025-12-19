const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../db/db");
const sendEmail = require("../utils/sendEmail");
const { encryptPassword, decryptPassword } = require("../utils/authEncryption");


/**
 * POST /api/auth/signup
 */
exports.signup = async (req, res) => {
    const { name, email, password } = req.body;

    // ✅ PUT IT HERE (early guard)
    if (!name || !email || !password) {
        return res.status(400).json({
            error: "Name, email, and password are required",
        });
    }

    try {
        // Check existing user
        const existing = await db.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        const encryptedPassword = encryptPassword(password);
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const result = await db.query(
            `
                INSERT INTO users (name, email, password_hash, verification_token)
                VALUES ($1, $2, $3, $4)
                    RETURNING id, email
            `,
            [name, email, encryptedPassword, verificationToken]
        );

        const verificationLink = `${process.env.API_BASE_URL}/api/auth/verify-email/${verificationToken}`;

        await sendEmail(
            email,
            "Verify your Clubhouse Links account",
            `
            <h2>Welcome to Clubhouse Links</h2>
            <p>Please verify your email by clicking below:</p>
            <a href="${verificationLink}" style="padding:10px 15px;background:steelblue;color:white;text-decoration:none;border-radius:4px;">
                Verify Email
            </a>
            `
        );

        res.status(201).json({
            message: "Signup successful. Please verify your email."
        });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ error: "Server error" });
    }
};


/**
 * POST /api/auth/signin
 */
exports.signin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }

    try {
        const result = await db.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const user = result.rows[0];

        if (!user.verified) {
            return res.status(403).json({
                error: "Please verify your email before signing in."
            });
        }

        const decryptedPassword = decryptPassword(user.password_hash);

        if (decryptedPassword !== password) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            token
        });
    } catch (err) {
        console.error("Signin error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

/**
 * GET /api/auth/verify-email/:token
 */
exports.verifyEmail = async (req, res) => {
    const { token } = req.params;

    try {
        const result = await db.query(
            `
            UPDATE users
            SET verified = true,
                verification_token = NULL
            WHERE verification_token = $1
            RETURNING email
            `,
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).send("<h2>Invalid or expired link</h2>");
        }

        res.send(`
            <h2>Email verified successfully ✅</h2>
            <p>You may now return to the app and sign in.</p>
        `);
    } catch (err) {
        console.error("Verify email error:", err);
        res.status(500).send("Verification failed");
    }
};
