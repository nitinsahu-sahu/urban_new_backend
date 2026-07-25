const Joi = require("joi");

const toggle_wishlist_auth = Joi.object({
  user_id: Joi.number().required(),
  product_id: Joi.number().required(),
});

module.exports = {
  toggle_wishlist_auth,
};
