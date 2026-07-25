const { create_app_default_model } = require("./create_app_default_model");
const { create_app_default_auth } = require("../validation_app_default");

const create_app_default_controller = async (req, res, next) => {
  try {
    await create_app_default_auth.validateAsync(req.body);

    const {
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

    const result = await create_app_default_model(
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
    console.error("Error occurred:", error);
    res.status(200).json({ success: false, error: error.message });
  }
};

module.exports = {
  create_app_default_controller,
};
