const nodemailer = require("nodemailer");

// Create a transporter object using the Hostinger SMTP settings
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // Use 465 for SSL
  secure: true, // Set to true if using port 465
  auth: {
    user: "Shriramdentaldepot2@gmail.com",
    pass: "aqlw xiex xdem zkdh",
  },
});

// Setup email data
let mailOptions = {
  from: '"Your Name" Shriramdentaldepot2@gmail.com', // sender address
  to: "sharwanagarwal69@gmail.com", // list of receivers
  subject: "Hello ✔", // Subject line
  text: "Hello world?", // plain text body
  html: "<b>Hello world?</b>", // html body
};

// Send mail with defined transport object
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log(error);
  }
  console.log("Message sent: %s", info.messageId);
});
