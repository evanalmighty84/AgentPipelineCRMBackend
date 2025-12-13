const ical = require("node-ical");

/**
 * GET /api/calendar
 * Returns iCloud calendar events as JSON ok
 */
exports.getCalendarEvents = async (req, res) => {
    try {
        const icsUrl = process.env.ICLOUD_CALENDAR_ICS;

        if (!icsUrl) {
            return res.status(500).json({
                error: "ICLOUD_CALENDAR_ICS environment variable not set"
            });
        }

        const data = await ical.async.fromURL(icsUrl);

        const events = Object.values(data)
            .filter(item => item.type === "VEVENT")
            .map(event => ({
                id: event.uid,
                title: event.summary || "Event",
                start: event.start,
                end: event.end,
                description: event.description || "",
                location: event.location || "",
                allDay: event.datetype === "date"
            }));

        res.json(events);
    } catch (err) {
        console.error("Calendar fetch error:", err);
        res.status(500).json({ error: "Failed to fetch calendar events" });
    }
};
