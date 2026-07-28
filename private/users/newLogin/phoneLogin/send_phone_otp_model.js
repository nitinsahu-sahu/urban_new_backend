const { pool } = require("../../../../dbhelper");
const { sendPhoneOtp } = require("../../../methods/message_central");

const send_phone_otp_model = async (phone) => {
  try {
    // Check if phone exists
    const check_user_query =
      "SELECT user_id, full_name, phone FROM users WHERE phone = $1 AND is_deleted = false";

    const result = await pool.query(check_user_query, [phone]);

    if (result.rows.length === 0) {
      return {
        success: false,
        message: "Phone number is not registered.",
      };
    }

    const user = result.rows[0];

    // Send OTP using Message Central
    const otpResponse = await sendPhoneOtp(phone);

    return {
      success: true,
      message: "OTP Sent Successfully",
      verificationId: otpResponse.data.verificationId,
      transactionId: otpResponse.data.transactionId,
      data: user,
    };
  } catch (error) {
    console.error("Error in send_phone_otp_model:", error);

    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to send OTP.",
    };
  }
};

module.exports = {
  send_phone_otp_model,
};