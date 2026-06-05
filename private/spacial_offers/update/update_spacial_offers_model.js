const { pool } = require("../../../dbhelper");
const { current_epoch_time } = require("../../methods/current_epoch_time");

const update_spacial_offers_model = async (
  id,
  banner_image,
  product_id,
  category_id,
  tittle,
  description,
  brand_id,
  publish,
  updated_by
) => {
  try {
    const updated_at = current_epoch_time();
    const query = `UPDATE public.spacial_offers SET 
      banner_image=$2, product_id=$3, category_id=$4, tittle=$5, description=$6, 
      brand_id=$7, publish=$8, updated_at=$9, updated_by=$10
      WHERE id=$1 AND is_deleted = false RETURNING *;`;

    const values = [
      id,
      banner_image,
      product_id,
      category_id,
      tittle,
      description,
      brand_id,
      publish,
      updated_at,
      updated_by,
    ];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return {
        success: false,
        message: "Spacial offer not found or already deleted",
      };
    }

    return {
      success: true,
      message: "Spacial offer updated successfully",
      data: result.rows[0],
    };
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false, error: error.message };
  }
};

module.exports = { update_spacial_offers_model };
