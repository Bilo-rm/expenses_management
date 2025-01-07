const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Import bcrypt
const User = require('../model/User');

const router = express.Router();

// Middleware to authenticate token
const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract Bearer token
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Extract user ID and email from the token
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Could not retrieve user profile' });
    }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const updates = { name, email };
        if (password) updates.password = await bcrypt.hash(password, 10); // Hash the password

        const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Could not update profile' });
    }
});

/**
 * @route GET /validate
 * @desc Validate a JWT token
 */
router.get('/validate-token', (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.status(400).send('Token is required');
    }

    console.log('Received token:', token);  // Log the token

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Invalid token:', err);  // Log invalid token error
            return res.status(401).send('Invalid token');
        }
        console.log('Decoded token:', decoded);  // Log decoded token data
        res.status(200).send('Token is valid');
    });
});

module.exports = router;
