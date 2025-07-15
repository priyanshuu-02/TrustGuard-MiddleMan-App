const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const nodemailer = require('nodemailer');

const sendNotification = async (email, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,       // e.g. your Gmail
      pass: process.env.EMAIL_PASS    // e.g. App Password from Gmail
    }
  });
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html: `<p>${message}</p>`
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendNotification;
