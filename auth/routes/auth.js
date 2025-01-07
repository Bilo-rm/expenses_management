const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User');
const router = express.Router();

// Load environment variables
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * @route POST /register
 * @desc Register a new user
 */
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the new user
        const newUser = new User({ name, email, password: hashedPassword });
        const savedUser = await newUser.save();

        // Respond with success message
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                _id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route POST /login
 * @desc Authenticate user and return a JWT token
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
            expiresIn: '1h',
        });

        // Respond with the token
        res.status(200).json({
            message: 'Login successful',
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route POST /logout
 * @desc Log out the user by deleting the JWT token (client side responsibility)
 */
router.post('/logout', (req, res) => {
    // Since JWT tokens are stored on the client, we simply notify the user that they should delete the token
    res.status(200).json({
        message: 'Logout successful. Please delete the token from client-side storage.',
    });
});



/**
 * @route GET /validate
 * @desc Validate a JWT token
 */
/*
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

*/

module.exports = router;
