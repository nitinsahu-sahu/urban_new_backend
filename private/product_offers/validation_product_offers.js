const Joi = require("joi");

const create_product_offers_auth = Joi.object({
  product_id: Joi.number().required(),
  on_buy: Joi.number().min(1).required(),
  off_no: Joi.number().min(0).required(),
  off_type: Joi.string().valid('percentage', 'amount').required(),
  active: Joi.boolean().required(),
  buy_now: Joi.number().min(0).default(0),
  get_now: Joi.number().min(0).default(0),
});

const update_product_offers_auth = Joi.object({
  offer_id: Joi.number().required(),
  product_id: Joi.number().required(),
  on_buy: Joi.number().min(1).required(),
  off_no: Joi.number().min(0).required(),
  off_type: Joi.string().valid('percentage', 'amount').required(),
  active: Joi.boolean().required(),
  buy_now: Joi.number().min(0).default(0),
  get_now: Joi.number().min(0).default(0),
});

module.exports = {
  create_product_offers_auth,
  update_product_offers_auth,
};
