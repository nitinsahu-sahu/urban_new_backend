const { delete_product_rating_model } = require("./delete_product_rating.model");

const delete_product_rating_controller = async (req, res) => {
  const id = req.params.id;
  const result = await delete_product_rating_model(id);
  res.status(200).json(result);
};

module.exports = { delete_product_rating_controller };