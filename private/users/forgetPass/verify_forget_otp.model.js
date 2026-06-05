const { pool } = require("../../../dbhelper");
const { current_epoch_time } = require("../../methods/current_epoch_time");

const verify_forget_otp_model = async (email, otp) => {
  try {
    const currentTime = current_epoch_time();

    // Verify OTP from login_logs table
    const verifyOtpQuery = `
      SELECT * FROM login_logs
      WHERE email = $1 AND otp = $2
      AND (created_at <= $3 OR expire_at >= $3)
      ORDER BY created_at DESC LIMIT 1
    `;
    const verifyOtpValues = [email, otp, currentTime];
    const otpResult = await pool.query(verifyOtpQuery, verifyOtpValues);

    if (otpResult.rows.length === 0) {
      return {
        success: false,
        message: "Invalid or expired OTP",
      };
    }

    // Mark OTP as verified by setting a flag or updating expire_at to current time
    // This prevents reuse of the same OTP
    const updateOtpQuery = `
      UPDATE login_logs
      SET expire_at = $1
      WHERE email = $2 AND otp = $3
    `;
    const updateOtpValues = [currentTime, email, otp];
    await pool.query(updateOtpQuery, updateOtpValues);

    return {
      success: true,
      message: "OTP verified successfully",
    };
  } catch (error) {
    console.error("Error in verify_forget_otp_model:", error);
    return {
      success: false,
      message: "An error occurred while verifying OTP",
    };
  }
};

module.exports = {
  verify_forget_otp_model,
};
