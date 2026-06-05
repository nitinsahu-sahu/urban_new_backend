const {
  update_product_rating_model,
} = require("./update_product_rating.model");
const { update_product_rating_auth } = require("../validation_product_ratings");

const update_product_rating_controller = async (req, res) => {
  try {
    await update_product_rating_auth.validateAsync(req.body);
    const { id, product_id, review_text, attachments, rate_by, starts } =
      req.body;
    const result = await update_product_rating_model(
      id,
      product_id,
      review_text,
      attachments,
      rate_by,
      starts
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(200).json({ success: false, error: error.message });
  }
};

module.exports = { update_product_rating_controller };
