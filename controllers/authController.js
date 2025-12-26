const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../db/db");
const sendEmail = require("../utils/sendEmail");
const { encryptPassword, decryptPassword } = require("../utils/authEncryption");
const pool = require("../db/db");
const sendEmailViaApi = require("../utils/sendEmailViaApi");

const API_BASE_URL =
    process.env.NODE_ENV === "production"
        ? "https://agentpipelinecrmbackend-production.up.railway.app"
        : "http://localhost:5000";
/**
 * POST /api/auth/signup
 */
function buildVerificationEmail(name, verificationLink) {
    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="background-color: steelblue; padding: 20px; text-align: center; color: white;">
                <h1 style="margin: 0;">Verify Your Account</h1>
            </div>

            <div style="padding: 20px;">
                <p style="font-size: 16px;">Hello ${name},</p>
                <p style="font-size: 16px;">
                    Please verify your email by clicking the button below:
                </p>

                <p style="text-align: center;">
                    <a href="${verificationLink}"
                       style="display:inline-block;padding:10px 20px;background:steelblue;color:white;text-decoration:none;border-radius:5px;">
                        Verify My Email
                    </a>
                </p>

                <p style="font-size: 14px; text-align: center;">
                    Agent Pipeline CRM — Convert customers into sales using A.I.
                </p>
            </div>

            <div style="background:#f9f9f9;padding:10px;text-align:center;font-size:12px;color:#666;">
                If you did not sign up for this account, you can safely ignore this email.
            </div>
        </div>
    `;
}



exports.signup = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            error: "Name, email, and password are required",
        });
    }

    try {
        const existing = await db.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        const encryptedPassword = encryptPassword(password);
        const verificationToken = crypto.randomBytes(32).toString("hex");

        await db.query(
            `
                INSERT INTO users (name, email, password_hash, verification_token)
                VALUES ($1, $2, $3, $4)
            `,
            [name, email, encryptedPassword, verificationToken]
        );

        const verificationLink =
            `${API_BASE_URL}/api/auth/verify-email/${verificationToken}`;

        // ✅ FIRE-AND-FORGET EMAIL VIA HEROKU (NO await)
        sendEmailViaApi(
            email,
            "Verify your Clubhouse Links account",
            buildVerificationEmail(name, verificationLink)
        ).catch(err => {
            console.error("Email relay failed:", err?.message || err);
        });

        return res.status(201).json({
            message: "Signup successful! Please check your email to verify.",
        });

    } catch (err) {
        console.error("Signup error:", err);
        return res.status(500).json({ error: "Server error" });
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
        const result = await pool.query(
            `
                UPDATE users
                SET verified = true,
                    verification_token = NULL
                WHERE verification_token = $1
                    RETURNING id
            `,
            [token]
        );

        if (result.rowCount === 0) {
            return res.status(400).send("Invalid or expired verification link.");
        }

        // Redirect to frontend login
        return res.redirect("/login");

    } catch (err) {
        console.error("Verify email error:", err);
        return res.status(500).send("Server error");
    }
};

