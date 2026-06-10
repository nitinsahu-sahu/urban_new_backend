const { pool } = require("../../dbhelper");
const { current_epoch_time } = require("../methods/current_epoch_time");
const verify_otp_model = async (otp, email, access_type) => {
  try {
    const current_epoch = current_epoch_time();
    const check_otp_query = `SELECT ${
      access_type == "WEB" ? "web_token" : "app_token"
    } FROM login_logs WHERE otp = $1 AND email = $2 AND (created_at <= $3 OR expire_at >= $3)`;
    const check_otp_value = [otp, email, current_epoch];
    const check_otp_result = await pool.query(check_otp_query, check_otp_value);
    if (check_otp_result.rows.length != 0) {
      const is_user_query = "SELECT * from users where email = $1";
      const is_user_value = [email];
      const is_user_result = await pool.query(is_user_query, is_user_value);

      return {
        success: true,
        message: "otp verified successfully",
        token:
          check_otp_result.rows[0].web_token == null
            ? check_otp_result.rows[0].app_token
            : check_otp_result.rows[0].web_token,
        is_new_user:
          is_user_result.rows[0].full_name && is_user_result.rows[0].phone
            ? false
            : true,
        user_id: is_user_result.rows[0].user_id,
      };
    } else {
      return {
        success: false,
        message: "OTP Verification Failed Regenerate OTP",
        token: "",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "otp verification failed",
      token: "",
    };
  }
};
module.exports = {
  verify_otp_model,
};
