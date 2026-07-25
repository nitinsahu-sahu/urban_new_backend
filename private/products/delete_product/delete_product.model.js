const { pool } = require("../../../dbhelper");

const delete_product_model = async (product_id) => {
  try {
    const query = `DELETE FROM public.products
    WHERE product_id = $1 RETURNING *;`;
    const value = [product_id];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: `product deleted successfully.`,
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "product not updated!",
      };
    }
  } catch (err) {
    console.error("Error in createUserModel:", err);
    return {
      success: false,
      error: "An unexpected error occurred while processing the request.",
    };
  }
};

module.exports = {
  delete_product_model,
};
