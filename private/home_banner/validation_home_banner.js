const Joi = require("joi");

const create_home_banner_auth = Joi.object({
  is_active: Joi.boolean().required(),
  banners: Joi.any().required(), // Can be string or JSON
  title: Joi.string().required(),
  description: Joi.string().required(),
});

const update_home_banner_auth = Joi.object({
  banner_id: Joi.number().required(),
  is_active: Joi.boolean().required(),
  banners: Joi.any().required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
});

module.exports = {
  create_home_banner_auth,
  update_home_banner_auth,
};
