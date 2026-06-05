const Joi = require("joi");

const create_orders_auth = Joi.object({
  user_id: Joi.number().required(),
  product: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.number().required(),
        product_quantity: Joi.number().required(),
        price: Joi.number().required(),
        product_name: Joi.string().required(),
        product_image: Joi.string().uri().required(),
        product_desc: Joi.string().required(),
      })
    )
    .required(),
  item_quantity: Joi.number().required(),
  status: Joi.string()
    .valid("IN_WAY", "IN_CART", "IN_PROCESS", "DELIVERED")
    .required(),
  total_amount: Joi.number().required(),
  address_id: Joi.number().allow(null, ""),
});

const update_orders_auth = Joi.object({
  order_id: Joi.number().required(),
  product: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.number().required(),
        product_quantity: Joi.number().required(),
        price: Joi.number().required(),
        product_name: Joi.string().required(),
        product_image: Joi.string().uri().required(),
        product_desc: Joi.string().required(),
      })
    )
    .required(),
  item_quantity: Joi.number().required(),
  total_amount: Joi.number().required(),
});

const update_orders_status_auth = Joi.object({
  order_id: Joi.number().required(),
  status: Joi.string()
    .valid("IN_WAY", "IN_CART", "IN_PROCESS", "DELIVERED")
    .required(),
  address_id: Joi.number().required(),
});

const update_orders_quantity_auth = Joi.object({
  order_id: Joi.number().required(),
  quantity: Joi.number().required(),
});

const update_orders_address_auth = Joi.object({
  order_id: Joi.number().required(),
  address_id: Joi.number().required(),
});

module.exports = {
  create_orders_auth,
  update_orders_status_auth,
  update_orders_quantity_auth,
  update_orders_address_auth,
  update_orders_auth,
};
