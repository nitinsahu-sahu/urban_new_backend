const Joi = require("joi");

const create_address_auth = Joi.object({
  pincode: Joi.number().required(),
  state: Joi.string().required(),
  city: Joi.string().required(),
  full_address: Joi.string().required(),
  user_id: Joi.number().required(),
});
const update_address_auth = Joi.object({
  address_id: Joi.number().required(),
  pincode: Joi.number().required(),
  state: Joi.string().required(),
  city: Joi.string().required(),
  full_address: Joi.string().required(),
});

module.exports = {
  create_address_auth,
  update_address_auth,
};
