const { create_brand_model } = require("./create_brand.model");
const { create_brand_auth } = require("../validation_brand");

const create_brand_controller = async (request, response, next) => {
  try {
    await create_brand_auth.validateAsync(request.body);
    const { brand_name, brand_logo, category_id } = request.body;

    const res = await create_brand_model(brand_name, brand_logo, category_id);
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
  create_brand_controller,
};
