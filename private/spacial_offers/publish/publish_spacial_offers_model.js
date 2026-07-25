const { pool } = require("../../../dbhelper");

const update_publish_spacial_offers_model = async (id, publish) => {
  try {
    const query = `
      UPDATE public.spacial_offers
      SET publish = $2
      WHERE id = $1 AND is_deleted = false
      RETURNING *;
    `;
    const result = await pool.query(query, [id, publish]);

    if (result.rowCount === 0) {
      return {
        success: false,
        message: "Spacial offer not found or already deleted",
      };
    }

    return {
      success: true,
      message: "Publish status updated successfully",
      data: result.rows[0],
    };
  } catch (error) {
    console.error("Error updating publish:", error);
    return {
      success: false,
      error: "Failed to update publish status",
    };
  }
};

module.exports = { update_publish_spacial_offers_model };
