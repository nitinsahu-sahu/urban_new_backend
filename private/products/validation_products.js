const Joi = require("joi");

const variantSchema = Joi.object({
  variant_id: Joi.string().required(),
  variant_name: Joi.string().required(),
  variant_image: Joi.string().uri().required(),
  variant_sale_price: Joi.number().precision(2).required(),
  variant_actual_price: Joi.number().precision(2).required(),
});

const create_products_auth = Joi.object({
  product_name: Joi.string().required(),
  product_images: Joi.array().items(Joi.string().uri()).required(),
  product_disc: Joi.string().required(),
  product_sale_price: Joi.number().required(),
  product_actual_price: Joi.number().required(),
  category_id: Joi.number().required(),
  expire_date: Joi.number().required(),
  brand_id: Joi.number().required(),
  is_active: Joi.boolean().required(),
  product_variants: Joi.array().items(variantSchema).required(),
  status: Joi.string().optional(),
  updated_by: Joi.number().optional(),
  created_by: Joi.number().optional(),
  is_deleted: Joi.boolean().required(),
  is_new_flag: Joi.boolean().required(),
  is_top_flag: Joi.boolean().required(),
  is_sale_flag: Joi.boolean().required(),
  sku: Joi.string().required(),
  sales_count: Joi.number().optional(),
});

const update_product_auth = Joi.object({
  product_id: Joi.number().required(),
  product_name: Joi.string().required(),
  product_images: Joi.array().items(Joi.string().uri()).required(),
  product_disc: Joi.string().required(),
  product_sale_price: Joi.number().required(),
  product_actual_price: Joi.number().required(),
  category_id: Joi.number().required(),
  expire_date: Joi.number().required(),
  brand_id: Joi.number().required(),
  is_active: Joi.boolean().required(),
  product_variants: Joi.array().items(variantSchema).required(),
  status: Joi.string().optional(),
  updated_by: Joi.number().optional(),
  is_deleted: Joi.boolean().required(),
  is_new_flag: Joi.boolean().required(),
  is_top_flag: Joi.boolean().required(),
  is_sale_flag: Joi.boolean().required(),
  sku: Joi.string().required(),
  sales_count: Joi.number().optional(),
});

const active_product_auth = Joi.object({
  product_id: Joi.number().required(),
  is_active: Joi.boolean().required(),
});

module.exports = {
  create_products_auth,
  update_product_auth,
  active_product_auth,
};
