const ical = require("node-ical");

exports.getCalendarEvents = async (req, res) => {
    try {
        const icsUrl = process.env.ICLOUD_CALENDAR_ICS;

        console.log("📅 Calendar endpoint hit");
        console.log("🔗 ICS URL set:", !!icsUrl);

        if (!icsUrl) {
            return res.status(500).json({ error: "ICLOUD_CALENDAR_ICS not set" });
        }

        console.log("🌐 Fetching ICS from iCloud…");
        const data = await ical.async.fromURL(icsUrl);

        const keys = Object.keys(data);
        console.log("📦 Raw ICS keys sample:", keys.slice(0, 10));

        // ✅ node-ical puts VEVENTs at top-level
        const vevents = Object.values(data).filter(
            (item) => item && item.type === "VEVENT"
        );

        console.log("📌 VEVENT count:", vevents.length);

        const events = vevents.map((event) => ({
            id: event.uid,
            title: event.summary || "Event",
            start: event.start,
            end: event.end,
            description: event.description || "",
            location: event.location || "",
            allDay: event.datetype === "date",
        }));

        console.log("✅ Final events returned:", events.length);
        res.json(events);
    } catch (err) {
        console.error("🔥 Calendar fetch error:", err);
        res.status(500).json({ error: "Failed to fetch calendar events" });
    }
};
