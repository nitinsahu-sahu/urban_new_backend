const { pool } = require("../../../dbhelper");

const update_product_offers_model = async (
  offer_id,
  product_id,
  on_buy,
  off_no,
  off_type,
  active,
  buy_now,
  get_now
) => {
  try {
    const query = `UPDATE public.product_offers
    SET product_id=$2, on_buy=$3, off_no=$4, off_type=$5, active=$6, buy_now=$7, get_now=$8
    WHERE offer_id=$1 RETURNING *;`;
    const value = [
      offer_id,
      product_id,
      on_buy,
      off_no,
      off_type,
      active,
      buy_now,
      get_now,
    ];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: "Product Offer updated Successfully!",
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Product Offer not updated!",
        data: {
          offer_id,
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
    console.error("Error in update_product_offers_model:", err);
    return {
      success: false,
      error: "An unexpected error occurred while processing the request.",
    };
  }
};

module.exports = {
  update_product_offers_model,
};
