const { update_spacial_offers_auth } = require("../validation_spacial_offers");
const { update_spacial_offers_model } = require("./update_spacial_offers_model");


const update_spacial_offers_controller = async (req, res, next) => {
  try {
    await update_spacial_offers_auth.validateAsync(req.body);
    const result = await update_spacial_offers_model(
      req.body.id,
      req.body.banner_image,
      req.body.product_id,
      req.body.category_id,
      req.body.tittle,
      req.body.description,
      req.body.brand_id,
      req.body.publish,
      req.body.updated_by
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
module.exports = { update_spacial_offers_controller };