const { pool } = require("../../../dbhelper");
const { current_epoch_time } = require("../../methods/current_epoch_time");
const bcrypt = require("bcrypt");

const reset_password_model = async (email, otp, new_password) => {
  try {
    const currentTime = current_epoch_time();

    // Verify OTP from login_logs table (for forgot password flow, OTP should have been verified separately)
    // We still check if OTP exists and matches, but don't check expiry since it may have been marked as verified
    const verifyOtpQuery = `
      SELECT * FROM login_logs
      WHERE email = $1 AND otp = $2
      ORDER BY created_at DESC LIMIT 1
    `;
    const verifyOtpValues = [email, otp];
    const otpResult = await pool.query(verifyOtpQuery, verifyOtpValues);

    if (otpResult.rows.length === 0) {
      return {
        success: false,
        message: "Invalid OTP",
      };
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    // Update user's password
    const updatePasswordQuery = `
      UPDATE users
      SET password = $1
      WHERE email = $2
      RETURNING user_id
    `;
    const updatePasswordValues = [hashedPassword, email];
    const passwordResult = await pool.query(
      updatePasswordQuery,
      updatePasswordValues
    );

    if (passwordResult.rows.length === 0) {
      return {
        success: false,
        message: "Failed to update password",
      };
    }

    // Delete the used OTP from login_logs
    const deleteOtpQuery = `
      DELETE FROM login_logs
      WHERE email = $1 AND otp = $2
    `;
    const deleteOtpValues = [email, otp];
    await pool.query(deleteOtpQuery, deleteOtpValues);

    return {
      success: true,
      message: "Password reset successfully",
    };
  } catch (error) {
    console.error("Error in reset_password_model:", error);
    return {
      success: false,
      message: "An error occurred while resetting password",
    };
  }
};

module.exports = {
  reset_password_model,
};
