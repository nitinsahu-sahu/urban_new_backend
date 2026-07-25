const { pool } = require("../../../dbhelper");
const { random_number } = require("../../methods/random_number");
const { current_epoch_time } = require("../../methods/current_epoch_time");

const create_brand_model = async (brand_name, brand_logo, category_id) => {
  try {
    const brand_id = random_number();
    const created_at = current_epoch_time();
    const query = `INSERT INTO public.brand(
      brand_id, brand_name, created_at, brand_logo, category_id)
      VALUES ($1, $2, $3, $4,$5) RETURNING *;`;
    const value = [brand_id, brand_name, created_at, brand_logo,category_id];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: "Brand Created Successfully!",
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Brand not Created!",
        data: {
          brand_name,
          brand_logo,
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
  create_brand_model,
};
