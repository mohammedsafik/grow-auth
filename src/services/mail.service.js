const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendMail = async ({ to, subject, text, html }) => {
  await transporter.sendMail({
    from: `"${process.env.MAIL_FROM}" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};

module.exports = {
  sendMail,
};