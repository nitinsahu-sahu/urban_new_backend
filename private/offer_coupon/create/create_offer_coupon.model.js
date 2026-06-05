const { pool } = require("../../../dbhelper");
const { random_number } = require("../../methods/random_number");
const { current_epoch_time } = require("../../methods/current_epoch_time");

const create_offer_coupon_model = async (
  code,
  description,
  term_and_condi,
  created_by,
  title,
  expire_date,
  one_time_use,
  publish_date,
  discount_type,
  discount_value
) => {
  try {
    const id = random_number();
    const created_at = current_epoch_time();
    const query = `INSERT INTO public.offer_coupon (
      id, code, description, term_and_condi, created_at, created_by, title, expire_date, one_time_use, publish_date, discount_type, discount_value
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *;`;
    const values = [
      id,
      code,
      description,
      term_and_condi,
      created_at,
      created_by,
      title,
      expire_date,
      one_time_use,
      publish_date,
      discount_type,
      discount_value,
    ];
    const result = await pool.query(query, values);
    return {
      success: true,
      message: "Offer coupon created!",
      data: result.rows,
    };
  } catch (err) {
    console.error("Create Offer Coupon Error:", err);
    return { success: false, error: err.message };
  }
};

module.exports = {
  create_offer_coupon_model,
};
