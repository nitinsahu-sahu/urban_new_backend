const { pool } = require("../../../dbhelper");

const delete_product_offers_model = async (offer_id) => {
  try {
    const query = `DELETE FROM public.product_offers
    WHERE offer_id = $1 RETURNING *;`;
    const value = [offer_id];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: `Product Offer deleted successfully.`,
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Product Offer not deleted!",
        data: { offer_id },
      };
    }
  } catch (err) {
    console.error("Error in delete_product_offers_model:", err);
    return {
      success: false,
      error: "An unexpected error occurred while processing the request.",
    };
  }
};

module.exports = {
  delete_product_offers_model,
};
