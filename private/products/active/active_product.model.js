const { pool } = require("../../../dbhelper");

const active_product_model = async (user_id, is_active) => {
  try {
    const query = `UPDATE public.products
    SET is_active = $2
    WHERE product_id = $1 RETURNING *;`;
    const value = [user_id, is_active];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: `product updated ${
          is_active ? "active" : "Deactivate"
        } Successfully!`,
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "product not updated!",
        data: { user_id, is_active },
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
  active_product_model,
};
