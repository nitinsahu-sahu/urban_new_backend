const { pool } = require("../../../dbhelper");
const { random_number } = require("../../methods/random_number");
const { current_epoch_time } = require("../../methods/current_epoch_time");

const create_spacial_offer_model = async (
  banner_image,
  product_id,
  category_id,
  tittle,
  description,
  brand_id,
  publish,
  created_by
) => {
  try {
    const id = random_number();
    const created_at = current_epoch_time();
    const query = `INSERT INTO public.spacial_offers(
      id, banner_image, product_id, category_id, tittle, description, brand_id, publish, is_deleted, created_at, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, $9, $10) RETURNING *;`;

    const values = [
      id,
      banner_image,
      product_id,
      category_id,
      tittle,
      description,
      brand_id,
      publish,
      created_at,
      created_by,
    ];

    const result = await pool.query(query, values);
    return { success: true, data: result.rows };
  } catch (err) {
    console.error("Create Error:", err);
    return { success: false, error: "Failed to create spacial offer" };
  }
};

module.exports = { create_spacial_offer_model };
