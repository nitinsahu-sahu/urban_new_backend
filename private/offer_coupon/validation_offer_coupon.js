const Joi = require("joi");

const create_offer_coupon_auth = Joi.object({
  code: Joi.string().required(),
  description: Joi.string().required(),
  term_and_condi: Joi.string().required(),
  created_by: Joi.number().required(),
  title: Joi.string().required(),
  expire_date: Joi.number().required(),
  one_time_use: Joi.boolean().required(),
  publish_date: Joi.number().required(),
  discount_type: Joi.string().valid('percent', 'flat').required(),
  discount_value: Joi.number().min(0).required(),
});

const update_offer_coupon_auth = Joi.object({
  id: Joi.number().required(),
  code: Joi.string().required(),
  description: Joi.string().required(),
  term_and_condi: Joi.string().required(),
  updated_by: Joi.number().required(),
  title: Joi.string().required(),
  expire_date: Joi.number().required(),
  one_time_use: Joi.boolean().required(),
  publish_date: Joi.number().required(),
  discount_type: Joi.string().valid('percent', 'flat').required(),
  discount_value: Joi.number().min(0).required(),
});


const publish_offer_coupon_auth = Joi.object({
  id: Joi.number().required(),
  publish: Joi.boolean().required(),
});

module.exports = {
  create_offer_coupon_auth,
  update_offer_coupon_auth,
  publish_offer_coupon_auth,
};
