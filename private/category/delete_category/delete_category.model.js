const { pool } = require("../../../dbhelper");

const delete_category_model = async (category_id) => {
  try {
    const query = `DELETE FROM public.category
    WHERE category_id = $1 RETURNING *;`;
    const value = [category_id];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: `category deleted successfully.`,
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "category not updated!",
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
  delete_category_model,
};
