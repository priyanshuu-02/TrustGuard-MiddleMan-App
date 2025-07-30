const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'shipped', 'delivered', 'completed'],
    default: 'pending',
  },
  paymentReceived: { type: Boolean, default: false },
  paymentConfirmed: { type: Boolean, default: false },
  itemShipped: { type: Boolean, default: false },
  itemReceived: { type: Boolean, default: false },
  itemName: { type: String, required: true },
  amount: { type: Number, required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  deletedByBuyer: {
    type: Boolean,
    default: false
  },
  deletedBySeller: {
    type: Boolean,
    default: false
  },
  // 🔐 OTP approval system
  otpForSellerApproval: { type: String },
  otpVerified: { type: Boolean, default: false },
  otpGeneratedAt: { type: Date },
  otpExpiry: { type: Date }
});


module.exports = mongoose.model('Deal', dealSchema);