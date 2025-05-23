const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Signup route
router.post('/signup', async (req, res) => {
  try {
    console.log('Signup request received:', req.body);
    const { email, name, password } = req.body;
    
    // Validate required fields
    if (!email || !name || !password) {
      console.log('Missing required fields:', { email, name, password: !!password });
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Validate email format
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Check if email already exists
    global.db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (user) {
        console.log('Email already in use:', email);
        return res.status(400).json({ message: 'Email already in use' });
      }
      
      try {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Generate UUID
        const id = uuidv4();
        
        // Insert user into database
        global.db.run(
          'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
          [id, name, email, hashedPassword],
          function(err) {
            if (err) {
              console.error('Insert error:', err.message);
              return res.status(500).json({ message: 'Failed to create user' });
            }
            
            // Generate JWT
            const token = jwt.sign(
              { id, email, name },
              process.env.JWT_SECRET || 'default_secret_key',
              { expiresIn: '24h' }
            );
            
            console.log('User created successfully:', { id, email });
            return res.status(201).json({ token });
          }
        );
      } catch (error) {
        console.error('Error during user creation:', error);
        return res.status(500).json({ message: 'Server error during user creation' });
      }
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Signin route
router.post('/signin', (req, res) => {
  try {
    console.log('Signin request received:', req.body);
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      console.log('Missing signin fields:', { email: !!email, password: !!password });
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user by email
    global.db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (!user) {
        console.log('User not found:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      try {
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
          console.log('Invalid password for user:', email);
          return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Generate JWT
        const token = jwt.sign(
          { id: user.id, email: user.email, name: user.name },
          process.env.JWT_SECRET || 'default_secret_key',
          { expiresIn: '24h' }
        );
        
        console.log('User logged in successfully:', email);
        return res.json({ token });
      } catch (error) {
        console.error('Error during password comparison:', error);
        return res.status(500).json({ message: 'Server error during authentication' });
      }
    });
  } catch (error) {
    console.error('Signin error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 