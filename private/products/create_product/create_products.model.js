const { pool } = require("../../../dbhelper");
const { random_number } = require("../../methods/random_number");
const { current_epoch_time } = require("../../methods/current_epoch_time");

const create_products_model = async (
  product_name,
  product_images,
  product_disc,
  product_sale_price,
  product_actual_price,
  category_id,
  expire_date,
  brand_id,
  is_active,
  product_variants,
  status,
  updated_at,
  updated_by,
  created_by,
  is_deleted,
  is_new_flag,
  is_top_flag,
  is_sale_flag,
  sku,
  sales_count
) => {
  try {
    const product_id = random_number();
    const created_at = current_epoch_time();

    const query = `INSERT INTO public.products(
      product_id, product_name, product_disc, product_sale_price, product_actual_price,
      category_id, expire_date, created_at, brand_id, is_active,
      product_images, product_variants, status, updated_at, updated_by,
      created_by, is_deleted, is_new_flag, is_top_flag, is_sale_flag,
      sku, sales_count)
    VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15,
      $16, $17, $18, $19, $20,
      $21, $22
    ) RETURNING *;`;

    const values = [
      product_id,
      product_name,
      product_disc,
      product_sale_price,
      product_actual_price,
      category_id,
      expire_date,
      created_at,
      brand_id,
      is_active,
      product_images,
      product_variants,
      status,
      updated_at,
      updated_by,
      created_by,
      is_deleted,
      is_new_flag,
      is_top_flag,
      is_sale_flag,
      sku,
      sales_count,
    ];

    const result = await pool.query(query, values);

    if (result.rows.length !== 0) {
      return {
        success: true,
        message: "Product Created Successfully!",
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Product not Created!",
        data: request.body,
      };
    }
  } catch (err) {
    console.error("Error in create_products_model:", err);
    return {
      success: false,
      error:
        err.message ||
        "An unexpected error occurred while processing the request.",
    };
  }
};

module.exports = {
  create_products_model,
};
