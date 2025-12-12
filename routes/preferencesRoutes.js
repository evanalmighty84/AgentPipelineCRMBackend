// functions/routes/preferencesRoutes.js
const express = require('express');
const router = express.Router();
const preferencesController = require('../controllers/preferencesController');

// Save or update color scheme
router.post('/colorscheme', preferencesController.saveColorScheme);

// Get the user's current theme
router.get('/colorscheme/:userId', preferencesController.getColorScheme);

module.exports = router;
