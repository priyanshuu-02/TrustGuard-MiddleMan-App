const express = require('express');
const router = express.Router();
const {
  createDeal,
  verifySellerOtp,
  resendOtp,
  payForDeal,
  markAsShipped,
  markAsDelivered,
  getBuyerDeals,
  getSellerDeals,
  deleteDeal
} = require('../controllers/dealController');


// Middleware to verify JWT token
const { verifyToken } = require('../middleware/authMiddleware');

// 📌 Deal creation and OTP flow
router.post('/create', verifyToken, createDeal);
router.post('/verify-otp', verifyToken, verifySellerOtp);
router.post('/resend-otp', verifyToken, resendOtp);

// 💸 Payment & Deal Progression
router.put('/:id/pay', verifyToken, payForDeal);
router.put('/:id/mark-shipped', verifyToken, markAsShipped);
router.put('/:id/mark-delivered', verifyToken, markAsDelivered);

// 📋 My deals
router.get('/my-buys', verifyToken, getBuyerDeals);
router.get('/my-sells', verifyToken, getSellerDeals);

//To delete a deal
router.delete('/:id/delete', verifyToken, deleteDeal);


module.exports = router;
