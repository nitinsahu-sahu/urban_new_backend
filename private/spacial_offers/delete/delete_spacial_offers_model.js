const { pool } = require("../../../dbhelper");

const delete_spacial_offers_model = async (id) => {
  try {
    const query = `
      UPDATE public.spacial_offers
      SET is_deleted = true
      WHERE id = $1 AND is_deleted = false
      RETURNING *;
    `;
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      return {
        success: false,
        message: "Spacial offer not found or already deleted",
      };
    }

    return {
      success: true,
      message: "Spacial offer deleted successfully",
      data: result.rows[0],
    };
  } catch (error) {
    console.error("Error deleting offer:", error);
    return { success: false, error: "Failed to delete offer" };
  }
};

module.exports = { delete_spacial_offers_model };
