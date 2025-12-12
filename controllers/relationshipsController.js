const pool = require("../db/db");

// ---------------- GET ALL FOR USER ----------------
exports.getRelationshipsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            `SELECT * FROM relationships WHERE user_id = $1 ORDER BY id DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching relationships:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ---------------- GET SINGLE ----------------
exports.getRelationship = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT * FROM relationships WHERE id = $1`,
            [id]
        );

        if (!result.rows.length) return res.status(404).json({ message: "Not found" });

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// ---------------- CREATE ----------------
exports.createRelationship = async (req, res) => {
    try {
        const {
            user_id,
            name,
            email,
            phone,
            address,
            married,
            spouse,
            transaction_status,
            relationship_type,
            last_contacted,
            follow_up_date,
            notes
        } = req.body;

        const result = await pool.query(
            `
            INSERT INTO relationships
            (user_id, name, email, phone, address, married, spouse,
             transaction_status, relationship_type, last_contacted, follow_up_date, notes)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
            RETURNING *;
            `,
            [
                user_id, name, email, phone, address, married, spouse,
                transaction_status, relationship_type, last_contacted, follow_up_date, notes
            ]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error creating relationship:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ---------------- UPDATE ----------------
// ---------------- UPDATE ----------------
exports.updateRelationship = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body || {};

        const fields = Object.keys(updates);
        const values = Object.values(updates);

        if (fields.length === 0) {
            return res.status(400).json({ message: "No fields provided for update" });
        }

        const setQuery = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");

        const result = await pool.query(
            `
                UPDATE relationships
                SET ${setQuery}, updated_at = NOW()
                WHERE id = $${fields.length + 1}
                    RETURNING *;
            `,
            [...values, id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error updating:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ---------------- DELETE ----------------
exports.deleteRelationship = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            `DELETE FROM relationships WHERE id = $1`,
            [id]
        );

        res.json({ message: "Deleted" });
    } catch (err) {
        console.error("Error deleting:", err);
        res.status(500).json({ message: "Server error" });
    }
};
