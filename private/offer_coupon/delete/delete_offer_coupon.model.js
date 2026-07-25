const { pool } = require("../../../dbhelper");

const delete_offer_coupon_model = async (id) => {
  try {
    const query = `DELETE FROM public.offer_coupon WHERE id = $1;`;
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      return {
        success: false,
        message: "Coupon not found!",
      };
    }

    return {
      success: true,
      message: "Offer coupon deleted!",
    };
  } catch (err) {
    console.error("Delete Offer Coupon Error:", err);
    return { success: false, error: err.message };
  }
};

module.exports = {
  delete_offer_coupon_model,
};
