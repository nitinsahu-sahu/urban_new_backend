const { get_spacial_offers_model } = require("./get_spacial_offers_model");

const get_spacial_offers_controller = async (req, res, next) => {
  try {
    const result = await get_spacial_offers_model();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
module.exports = { get_spacial_offers_controller };
