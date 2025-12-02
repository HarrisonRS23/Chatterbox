const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/userModel');

dotenv.config();

const router = express.Router();

// ---------- LOGIN ----------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input - check presence and type
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ message: 'Please provide a valid email' });
    }
    if (!password || typeof password !== 'string' || password.length === 0) {
      return res.status(400).json({ message: 'Please provide a valid password' });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Return success
    res.status(200).json({
      message: 'Login successful',
      token,
      user: { 
        id: user._id, 
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------- REGISTER ----------
router.post('/register', async (req, res) => {
  try {
    const { firstname, lastname, email, password} = req.body;

    // Validate required fields - check presence and type
    if (!firstname || typeof firstname !== 'string' || !firstname.trim()) {
      return res.status(400).json({ message: 'First name is required and must be a string' });
    }
    if (firstname.trim().length < 1 || firstname.trim().length > 50) {
      return res.status(400).json({ message: 'First name must be between 1 and 50 characters' });
    }
    
    if (!lastname || typeof lastname !== 'string' || !lastname.trim()) {
      return res.status(400).json({ message: 'Last name is required and must be a string' });
    }
    if (lastname.trim().length < 1 || lastname.trim().length > 50) {
      return res.status(400).json({ message: 'Last name must be between 1 and 50 characters' });
    }

    // Validate email and password - check presence, type, and format
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ message: 'Please provide a valid email' });
    }
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Please provide a valid email format' });
    }
    
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Please provide a valid password' });
    }
    if (password.length < 6 || password.length > 100) {
      return res.status(400).json({ message: 'Password must be between 6 and 100 characters' });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({ 
      firstname: firstname.trim(), 
      lastname: lastname.trim(), 
      email: email.trim(), 
      password: hashedPassword 
    });
    
    await newUser.save();

    // Optional: Auto-login after register
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { 
        id: newUser._id, 
        email: newUser.email,
        firstname: newUser.firstname,
        lastname: newUser.lastname
      },
    });
  } catch (err) {
    console.error('Register Error:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
