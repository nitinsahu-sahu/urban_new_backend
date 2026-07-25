const { update_brand_model } = require("./update_brand.model");
const { update_brand_auth } = require("../validation_brand");

const update_brand_controller = async (request, response, next) => {
  try {
    await update_brand_auth.validateAsync(request.body);
    const { brand_id, brand_name, brand_logo, category_id } = request.body;

    const res = await update_brand_model(
      brand_id,
      brand_name,
      brand_logo,
      category_id
    );
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
  update_brand_controller,
};
