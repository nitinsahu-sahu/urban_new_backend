const { pool } = require("../../../dbhelper");
const { current_epoch_time } = require("../../methods/current_epoch_time");

const update_brand_model = async (brand_id, brand_name, brand_logo,category_id) => {
  try {
    const created_at = current_epoch_time();
    const query = `UPDATE public.brand
    SET  brand_name=$2, created_at=$3, brand_logo=$4,category_id=$5
    WHERE brand_id=$1 RETURNING *;`;
    const value = [brand_id, brand_name, created_at, brand_logo,category_id];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: "Brand updated Successfully!",
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Brand not updated!",
        data: {
          brand_id,
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
  update_brand_model,
};
