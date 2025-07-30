const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  sendOtp,
  verifyOtp
} = require('../controllers/authController');

const { verifyToken } = require('../middleware/authMiddleware');
const User = require('../models/User');

// 🔐 Signup with username, email, phone, password
router.post('/signup', registerUser);

// 🔐 Login via email or phone + password
router.post('/login', loginUser);

// 🔐 OTP-based login routes (optional for now)
router.post('/send-otp', sendOtp);       // user sends email/phone to get OTP
router.post('/verify-otp', verifyOtp);   // user submits OTP for login

// 🔐 Authenticated profile access
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
