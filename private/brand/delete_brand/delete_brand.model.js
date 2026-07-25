const { pool } = require("../../../dbhelper");

const delete_brand_model = async (brand_id) => {
  try {
    const query = `DELETE FROM public.brand
    WHERE brand_id = $1 RETURNING *;`;
    const value = [brand_id];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: `Brand deleted successfully.`,
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Brand not delete!",
        data: { brand_id },
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
  delete_brand_model,
};
