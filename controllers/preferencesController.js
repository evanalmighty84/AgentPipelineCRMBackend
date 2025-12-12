const pool = require('../db/db');  // adjust path if needed

/* -------------------------------------------------------
   SAVE / UPDATE THEME
------------------------------------------------------- */
exports.saveColorScheme = async (req, res) => {
    try {
        const { userId, theme } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "Missing userId" });
        }

        const cleanedTheme = theme === "null" ? null : theme;

        const sql = `
            INSERT INTO theme_preferences (user_id, theme)
            VALUES ($1, $2)
            ON CONFLICT (user_id)
                DO UPDATE SET theme = EXCLUDED.theme
            RETURNING theme
        `;

        const result = await pool.query(sql, [userId, cleanedTheme]);

        return res.json({
            message: "Theme saved!",
            theme: result.rows[0].theme
        });

    } catch (err) {
        console.error("❌ Error saving theme:", err);
        return res.status(500).json({ message: "Error saving theme" });
    }
};

/* -------------------------------------------------------
   GET THEME + RETURN FULL STYLE MAP
------------------------------------------------------- */
exports.getColorScheme = async (req, res) => {
    try {
        const { userId } = req.params;

        const sql = `SELECT theme FROM theme_preferences WHERE user_id = $1`;
        const result = await pool.query(sql, [userId]);

        let theme = result.rows.length ? result.rows[0].theme : null;

        if (!theme || theme === "null" || theme === "") {
            theme = null;
        }

        const themeStyles = {
            light: {
                background: "#ffffff",
                text: "#000000",
                headerColor: "#f5f5f5",
                headerTextColor: "#000000"
            },
            dark: {
                background: "#121212",
                text: "#ffffff",
                headerColor: "#1f1f1f",
                headerTextColor: "#ffffff"
            },
            gradient: {
                background: "#ffffff",
                text: "#000000",
                headerColor:
                    "linear-gradient(to right, white, steelblue, #007bff, #004aad, navy)",
                headerTextColor: "#ffffff"
            },
            sunset: {
                background: "#fff5ef",
                text: "#3a1f18",
                headerColor:
                    "linear-gradient(90deg, #ff9a76, #ff5e78, #8b2eff)",
                headerTextColor: "#ffffff"
            },
            ocean: {
                background: "#eefbff",
                text: "#003244",
                headerColor:
                    "linear-gradient(90deg, #00bcd4, #0066ff, #002f6c)",
                headerTextColor: "#ffffff"
            },
            forest: {
                background: "#f1fff3",
                text: "#0b3d0b",
                headerColor:
                    "linear-gradient(90deg, #4caf50, #2e7d32, #1b5e20)",
                headerTextColor: "#ffffff"
            },
            rose: {
                background: "#fff4f7",
                text: "#520021",
                headerColor:
                    "linear-gradient(90deg, #ffb7c5, #ff5b8d, #a0004f)",
                headerTextColor: "#ffffff"
            }
        };

        const chosenTheme = theme || "gradient";
        const style = themeStyles[chosenTheme] || themeStyles.gradient;

        return res.json({ theme: chosenTheme, style });

    } catch (err) {
        console.error("❌ Error fetching theme:", err);
        return res.status(500).json({ message: "Error fetching theme" });
    }
};
