const { pool } = require("../../../dbhelper");

const delete_address_model = async (address_id) => {
  try {
    const query = `DELETE FROM public.address
    WHERE address_id = $1 RETURNING *;`;
    const value = [address_id];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: `Address deleted successfully.`,
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Address not delete!",
        data: { address_id },
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
  delete_address_model,
};
