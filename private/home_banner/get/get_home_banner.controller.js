const { get_home_banner_model } = require("./get_home_banner.model");

const get_home_banner_controller = async (request, response) => {
  try {
    const { banner_id, page, limit, search } = request.query;
    const res = await get_home_banner_model(banner_id, page, limit, search);
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
    console.error("Error occurred", error);
    response.status(200).json({ success: false, error: error.message });
  }
};

module.exports = {
  get_home_banner_controller,
};
