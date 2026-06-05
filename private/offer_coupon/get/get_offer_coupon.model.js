const { pool } = require("../../../dbhelper");

const get_offer_coupon_model = async () => {
  try {
    const query = `SELECT *, COUNT(*) OVER() as total_count FROM public.offer_coupon ORDER BY created_at DESC;`;
    const result = await pool.query(query);
    return {
      success: true,
      message: "Offer coupon fetched!",
      data: result.rows,
    };
  } catch (err) {
    console.error("Get Offer Coupon Error:", err);
    return {
      success: false,
      message: "Error fetching offer coupons",
      error: err.message,
    };
  }
};

module.exports = {
  get_offer_coupon_model,
};
