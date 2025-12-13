const express = require("express");
const router = express.Router();
const calendarController = require("../controllers/calendarController");

// GET calendar events
router.get("/", calendarController.getCalendarEvents);

module.exports = router;
