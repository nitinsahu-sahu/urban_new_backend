const { update_home_banner_model } = require("./update_home_banner.model");
const { update_home_banner_auth } = require("../validation_home_banner");

const update_home_banner_controller = async (request, response, next) => {
  try {
    await update_home_banner_auth.validateAsync(request.body);
    const { banner_id, is_active, banners, title, description } = request.body;

    const res = await update_home_banner_model(banner_id, is_active, banners, title, description);
    if (res.success) {
      response.status(200).json({
        ...res,
      });
    } else {
      response.status(200).json({
        ...res,
      });
    }
  } catch (error) {
    next(error);
    console.error("Error occurred", error);
    response.status(200).json({ success: false, error: error.message });
  }
};

module.exports = {
  update_home_banner_controller,
};
