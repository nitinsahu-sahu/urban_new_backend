const { pool } = require("../../../dbhelper");

const update_home_banner_model = async (banner_id, is_active, banners, title, description) => {
  try {
    const query = `UPDATE public.home_bannner
    SET is_active=$2, banners=$3, title=$4, description=$5
    WHERE banner_id=$1 RETURNING *;`;
    const value = [banner_id, is_active, banners, title, description];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: "Home Banner updated Successfully!",
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Home Banner not updated!",
        data: {
          banner_id,
          is_active,
          banners,
          title,
          description,
        },
      };
    }
  } catch (err) {
    console.error("Error in update_home_banner_model:", err);
    return {
      success: false,
      error: "An unexpected error occurred while processing the request.",
    };
  }
};

module.exports = {
  update_home_banner_model,
};
