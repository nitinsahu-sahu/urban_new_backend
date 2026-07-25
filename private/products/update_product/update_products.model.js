const { pool } = require("../../../dbhelper");
const { current_epoch_time } = require("../../methods/current_epoch_time");

const update_products_model = async (
  product_id,
  product_name,
  product_images,
  product_disc,
  product_key_feature,
  product_specification,
  product_packaging,
  product_sale_price,
  product_actual_price,
  category_id,
  expire_date,
  brand_id,
  is_active,
  product_variants,
  status,
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
    const updated_at = current_epoch_time();

    const query = `
      UPDATE public.products SET
        product_name = $2,
        product_images = $3,
        product_disc = $4,
        product_key_feature=$5,
        product_specification=$6,
        product_packaging=$7,
        product_sale_price = $8,
        product_actual_price = $9,
        category_id = $10,
        expire_date = $11,
        brand_id = $12,
        is_active = $13,
        product_variants = $14,
        status = $15,
        updated_at = $16,
        updated_by = $17,
        created_by = $18,
        is_deleted = $19,
        is_new_flag = $20,
        is_top_flag = $21,
        is_sale_flag = $22,
        sku = $23,
        sales_count = $24
      WHERE product_id = $1
      RETURNING *;`;

    const values = [
      product_id,
      product_name,
      product_images,
      product_disc,
      product_key_feature,
      product_specification,
      product_packaging,
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
      sales_count,
    ];

    const result = await pool.query(query, values);

    if (result.rows.length !== 0) {
      return {
        success: true,
        message: "Product updated successfully!",
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Product not found or update failed!",
      };
    }
  } catch (err) {
    console.error("Error in update_products_model:", err);
    return {
      success: false,
      error:
        err.message ||
        "An unexpected error occurred while processing the update.",
    };
  }
};

module.exports = {
  update_products_model,
};
