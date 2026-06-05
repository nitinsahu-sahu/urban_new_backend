const { active_product_model } = require("./active_product.model");
const { active_product_auth } = require("../validation_products");

const active_product_controller = async (request, response) => {
  try {
    await active_product_auth.validateAsync(request.body);
    const { product_id, is_active } = request.body;

    const res = await active_product_model(product_id, is_active);
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
  active_product_controller,
};
