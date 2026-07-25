const { update_products_model } = require("./update_products.model");
const { update_product_auth } = require("../validation_products");

const update_products_controller = async (request, response, next) => {
  try {
    await update_product_auth.validateAsync(request.body);

    const {
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
      updated_by = request.user.user_id,
      created_by = request.user.user_id,
      is_deleted,
      is_new_flag,
      is_top_flag,
      is_sale_flag,
      sku,
      sales_count,
    } = request.body;

    const res = await update_products_model(
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
    );

    response.status(200).json(res);
  } catch (error) {
    next(error);
    console.error("Error occurred in update controller:", error);
    response.status(200).json({ success: false, error: error.message });
  }
};

module.exports = {
  update_products_controller,
};
