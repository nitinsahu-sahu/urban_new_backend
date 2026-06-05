const { pool } = require("../../../dbhelper");
const { random_number } = require("../../methods/random_number");
const { current_epoch_time } = require("../../methods/current_epoch_time");

const create_category_model = async (category_name, category_image) => {
  try {
    const category_id = random_number();
    const created_at = current_epoch_time();
    const query = `INSERT INTO public.category(
      category_id, category_name, category_image, created_at)
      VALUES ($1, $2, $3, $4) RETURNING *;`;
    const value = [category_id, category_name, category_image, created_at];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: "Category Created Successfully!",
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Category not Created!",
        data: {
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
  create_category_model,
};
