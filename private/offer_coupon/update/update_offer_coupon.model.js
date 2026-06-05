const { pool } = require("../../../dbhelper");
const { current_epoch_time } = require("../../methods/current_epoch_time");

const update_offer_coupon_model = async (
  id,
  code,
  description,
  term_and_condi,
  title,
  expire_date,
  one_time_use,
  publish_date,
  discount_type,
  discount_value,
  updated_by
) => {
  try {
    const updated_at = current_epoch_time();

    const query = `
      UPDATE public.offer_coupon
      SET
        code=$2,
        description=$3,
        term_and_condi=$4,
        title=$5,
        expire_date=$6,
        one_time_use=$7,
        publish_date=$8,
        discount_type=$9,
        discount_value=$10,
        updated_at=$11,
        updated_by=$12
      WHERE id=$1
      RETURNING *;
    `;

    const values = [
      id,
      code,
      description,
      term_and_condi,
      title,
      expire_date,
      one_time_use,
      publish_date,
      discount_type,
      discount_value,
      updated_at,
      updated_by,
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return {
        success: false,
        message: "Coupon not found!",
      };
    }

    return {
      success: true,
      message: "Offer coupon updated!",
      data: result.rows[0],
    };
  } catch (err) {
    console.error("Update Offer Coupon Error:", err);
    return { success: false, error: err.message };
  }
};

module.exports = {
  update_offer_coupon_model,
};
