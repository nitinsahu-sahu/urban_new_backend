const Joi = require("joi");

const create_category_auth = Joi.object({
  category_name: Joi.string().required(),
  category_image: Joi.string().uri().allow(null, ""),
});
const update_category_auth = Joi.object({
  category_id: Joi.number().required(),
  category_name: Joi.string().required(),
  category_image: Joi.string().uri().allow(null, ""),
});

module.exports = {
  create_category_auth,
  update_category_auth,
};
