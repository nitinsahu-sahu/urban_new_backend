const { create_spacial_offer_model } = require("./create_spacial_offer_model");
const { create_spacial_offers_auth } = require("../validation_spacial_offers");

const create_spacial_offer_controller = async (req, res, next) => {
  try {
    await create_spacial_offers_auth.validateAsync(req.body);
    const result = await create_spacial_offer_model(
      req.body.banner_image,
      req.body.product_id,
      req.body.category_id,
      req.body.tittle,
      req.body.description,
      req.body.brand_id,
      req.body.publish,
      req.body.created_by
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = { create_spacial_offer_controller };
