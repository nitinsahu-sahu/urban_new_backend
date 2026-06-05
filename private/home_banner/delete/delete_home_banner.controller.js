const { delete_home_banner_model } = require("./delete_home_banner.model");

const delete_home_banner_controller = async (request, response, next) => {
  try {
    const { banner_id } = request.params;

    const res = await delete_home_banner_model(banner_id);
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
  delete_home_banner_controller,
};
