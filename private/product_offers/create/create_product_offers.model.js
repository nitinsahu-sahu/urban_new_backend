const { pool } = require("../../../dbhelper");
const { random_number } = require("../../methods/random_number");
const { current_epoch_time } = require("../../methods/current_epoch_time");

const create_product_offers_model = async (
  product_id,
  on_buy,
  off_no,
  off_type,
  active,
  buy_now,
  get_now
) => {
  try {
    const offer_id = random_number();
    const created_at = current_epoch_time();
    const query = `INSERT INTO public.product_offers(
      offer_id, product_id, on_buy, off_no, off_type, created_at, active, buy_now, get_now)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`;
    const value = [
      offer_id,
      product_id,
      on_buy,
      off_no,
      off_type,
      created_at,
      active,
      buy_now,
      get_now,
    ];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: "Product Offer Created Successfully!",
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Product Offer not Created!",
        data: {
          product_id,
          on_buy,
          off_no,
          off_type,
          active,
          buy_now,
          get_now,
        },
      };
    }
  } catch (err) {
    console.error("Error in create_product_offers_model:", err);
    return {
      success: false,
      error: "An unexpected error occurred while processing the request.",
    };
  }
};

module.exports = {
  create_product_offers_model,
};
