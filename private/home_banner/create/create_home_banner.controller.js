const { create_home_banner_model } = require("./create_home_banner.model");
const { create_home_banner_auth } = require("../validation_home_banner");

const create_home_banner_controller = async (request, response, next) => {
  try {
    await create_home_banner_auth.validateAsync(request.body);
    const { is_active, banners, title, description } = request.body;

    const res = await create_home_banner_model(is_active, banners, title, description);
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
  create_home_banner_controller,
};
