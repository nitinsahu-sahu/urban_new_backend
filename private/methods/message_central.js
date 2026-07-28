const axios = require("axios");

const sendPhoneOtp = async (phone) => {
  try {
    const response = await axios.post(
      "https://cpaas.messagecentral.com/verification/v3/send",
      null,
      {
        params: {
          customerId: process.env.MESSAGE_CENTRAL_CUSTOMER_ID,
          countryCode: process.env.MESSAGE_CENTRAL_COUNTRY_CODE,
          flowType: "SMS",
          mobileNumber: phone,
        },
        headers: {
          authToken: process.env.MESSAGE_CENTRAL_AUTH_TOKEN,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log("Status:", error.response?.status);
    console.log("Data:", error.response?.data);

    throw error;
  }
};

const verifyPhoneOtp = async (verificationId, otp) => {
  try {
    // Message Central exposes validateOtp as a GET endpoint. Sending a POST can
    // be rejected before the OTP is evaluated, even when the OTP is correct.
    const response = await axios.get(
      "https://cpaas.messagecentral.com/verification/v3/validateOtp",
      {
        params: {
          verificationId: String(verificationId),
          code: otp,
        },
        headers: {
          authToken: process.env.MESSAGE_CENTRAL_AUTH_TOKEN,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log("Message Central OTP verification failed:", {
      status: error.response?.status,
      response: error.response?.data,
    });

    throw error;
  }
};

module.exports = {
  sendPhoneOtp,
  verifyPhoneOtp,
};
