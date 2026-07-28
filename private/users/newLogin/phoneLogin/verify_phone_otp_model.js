const { verifyPhoneOtp } = require("../../../methods/message_central");
const { pool } = require("../../../../dbhelper");
const { createLoginSession } = require("../newLogin_model");
const { isReviewOtp, reviewPhone } = require("./review_otp_config");

const verify_phone_otp_model = async (verificationId, otp) => {
  try {
    let verifiedMobileNumber;
    if (isReviewOtp(verificationId, otp)) {
      verifiedMobileNumber = reviewPhone();
    } else {
      const response = await verifyPhoneOtp(verificationId, otp);
      verifiedMobileNumber = response?.data?.mobileNumber;
    }

    if (!verifiedMobileNumber) {
      throw new Error("Message Central did not return a verified mobile number.");
    }

    const userResult = await pool.query(
      "SELECT * FROM users WHERE phone = $1 AND is_deleted = false",
      [String(verifiedMobileNumber)]
    );

    if (userResult.rows.length === 0) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const user = userResult.rows[0];
    const loginSession = await createLoginSession(user.email);

    if (!loginSession.success) {
      return {
        success: false,
        message: "An unexpected error occurred during login.",
      };
    }

    const { password, ...userData } = user;

    return {
      success: true,
      message: "Login Successful",
      token: loginSession.token,
      data: userData,
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
