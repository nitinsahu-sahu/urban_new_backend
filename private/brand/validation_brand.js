const Joi = require("joi");

const create_brand_auth = Joi.object({
  brand_name: Joi.string().required(),
  brand_logo: Joi.string().uri().allow(null, ""),
  category_id: Joi.number().required(),
});

const update_brand_auth = Joi.object({
  brand_id: Joi.number().required(),
  brand_name: Joi.string().required(),
  brand_logo: Joi.string().uri().allow(null, ""),
  category_id: Joi.number().required(),
});

module.exports = {
  create_brand_auth,
  update_brand_auth,
};
