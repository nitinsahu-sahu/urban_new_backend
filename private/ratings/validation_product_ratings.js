const Joi = require("joi");

const create_product_rating_auth = Joi.object({
  product_id: Joi.number().required(),
  review_text: Joi.string().allow(""),
  attachments: Joi.array().items(Joi.string().uri()).allow(null),
  rate_by: Joi.number().required(),
  starts: Joi.number().max(5).required(),
});

const update_product_rating_auth = Joi.object({
  id: Joi.number().required(),
  product_id: Joi.number().required(),
  review_text: Joi.string().allow(""),
  attachments: Joi.array().items(Joi.string().uri()).allow(null),
  rate_by: Joi.number().required(),
  starts: Joi.number().max(5).required(),
});

const product_rating_active_auth = Joi.object({
  id: Joi.number().required(),
  is_active: Joi.boolean().required(),
});

module.exports = {
  create_product_rating_auth,
  update_product_rating_auth,
  product_rating_active_auth,
};
