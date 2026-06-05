const { pool } = require("../../../dbhelper");

const update_user_model = async (
  user_id,
  full_name,
  phone,
  is_active,
  is_deleted,
  profile_img
) => {
  try {
    const query = `UPDATE public.users
    SET full_name=$2, phone=$3, is_active=$4, is_deleted=$5, profile_img=$6
    WHERE user_id = $1 RETURNING *;`;
    const value = [
      user_id,
      full_name,
      phone,
      is_active,
      is_deleted,
      profile_img,
    ];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: "User updated Successfully!",
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "User not updated!",
        data: { user_id, full_name, phone, is_active, is_deleted },
      };
    }
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: "An unexpected error occurred while processing the request.",
    };
  }
};

module.exports = {
  update_user_model,
};
