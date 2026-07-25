const { pool } = require("../../../dbhelper");
const { current_epoch_time } = require("../../methods/current_epoch_time");

const update_address_model = async (
  address_id,
  pincode,
  state,
  city,
  full_address
) => {
  try {
    const query = `UPDATE public.address
    SET pincode=$2, state=$3, city=$4, full_address=$5
    WHERE address_id=$1 RETURNING *;`;
    const value = [address_id, pincode, state, city, full_address];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: "Address updated Successfully!",
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Address not updated!",
        data: {
          address_id,
          pincode,
          state,
          city,
          full_address,
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
  update_address_model,
};
