const { pool } = require("../../../dbhelper");
const { random_number } = require("../../methods/random_number");
const { current_epoch_time } = require("../../methods/current_epoch_time");
const bcrypt = require("bcryptjs");

const signup_user_model = async (full_name, email, password, phone) => {
  try {
    const created_at = current_epoch_time();
    const user_id = random_number();

    // Check if email already exists
    const check_mail_query = "SELECT * FROM users WHERE email = $1";
    const check_mail_value = [email];
    const check_mail_result = await pool.query(
      check_mail_query,
      check_mail_value
    );

    if (check_mail_result.rows.length > 0) {
      return {
        success: false,
        message: "User already exists with this email.",
      };
    }

    // Phone numbers are also unique account credentials. Validate them before
    // insertion so the app can show a clear message instead of a generic
    // signup failure from the database.
    const phoneResult = await pool.query(
      "SELECT user_id FROM users WHERE phone = $1 LIMIT 1",
      [phone]
    );

    if (phoneResult.rows.length > 0) {
      return {
        success: false,
        message: "This phone number is already in use. Please use another number.",
      };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const query = `
      INSERT INTO public.users (
        full_name,
        email,
        password,
        phone,
        created_at,
        is_active,
        is_deleted,
        user_id
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        true,
        false,
        $6
      )
      RETURNING *;
    `;

    const values = [
      full_name,
      email,
      hashedPassword,
      phone,
      created_at,
      user_id,
    ];

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

    if (err.code === "23505") {
      const isPhoneDuplicate =
        err.constraint?.toLowerCase().includes("phone") ||
        err.detail?.toLowerCase().includes("(phone)");
      return {
        success: false,
        message: isPhoneDuplicate
          ? "This phone number is already in use. Please use another number."
          : "User already exists with this email.",
      };
    }

    return {
      success: false,
      message: "Unable to create your account. Please try again.",
      error: err.message, // Debugging ke liye
    };
  }
};

module.exports = {
  signup_user_model,
};
