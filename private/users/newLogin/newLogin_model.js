const { pool } = require("../../../dbhelper");
const bcrypt = require("bcryptjs");
const { current_epoch_time } = require("../../methods/current_epoch_time");
const { expire_epoch_time } = require("../../methods/current_epoch_time");
const jwt = require("jsonwebtoken");

const login_user_model = async (email, password, access_type) => {
  try {
    const created_at = current_epoch_time();
    const expire_at = expire_epoch_time();
    const token = generateToken(email);
    let send_mail_query;

    // Check if the email exists
    const check_user_query =
      "SELECT * FROM users WHERE email = $1 AND is_deleted = false";
    const values = [email];
    const result = await pool.query(check_user_query, values);

    if (result.rows.length === 0) {
      return {
        success: false,
        message: "Invalid credentials.",
      };
    }

    const user = result.rows[0];

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return {
        success: false,
        message: "Invalid credentials.",
      };
    }

    const check_mail_query = "SELECT * from login_logs WHERE email = $1";
    const check_mail_value = [email];
    const check_mail_result = await pool.query(
      check_mail_query,
      check_mail_value
    );
    if (check_mail_result.rows.length != 0) {
      send_mail_query = `UPDATE login_logs
        SET
          ${access_type == "WEB" ? "web_token" : "app_token"} = $2,
          created_at = $3 ,
          expire_at = $4
        WHERE
          email = $1
        RETURNING *;
        `;
    } else {
      send_mail_query = `INSERT INTO login_logs (email, ${
        access_type == "WEB" ? "web_token" : "app_token"
      }, created_at , expire_at)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `;
    }

    const send_mail_value = [email, token, created_at, expire_at];
    const send_mail_result = await pool.query(send_mail_query, send_mail_value);
    if (send_mail_result.rows != 0) {
      return {
        success: true,
        message: "Login successful.",
        data: {
          user_id: user.user_id,
          token,
        },
      };
    } else {
      return {
        success: false,
        error: "An unexpected error occurred during login.",
      };
    }
  } catch (err) {
    console.error("Error in login_user_model:", err);
    return {
      success: false,
      error: "An unexpected error occurred during login.",
    };
  }
};
const generateToken = (email) => {
  const token = jwt.sign({ email }, "deepak", { expiresIn: "30d" });
  return token;
};
module.exports = {
  login_user_model,
};
