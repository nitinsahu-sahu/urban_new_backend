const { pool } = require("../../../dbhelper");

const active_user_model = async (user_id, is_active) => {
  try {
    const query = `UPDATE public.users
    SET is_active = $2
    WHERE user_id = $1 AND is_deleted = false RETURNING *;`;
    const value = [user_id, is_active];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: `User ${
          is_active ? "active" : "Deactivate"
        } Successfully!`,
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "User not updated!",
        data: { user_id, is_active },
      };
    }
  } catch (err) {
    console.error("Error in createUserModel:", err);
    return {
      success: false,
      error: "An unexpected error occurred while processing the request.",
    };
  }
};

module.exports = {
  active_user_model,
};
