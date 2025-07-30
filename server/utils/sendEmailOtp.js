const nodemailer = require('nodemailer');

const sendEmailOtp = async (email, otp) => {
  const expiryTimeInMinutes = 10;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

    const mailOptions = {
        from: `"TrustGuard OTP" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your TrustGuard OTP Code',
        text: `Your OTP is: ${otp}\n\nThis OTP is valid for ${expiryTimeInMinutes} minutes. Do not share this code with anyone.`,
    };
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmailOtp;
