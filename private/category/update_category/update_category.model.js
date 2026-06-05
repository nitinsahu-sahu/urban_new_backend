const { pool } = require("../../../dbhelper");
const { random_number } = require("../../methods/random_number");
const { current_epoch_time } = require("../../methods/current_epoch_time");

const update_category_model = async (
  category_id,
  category_name,
  category_image
) => {
  try {
    const created_at = current_epoch_time();
    const query = `UPDATE public.category
    SET  category_name=$2, category_image=$3, created_at=$4
    WHERE category_id=$1 RETURNING *;`;
    const value = [category_id, category_name, category_image, created_at];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: "Category updated Successfully!",
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Category not updated!",
        data: {
          category_id,
          category_name,
          category_image,
        },
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
  update_category_model,
};
