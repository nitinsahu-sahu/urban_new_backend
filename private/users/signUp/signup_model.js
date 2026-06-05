const { pool } = require("../../../dbhelper");
const { random_number } = require("../../methods/random_number");
const { current_epoch_time } = require("../../methods/current_epoch_time");
const bcrypt = require("bcryptjs");

const signup_user_model = async (full_name, email, password) => {
  try {
    const created_at = current_epoch_time();
    const user_id = random_number();

    // Check if the email already exists
    const check_mail_query = "SELECT * FROM users WHERE email = $1";
    const check_mail_value = [email];
    const check_mail_result = await pool.query(check_mail_query, check_mail_value);

    if (check_mail_result.rows.length > 0) {
      return {
        success: false,
        message: "User already exists with this email.",
      };
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const query = `
      INSERT INTO public.users (
        full_name, email, password, created_at, is_active, is_deleted, user_id
      ) VALUES ($1, $2, $3, $4, true, false, $5)
      RETURNING *;
    `;
    const values = [full_name, email, hashedPassword, created_at, user_id];
    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      return {
        success: true,
        message: "User signed up successfully.",
        data: result.rows[0],
      };
    } else {
      return {
        success: false,
        message: "User sign-up failed.",
      };
    }
  } catch (err) {
    console.error("Error in signup_user_model:", err);
    return {
      success: false,
      error: "An unexpected error occurred during signup.",
    };
  }
};

module.exports = {
  signup_user_model,
};
