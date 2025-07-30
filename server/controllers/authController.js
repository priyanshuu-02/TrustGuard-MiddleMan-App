require('dotenv').config();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmailOtp = require('../utils/sendEmailOtp');

// In-memory store for OTPs (for development only)

// ✅ REGISTER
const registerUser = async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    if (!username || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with same username, email or phone already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      phone,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: '✅ User registered successfully!' });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

// ✅ LOGIN with password (email or phone + password)
const loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Identifier and password are required' });
  }

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ✅ SEND OTP (for OTP-based login)

const otpStore = {};

const sendOtp = async (req, res) => {
  const { identifier } = req.body;

  if (!identifier) {
    return res.status(400).json({ message: 'Email or phone is required' });
  }

  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }]
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore[identifier] = otp;

  if (identifier.includes('@')) {
    try {
      await sendEmailOtp(identifier, otp);
      return res.json({ message: 'OTP sent to email' });
    } catch (err) {
      console.error('Failed to send email OTP:', err);
      return res.status(500).json({ message: 'Failed to send OTP via email' });
    }
  } else {
    console.log(`🛡️ OTP for ${identifier}: ${otp}`);
    return res.json({ message: 'OTP sent (check console in dev)' });
    // In production, replace this with SMS sending logic
  }
};


// ✅ VERIFY OTP
const verifyOtp = async (req, res) => {
  const { identifier, otp } = req.body;

  if (!identifier || !otp) {
    return res.status(400).json({ message: 'Identifier and OTP required' });
  }

  if (otpStore[identifier] !== otp) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }]
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

  delete otpStore[identifier];

  res.json({
    message: 'OTP login successful',
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone
    }
  });
};

// ✅ EXPORT all
module.exports = {
  registerUser,
  loginUser,
  sendOtp,
  verifyOtp
};
