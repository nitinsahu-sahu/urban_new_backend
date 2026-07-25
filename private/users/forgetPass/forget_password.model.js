const { pool } = require("../../../dbhelper");
const { generateRandom4DigitNumber } = require("../../methods/ganerate_otp");
const { send_forget_password_mail } = require("../../methods/send_mail");
const { current_epoch_time } = require("../../methods/current_epoch_time");

const forget_password_model = async (email) => {
  try {
    // Check if user exists
    const userQuery = "SELECT user_id, email FROM users WHERE email = $1";
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return {
        success: false,
        message: "User with this email does not exist",
      };
    }

    // Generate OTP
    const otp = generateRandom4DigitNumber().toString();
    const currentTime = current_epoch_time();
    const expireTime = currentTime + (5 * 60 * 1000); // 5 minutes from now

    // Store OTP in login_logs table (upsert: insert or update if email exists)
    const insertOtpQuery = `
      INSERT INTO login_logs (email, otp, created_at, expire_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET
        otp = EXCLUDED.otp,
        created_at = EXCLUDED.created_at,
        expire_at = EXCLUDED.expire_at
    `;
    const insertOtpValues = [email, otp, currentTime, expireTime];

    await pool.query(insertOtpQuery, insertOtpValues);

    // Send OTP via email
    const emailSent = await send_forget_password_mail(email, otp);

    if (emailSent) {
      return {
        success: true,
        message: "OTP sent successfully",
      };
    } else {
      return {
        success: false,
        message: "Failed to send OTP email",
      };
    }
  } catch (error) {
    console.error("Error in forget_password_model:", error);
    return {
      success: false,
      message: "An error occurred while processing your request",
    };
  }
};

module.exports = {
  forget_password_model,
};
