const Joi = require("joi");

const create_spacial_offers_auth = Joi.object({
  banner_image: Joi.string().uri().required(),
  product_id: Joi.number().allow(null),
  category_id: Joi.number().allow(null),
  tittle: Joi.string().required(),
  description: Joi.string().required(),
  brand_id: Joi.number().allow(null),
  publish: Joi.boolean().required(),
  created_by: Joi.number().required(),
});

const update_spacial_offers_auth = Joi.object({
  id: Joi.number().required(),
  banner_image: Joi.string().uri().required(),
  product_id: Joi.number().allow(null),
  category_id: Joi.number().allow(null),
  tittle: Joi.string().required(),
  description: Joi.string().required(),
  brand_id: Joi.number().allow(null),
  publish: Joi.boolean().required(),
  updated_by: Joi.number().required(),
});

module.exports = { create_spacial_offers_auth, update_spacial_offers_auth };
