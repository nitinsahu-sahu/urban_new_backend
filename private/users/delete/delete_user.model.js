const { pool } = require("../../../dbhelper");

const delete_user_model = async (email) => {
  try {
    // Query to update the user if they are not already deleted
    const query = `
      UPDATE public.users
      SET is_deleted = true
      WHERE email = $1 AND is_deleted = false
      RETURNING *;
    `;
    const value = [email];
    const result = await pool.query(query, value);

    // Check if any rows were updated
    if (result.rows.length > 0) {
      return {
        success: true,
        message: "User deleted successfully.",
      };
    } else {
      // Handle the case where the user does not exist or is already deleted
      const checkQuery = `
        SELECT email FROM public.users
        WHERE email = $1;
      `;
      const checkResult = await pool.query(checkQuery, value);

      if (checkResult.rows.length === 0) {
        return {
          success: false,
          message: "User not found or already deleted",
        };
      } else {
        return {
          success: false,
          message: "User has already been deleted.",
        };
      }
    }
  } catch (err) {
    console.error("Error in delete_user_model:", err);
    return {
      success: false,
      error: "An unexpected error occurred while processing the request.",
    };
  }
};

module.exports = {
  delete_user_model,
};
