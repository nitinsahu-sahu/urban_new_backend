const { delete_brand_model } = require("./delete_brand.model");

const delete_brand_controller = async (request, response, next) => {
  try {
    const brand_id = request.params.id;
    const res = await delete_brand_model(brand_id);
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
  delete_brand_controller,
};
