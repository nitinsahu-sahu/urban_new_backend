const axios = require("axios");

// Step 1: Add Email Subscriber
const addEmailParams = {
  app_id: "bbe652be-fe38-47cb-b781-34424893fafc", // Your OneSignal App ID
  identifier: "gupta.deepak909820@gmail.com", // Email address
  device_type: 11, // Device type 11 for email
};

const addEmailConfig = {
  headers: {
    "Content-Type": "application/json;charset=utf-8",
    Authorization: "Basic OTZkZGU1MDYtODVjYy00MjViLTg0MzYtMDNiMDdlODgyZDhi", // Your REST API Key
  },
};

axios
  .post("https://onesignal.com/api/v1/players", addEmailParams, addEmailConfig)
  .then((response) => {
    // Step 2: Send Email
    const emailParams = {
      app_id: "bbe652be-fe38-47cb-b781-34424893fafc", // Your OneSignal App ID
      email_subject: "Welcome to Cat Facts!",
      email_body: `
        <html>
          <head>
            <title>Welcome to Cat Facts</title>
          </head>
          <body>
            <h1>Welcome to Cat Facts</h1>
            <h4>Learn more about everyone's favorite furry companions!</h4>
            <hr/>
            <p>Hi Nick,</p>
            <p>Thanks for subscribing to Cat Facts! We can't wait to surprise you with funny details about your favorite animal.</p>
            <h5>Today's Cat Fact (March 27)</h5>
            <p>In tigers and tabbies, the middle of the tongue is covered in backward-pointing spines, used for breaking off and gripping meat.</p>
            <a href='https://catfac.ts/welcome'>Show me more Cat Facts</a>
            <hr/>
            <p><small>(c) 2018 Cat Facts, inc</small></p>
            <p><small><a href='[unsubscribe_url]'>Unsubscribe</a></small></p>
          </body>
        </html>
      `,
      include_email_tokens: ["gupta.deepak909820@gmail.com"], // Recipient's email address
    };

    const emailConfig = {
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: "Basic OTZkZGU1MDYtODVjYy00MjViLTg0MzYtMDNiMDdlODgyZDhi", // Your REST API Key
      },
    };

    axios
      .post(
        "https://onesignal.com/api/v1/notifications",
        emailParams,
        emailConfig
      )
      .then((response) => {
        console.log("Email sent successfully:", response.data);
      })
      .catch((error) => {
        if (error.response) {
          console.error("Error response data:", error.response.data);
          console.error("Error response status:", error.response.status);
          console.error("Error response headers:", error.response.headers);
        } else if (error.request) {
          console.error("Error request:", error.request);
        } else {
          console.error("Error message:", error.message);
        }
      });
  })
  .catch((error) => {
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    } else {
    }
  });
