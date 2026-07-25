const { pool } = require("../../../dbhelper");

const update_app_default_model = async (
  id,
  splash_image_url,
  app_main_logo,
  after_splash_data,
  app_colors_theme,
  home_page_data,
  offer_coupon_page,
  app_version,
  about_app,
  copyright_line
) => {
  try {
    const query = `UPDATE public.app_default SET
      splash_image_url = $2,
      app_main_logo = $3,
      after_splash_data = $4,
      app_colors_theme = $5,
      home_page_data = $6,
      offer_coupon_page = $7,
      app_version = $8,
      about_app = $9,
      copyright_line = $10
      WHERE id = $1 RETURNING *;`;

    const values = [
      id,
      splash_image_url,
      app_main_logo,
      after_splash_data,
      app_colors_theme,
      home_page_data,
      offer_coupon_page,
      Number(app_version),
      about_app,
      copyright_line,
    ];

    const result = await pool.query(query, values);

    return result.rows.length > 0
      ? {
          success: true,
          message: "App Default Updated Successfully!",
          data: result.rows,
        }
      : { success: false, message: "App Default ID Not Found!" };
  } catch (err) {
    console.error("Error in update_app_default_model:", err);
    return {
      success: false,
      error: "An unexpected error occurred during update.",
    };
  }
};

module.exports = {
  update_app_default_model,
};
