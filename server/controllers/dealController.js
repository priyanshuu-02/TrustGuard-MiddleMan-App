const Deal = require('../models/Deal');
const User = require('../models/User');
const sendEmailOtp = require('../utils/sendEmailOtp');
const sendNotification = require('../utils/sendNotification');

// 🔐 Create Deal with Seller OTP Approval
exports.createDeal = async (req, res) => {
  const { itemName, amount, sellerUsername } = req.body;

  if (!itemName || !amount || !sellerUsername) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (typeof itemName !== 'string' || itemName.trim().length === 0 || itemName.trim().length > 50) {
    return res.status(400).json({ message: 'Invalid item name (1–50 characters)' });
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount < 1 || numericAmount > 100000) {
    return res.status(400).json({ message: 'Invalid amount (₹1–₹100000)' });
  }

  try {
    const buyerId = req.user?.id;
    if (!buyerId) return res.status(401).json({ message: 'Unauthorized' });

    const seller = await User.findOne({ username: sellerUsername.trim() });
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    const newDeal = new Deal({
      itemName: itemName.trim(),
      amount: numericAmount,
      buyerId,
      sellerId: seller._id,
      status: 'pending',
      otpForSellerApproval: otp,
      otpExpiry,
      otpVerified: false,
      otpGeneratedAt: new Date()
    });

    await newDeal.save();
    await sendEmailOtp(seller.email, otp, 10);

    res.status(201).json({ message: 'Deal created. Seller must approve using OTP.', dealId: newDeal._id });
  } catch (err) {
    console.error('❌ Deal creation error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 🗑️ Permanently Delete a Deal
exports.deleteDeal = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const deal = await Deal.findById(id).populate('buyerId sellerId');
    if (!deal) return res.status(404).json({ message: 'Deal not found' });

    const isBuyer = deal.buyerId._id.equals(userId);
    const isSeller = deal.sellerId._id.equals(userId);

    if (!isBuyer && !isSeller)
      return res.status(403).json({ message: 'Unauthorized' });

    // ❌ Block deletion ONLY if payment has been made or deal is no longer pending
    if (deal.paymentReceived || deal.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot delete this deal now — it has already progressed.' });
    }

    const otherUser = isBuyer ? deal.sellerId : deal.buyerId;
    const deletedBy = isBuyer ? 'Buyer' : 'Seller';

    // Permanently delete the deal
    await Deal.findByIdAndDelete(id);

    // 📧 Notify the other party
    try {
      if (otherUser.email) {
        await sendNotification(
          otherUser.email,
          '🚨 Deal Cancelled on TrustGuard',
          `${deletedBy} has cancelled the deal for item: <b>${deal.itemName}</b>. The deal has been deleted.`
        );
      }
    } catch (emailErr) {
      console.error('❌ Failed to send email notification:', emailErr.message);
    }

    return res.json({ message: '✅ Deal deleted and other party notified' });

  } catch (err) {
    console.error('❌ Server error while deleting deal:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};




// 🔁 Resend OTP
exports.resendOtp = async (req, res) => {
  const { dealId } = req.body;

  try {
    const deal = await Deal.findById(dealId);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });

    const now = new Date();
    const lastSent = deal.otpGeneratedAt || new Date(0);
    const secondsElapsed = (now - lastSent) / 1000;

    if (secondsElapsed < 60) {
      return res.status(429).json({ message: 'Please wait before requesting another OTP' });
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    deal.otpForSellerApproval = newOtp;
    deal.otpGeneratedAt = now;
    deal.otpExpiry = new Date(now.getTime() + 10 * 60 * 1000);
    await deal.save();

    const seller = await User.findById(deal.sellerId);
    if (seller?.email) {
      await sendEmailOtp(seller.email, newOtp, 10);
    }

    res.json({ message: 'OTP resent successfully' });
  } catch (err) {
    console.error('❌ Resend OTP error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Seller OTP Verification
exports.verifySellerOtp = async (req, res) => {
  const { dealId, otp } = req.body;

  try {
    const deal = await Deal.findById(dealId);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });

    if (deal.otpVerified) return res.status(400).json({ message: 'OTP already verified' });
    if (Date.now() > deal.otpExpiry) return res.status(400).json({ message: 'OTP expired' });
    if (deal.otpForSellerApproval !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    deal.otpVerified = true;
    await deal.save();
    res.json({ message: '✅ Seller OTP verified successfully' });
  } catch (err) {
    console.error('OTP Verification Error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 🪙 Payment by buyer
exports.payForDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    if (!deal.otpVerified) return res.status(403).json({ message: 'Seller approval pending' });
    if (deal.paymentReceived) return res.status(400).json({ message: 'Payment already made' });

    deal.paymentReceived = true;
    await deal.save();
    res.json({ message: '✅ Payment received', deal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🚚 Mark as shipped
exports.markAsShipped = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    if (!deal.otpVerified) return res.status(403).json({ message: 'Seller approval not verified' });

    deal.status = 'shipped';
    deal.itemShipped = true;
    await deal.save();
    res.json({ message: '📦 Marked as shipped', deal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📬 Mark as delivered
exports.markAsDelivered = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    if (!deal.otpVerified) return res.status(403).json({ message: 'Seller approval not verified' });

    deal.status = 'delivered';
    deal.itemReceived = true;
    deal.paymentConfirmed = true;
    await deal.save();
    res.json({ message: '📬 Marked as delivered, payment released', deal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🧾 Get buyer deals
exports.getBuyerDeals = async (req, res) => {
  try {
    const deals = await Deal.find({ buyerId: req.user.id });
    res.json(deals);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 🧾 Get seller deals
exports.getSellerDeals = async (req, res) => {
  try {
    const deals = await Deal.find({ sellerId: req.user.id });
    res.json(deals);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
