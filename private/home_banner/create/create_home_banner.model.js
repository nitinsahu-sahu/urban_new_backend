const { pool } = require("../../../dbhelper");
const { random_number } = require("../../methods/random_number");
const { current_epoch_time } = require("../../methods/current_epoch_time");

const create_home_banner_model = async (is_active, banners, title, description) => {
  try {
    const banner_id = random_number();
    const created_at = current_epoch_time();
    const query = `INSERT INTO public.home_bannner(
      banner_id, is_active, banners, created_at, title, description)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`;
    const value = [banner_id, is_active, banners, created_at, title, description];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: "Home Banner Created Successfully!",
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Home Banner not Created!",
        data: {
          is_active,
          banners,
          title,
          description,
        },
      };
    }
  } catch (err) {
    console.error("Error in create_home_banner_model:", err);
    return {
      success: false,
      error: "An unexpected error occurred while processing the request.",
    };
  }
};

module.exports = {
  create_home_banner_model,
};
