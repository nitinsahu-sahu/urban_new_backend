const { delete_product_model } = require("./delete_product.model");

const delete_product_controller = async (request, response, next) => {
  try {
    const product_id = request.params.id;
    const res = await delete_product_model(product_id);
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
  delete_product_controller,
};
