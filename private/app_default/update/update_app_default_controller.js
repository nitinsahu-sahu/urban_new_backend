const { update_app_default_model } = require("./update_app_default_model");
const { update_app_default_auth } = require("../validation_app_default");

const update_app_default_controller = async (req, res, next) => {
  try {
    await update_app_default_auth.validateAsync(req.body);
    const {
      id,
      splash_image_url,
      app_main_logo,
      after_splash_data,
      app_colors_theme,
      home_page_data,
      offer_coupon_page,
      app_version,
      about_app,
      copyright_line,
    } = req.body;

    const result = await update_app_default_model(
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
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
    console.error("Update Error:", error);
    res.status(200).json({ success: false, error: error.message });
  }
};

module.exports = {
  update_app_default_controller,
};
