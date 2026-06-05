const { pool } = require("../../../dbhelper");

const get_app_default_model = async () => {
  try {
    const result = await pool.query(
      "SELECT * FROM public.app_default ORDER BY created_at DESC LIMIT 1;"
    );
    return {
      success: true,
      message: "App default data fetched successfully",
      data: result.rows,
    };
  } catch (err) {
    console.error("Error in get_app_default_model:", err);
    return {
      success: false,
      error: "Failed to fetch app_default data.",
    };
  }
};

module.exports = {
  get_app_default_model,
};
