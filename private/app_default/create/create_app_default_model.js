const { pool } = require("../../../dbhelper");
const { current_epoch_time } = require("../../methods/current_epoch_time");
const { random_number } = require("../../methods/random_number");

const create_app_default_model = async (
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
    const id = random_number();
    const created_at = current_epoch_time();
    const query = `INSERT INTO public.app_default(
      id, splash_image_url, app_main_logo, after_splash_data, app_colors_theme,
      home_page_data, offer_coupon_page, app_version, about_app, copyright_line, created_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, $11) RETURNING *;`;

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
      created_at,
    ];

    const result = await pool.query(query, values);

    return result.rows.length > 0
      ? {
          success: true,
          message: "App Default Created Successfully!",
          data: result.rows,
        }
      : { success: false, message: "App Default Not Created!" };
  } catch (error) {
    console.error("Error in create_app_default_model:", error);
    return {
      success: false,
      error: "An unexpected error occurred while processing the request.",
    };
  }
};

module.exports = {
  create_app_default_model,
};
