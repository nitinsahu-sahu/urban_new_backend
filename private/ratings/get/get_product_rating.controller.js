// controller
const { get_product_rating_model } = require("./get_product_rating.model");

const get_product_rating_controller = async (req, res) => {
  const { page, limit, product_id } = req.query;
  const result = await get_product_rating_model(page, limit, product_id);
  res.status(200).json(result);
};

module.exports = { get_product_rating_controller };
