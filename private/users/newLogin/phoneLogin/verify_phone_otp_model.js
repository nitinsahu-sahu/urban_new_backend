const { verifyPhoneOtp } = require("../../../methods/message_central");

const verify_phone_otp_model = async (verificationId, otp) => {
  try {
    const response = await verifyPhoneOtp(verificationId, otp);

    return {
      success: true,
      message: "OTP Verified Successfully",
      data: response,
    };
  } catch (error) {
    console.error("Phone OTP verification failed:", {
      status: error.response?.status,
      response: error.response?.data,
      message: error.message,
    });

    return {
      success: false,
      status: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        error.message ||
        "OTP Verification Failed",
      data: error.response?.data || null,
    };
  }
};

module.exports = {
  verify_phone_otp_model,
};
