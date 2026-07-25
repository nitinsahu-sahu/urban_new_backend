const {
  product_rating_active_model,
} = require("./product_rating_active.model");
const {
  product_rating_active_auth,
} = require("../validation_product_ratings");

const product_rating_active_controller = async (
  request,
  response,
  next
) => {
  try {
    await product_rating_active_auth.validateAsync(request.body);

    const { id, is_active } = request.body;

    const res = await product_rating_active_model(id, is_active);

    response.status(200).json(res);
  } catch (error) {
    console.error("Patch Error:", error);
    next(error);
    response.status(200).json({ success: false, error: error.message });
  }
};

module.exports = { product_rating_active_controller };
