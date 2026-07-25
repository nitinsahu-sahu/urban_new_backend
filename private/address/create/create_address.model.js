const { pool } = require("../../../dbhelper");
const { random_number } = require("../../methods/random_number");
const { current_epoch_time } = require("../../methods/current_epoch_time");

const create_address_model = async (
  pincode,
  state,
  city,
  full_address,
  user_id
) => {
  try {
    const address_id = random_number();
    const created_at = current_epoch_time();
    const query = `INSERT INTO public.address(
      address_id, pincode, state, city, full_address, created_at, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`;
    const value = [
      address_id,
      pincode,
      state,
      city,
      full_address,
      created_at,
      user_id,
    ];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: "Address Created Successfully!",
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Address not Created!",
        data: {
          pincode,
          state,
          city,
          full_address,
          user_id,
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
  create_address_model,
};
