const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use('/api/preferences', require('./routes/preferencesRoutes'));
app.use('/api/relationships', require('./routes/relationshipsRoutes'));
app.use('/api/calendar', require('./routes/calendarRoutes'));


app.get('/', (req, res) => {
    res.send('Agent Pipeline CRM API running 🚀');
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
});
