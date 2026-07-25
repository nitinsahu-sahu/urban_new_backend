const { pool } = require("../../../dbhelper");
const { random_number } = require("../../methods/random_number");
const { send_otp } = require("../../methods/otp");
const { current_epoch_time } = require("../../methods/current_epoch_time");

const create_user_model = async (email, is_active, is_deleted, access_type) => {
  try {
    const created_at = current_epoch_time();
    const user_id = random_number();

    // Check if the email exists in the database
    const check_mail_query = "SELECT * FROM users WHERE email = $1";
    const check_mail_value = [email];
    const check_mail_result = await pool.query(
      check_mail_query,
      check_mail_value
    );

    // Handle access type "WEB" for admin check
    if (access_type === "WEB") {
      const check_admin_query = "SELECT is_admin FROM users WHERE email = $1";
      const check_admin_result = await pool.query(
        check_admin_query,
        check_mail_value
      );
      if (
        check_admin_result.rows.length === 0 ||
        !check_admin_result.rows[0].is_admin
      ) {
        return {
          success: false,
          message: "You don't have admin access.",
        };
      }
    }

    // Check if the user already exists
    if (check_mail_result.rows.length > 0) {
      const existingUser = check_mail_result.rows[0];

      // If user is marked as deleted, handle it specifically
      if (existingUser.is_deleted) {
        return {
          success: false,
          message: "User not found or deleted",
        };
      }

      // If user is not deleted, send OTP
      const res = await send_otp(email, access_type);
      return res;
    } else {
      // Insert new user if they don't exist
      const query = `INSERT INTO public.users(
        email, created_at, is_active, is_deleted, user_id)
        VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
      const value = [email, created_at, is_active, is_deleted, user_id];
      const result = await pool.query(query, value);

      if (result.rows.length > 0) {
        const res = await send_otp(email, access_type);
        return {
          success: true,
          message: "User OTP sent and created successfully!",
          create_user: true,
        };
      } else {
        return {
          success: false,
          message: "User not created!",
          data: { email, is_active, is_deleted, access_type },
        };
      }
    }
  } catch (err) {
    console.error("Error in create_user_model:", err);
    return {
      success: false,
      error: "An unexpected error occurred while processing the request.",
    };
  }
};

module.exports = {
  create_user_model,
};
