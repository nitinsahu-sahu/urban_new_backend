const Joi = require("joi");

const create_payment_auth = Joi.object({
  order_id: Joi.number().required(),
  trx_id: Joi.string().required(),
  amount: Joi.number().required(),
  status: Joi.string().required(),
  created_by: Joi.number().required(),
});

const update_payment_auth = Joi.object({
  payment_id: Joi.string().required(),
  order_id: Joi.number().optional(),
  trx_id: Joi.string().optional(),
  amount: Joi.number().optional(),
  status: Joi.string().optional(),
  updated_by: Joi.number().required(),
});

const update_status_auth = Joi.object({
  payment_id: Joi.string().required(),
  status: Joi.string().required(),
  updated_by: Joi.number().required(),
});

module.exports = {
  create_payment_auth,
  update_payment_auth,
  update_status_auth,
};
