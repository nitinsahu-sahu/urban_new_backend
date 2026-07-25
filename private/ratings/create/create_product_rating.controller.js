const { create_product_rating_model } = require("./create_product_rating.model");
const { create_product_rating_auth } = require("../validation_product_ratings");

const create_product_rating_controller = async (req, res, next) => {
  try {
    await create_product_rating_auth.validateAsync(req.body);
    const { product_id, review_text, attachments, rate_by, starts } = req.body;
    const result = await create_product_rating_model(product_id, review_text, attachments, rate_by, starts);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in controller:", error);
    res.status(200).json({ success: false, error: error.message });
  }
};

module.exports = { create_product_rating_controller };
