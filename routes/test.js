const nodemailer = require('nodemailer');

// Create a transporter using the provided credentials
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: 'processtest2@outlook.ph',
    pass: 'cwbomrdgiphyvvnz',
  },
});

// Define the email content
const mailOptions = {
  from: 'processtest2@outlook.ph',
  to: 'nekins213@gmail.com',
  subject: 'Hello from Nodemailer',
  text: 'Hello, this is a test email from Nodemailer!',
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error sending email:', error);
  } else {
    console.log('Email sent:', info.response);
  }
});