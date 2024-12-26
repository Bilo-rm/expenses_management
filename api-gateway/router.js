const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET; // Make sure to change this in production

function verifyToken(req, res, next) {
    const token = req.headers['authorization']; // Get token from headers
    console.log('Received token:', token);

    if (!token) return res.status(403).json({ error: 'No token provided' });

    if (!token.startsWith('Bearer ')) {
        return res.status(403).json({ error: 'Invalid token format' });
    }

    const actualToken = token.split(' ')[1]; // Extract the actual token after "Bearer"

    jwt.verify(actualToken, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.status(401).json({ error: 'Unauthorized' });
        }

        req.userId = decoded.id; // Correctly assign user ID from the token payload
        next(); // Pass control to the next middleware or route handler
    });
}


// Authentication Routes
router.post('/auth/register', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:3000/api/auth/register', req.body);
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Gateway error' });
    }
});

router.post('/auth/login', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:3000/api/auth/login', req.body);
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Gateway error' });
    }
});

// Protected Routes
router.get('/user/profile', verifyToken, async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3000/api/user/profile', {
            headers: { 'Authorization': req.headers['authorization'] }
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Gateway error' });
    }
});


router.get('/expenses', verifyToken, async (req, res) => {
    try {
        const response = await axios.get('http://localhost:8080/expenses', {
            headers: { 'Authorization': req.headers['authorization'] ,
                        'X-User-ID': req.userId, // Add the user ID to the headers
            }
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error("Error fetching expenses from Go service:", error);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Gateway error' });
    }
});

// Expenses Routes
router.post('/expenses', verifyToken, async (req, res) => {
    try {
        const response = await axios.post('http://localhost:8080/expenses', req.body, {
            headers: { 'Authorization': req.headers['authorization'],
                        'X-User-ID': req.userId, // Add the user ID to the headers
             }
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Gateway error' });
    }
});



router.delete('/expenses/:id', verifyToken, async (req, res) => {
    try {
        const response = await axios.delete(`http://localhost:8080/expenses/${req.params.id}`, {
            headers: { 'Authorization': req.headers['authorization'] }
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Gateway error' });
    }
});

router.put('/expenses/:id', verifyToken, async (req, res) => {
    try {
        const response = await axios.put(`http://localhost:8080/expenses/${req.params.id}`, req.body, {
            headers: { 'Authorization': req.headers['authorization'] }
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Gateway error' });
    }
});

// Insights Routes
router.get('/home/summary', verifyToken, async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5000/api/home/summary', {
            headers: { 'Authorization': req.headers['authorization'],
                'X-User-ID': req.userId, // Add the user ID to the headers
             }
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Gateway error' });
    }
});

router.get('/home/charts', verifyToken, async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5000/api/home/charts', {
            headers: { 'Authorization': req.headers['authorization']
                ,
                        'X-User-ID': req.userId, // Add the user ID to the headers
             }
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Gateway error' });
    }
});

module.exports = router;