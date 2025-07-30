const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  phone:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  //role: { type: String, enum: ['buyer', 'seller'], required: true },
  kycVerified: { type: Boolean, default: false },
  balance: { type: Number, default: 0 } // Simulated wallet
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);
