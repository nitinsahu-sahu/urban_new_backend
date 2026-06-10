// const axios = require("axios");

// const send_mail = async (email, otp) => {
//   try {
//     // Step 1: Send Email directly
//     const emailHtml = `<!DOCTYPE html>
//     <html xmlns="http://www.w3.org/1999/xhtml">

//     <head>
//       <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Verify your login</title>

//     </head>

//     <body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff; overflow: hidden;">
//       <table role="presentation"
//         style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);">
//         <tbody>
//           <tr>
//             <td align="center" style="padding: 1rem 2rem; vertical-align: top; width: 100%; height: 100vh;">
//               <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
//                 <tbody>
//                   <tr>
//                     <td style="padding: 40px 0px 0px;">
//                       <div style="text-align: left;">
//                         <div style="padding-bottom: 20px;">
//                           <!-- <img src="https://i.ibb.co/Qbnj4mz/logo.png" alt="Company" style="width: 56px;"></div> -->
//                       </div>
//                       <div style="padding: 20px; background-color: rgb(255, 255, 255);">
//                         <div style="color: rgb(0, 0, 0); text-align: left;">
//                           <h1 style="margin: 1rem 0">Verification code</h1>
//                           <p style="padding-bottom: 16px">Please use the verification code below to sign in.</p>
//                           <p style="padding-bottom: 16px"><strong style="font-size: 130%">${otp}</strong></p>
//                           <p style="padding-bottom: 16px">If you didn’t request this, you can ignore this email.</p>
//                       </div>
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             </td>
//           </tr>
//         </tbody>
//       </table>
//     </body>
//     </html>`;
//     const emailParams = {
//       app_id: "bbe652be-fe38-47cb-b781-34424893fafc", // Your OneSignal App ID
//       email_subject: "Welcome to Shri Ram Dental Depot! Your OTP!",
//       email_body: emailHtml,
//       include_email_tokens: [email], // Recipient's email address
//     };

//     const emailConfig = {
//       headers: {
//         "Content-Type": "application/json;charset=utf-8",
//         Authorization: "Basic OTZkZGU1MDYtODVjYy00MjViLTg0MzYtMDNiMDdlODgyZDhi", // Your REST API Key
//       },
//     };

//     const emailResponse = await axios.post(
//       "https://onesignal.com/api/v1/notifications",
//       emailParams,
//       emailConfig
//     );
//     return true; // Return true on success
//   } catch (error) {
//     console.error(
//       "Error sending email:",
//       error.response ? error.response.data : error.message
//     );
//     return false; // Return false on failure
//   }
// };
// send_mail("mandeepearth@gmail.com","4525")
// module.exports = {
//   send_mail,
// };

const nodemailer = require("nodemailer");

const send_mail = async (email, otp) => {
  try {
    // Create a Nodemailer transporter object
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465, // Use 465 for SSL
      secure: true, // Set to true if using port 465
      auth: {
        user: "Shriramdentaldepot2@gmail.com",
        pass: "aqlw xiex xdem zkdh",
      },
    });

    // Email HTML content
    const emailHtml = `<!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml">
    
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your login</title>
    
    </head>
    
    <body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff; overflow: hidden;">
      <table role="presentation"
        style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);">
        <tbody>
          <tr>
            <td align="center" style="padding: 1rem 2rem; vertical-align: top; width: 100%; height: 100vh;">
              <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
                <tbody>
                  <tr>
                    <td style="padding: 40px 0px 0px;">
                      <div style="text-align: left;">
                        <div style="padding-bottom: 20px;">
                          <!-- <img src="https://i.ibb.co/Qbnj4mz/logo.png" alt="Company" style="width: 56px;"></div> -->
                      </div>
                      <div style="padding: 20px; background-color: rgb(255, 255, 255);">
                        <div style="color: rgb(0, 0, 0); text-align: left;">
                          <h1 style="margin: 1rem 0">Verification code</h1>
                          <p style="padding-bottom: 16px">Please use the verification code below to sign in.</p>
                          <p style="padding-bottom: 16px"><strong style="font-size: 130%">${otp}</strong></p>
                          <p style="padding-bottom: 16px">If you didn’t request this, you can ignore this email.</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>`;

    // Define email options
    const mailOptions = {
      from: "Shriramdentaldepot2@gmail.com", // Replace with your email address
      to: email,
      subject: "Welcome to Shri Ram Dental Depot! Your OTP!",
      html: emailHtml,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    return true; // Return true on success
  } catch (error) {
    console.error("Error sending email:", error.message);
    return false; // Return false on failure
  }
};

// send_mail("mandeepearth@gmail.com", "4525");

const send_forget_password_mail = async (email, otp) => {
  try {
    // Create a Nodemailer transporter object
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465, // Use 465 for SSL
      secure: true, // Set to true if using port 465
      auth: {
        user: "Shriramdentaldepot2@gmail.com",
        pass: "aqlw xiex xdem zkdh",
      },
    });

    // Email HTML content for forget password
    const emailHtml = `<!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml">

    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset your password</title>

    </head>

    <body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff; overflow: hidden;">
      <table role="presentation"
        style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);">
        <tbody>
          <tr>
            <td align="center" style="padding: 1rem 2rem; vertical-align: top; width: 100%; height: 100vh;">
              <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
                <tbody>
                  <tr>
                    <td style="padding: 40px 0px 0px;">
                      <div style="text-align: left;">
                        <div style="padding-bottom: 20px;">
                          <!-- <img src="https://i.ibb.co/Qbnj4mz/logo.png" alt="Company" style="width: 56px;"></div> -->
                        </div>
                        <div style="padding: 20px; background-color: rgb(255, 255, 255);">
                          <div style="color: rgb(0, 0, 0); text-align: left;">
                            <h1 style="margin: 1rem 0">Password Reset Code</h1>
                            
                            <p style="padding-bottom: 16px">Please use the verification code below to reset your password:</p>
                            <p style="padding-bottom: 16px"><strong style="font-size: 130%">${otp}</strong></p>
                            <p style="padding-bottom: 16px">This code will expire in 5 minutes. If you didn't request a password reset, please ignore this email.</p>
                            <p style="padding-bottom: 16px">For security reasons, please do not share this code with anyone.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>`;

    // Define email options
    const mailOptions = {
      from: "Shriramdentaldepot2@gmail.com", // Replace with your email address
      to: email,
      subject: "Shri Ram Dental Depot - Password Reset OTP",
      html: emailHtml,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    return true; // Return true on success
  } catch (error) {
    console.error("Error sending forget password email:", error.message);
    return false; // Return false on failure
  }
};

module.exports = {
  send_mail,
  send_forget_password_mail,
};
