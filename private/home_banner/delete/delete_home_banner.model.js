const { pool } = require("../../../dbhelper");

const delete_home_banner_model = async (banner_id) => {
  try {
    const query = `DELETE FROM public.home_bannner
    WHERE banner_id = $1 RETURNING *;`;
    const value = [banner_id];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: `Home Banner deleted successfully.`,
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Home Banner not deleted!",
        data: { banner_id },
      };
    }
  } catch (err) {
    console.error("Error in delete_home_banner_model:", err);
    return {
      success: false,
      error: "An unexpected error occurred while processing the request.",
    };
  }
};

module.exports = {
  delete_home_banner_model,
};
