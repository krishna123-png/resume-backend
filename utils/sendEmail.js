const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, attachments = []) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"AI Resume App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    attachments,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

