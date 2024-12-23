const express = require('express');
const cors = require('cors');
const router = require('./router');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', router);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Gateway service running on port ${PORT}`);
});