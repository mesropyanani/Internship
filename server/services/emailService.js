require("dotenv").config();
const sgTransport = require("nodemailer-sendgrid-transport");

const nodemailer = require("nodemailer")
const sendEmail = async (subject , text) => {
  const transporter = nodemailer.createTransport(
    sgTransport({
      auth: {
        api_key: process.env.SENDGRID_API_KEY, 
      },
    })
  );
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to : process.env.EMAIL_USER,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };
