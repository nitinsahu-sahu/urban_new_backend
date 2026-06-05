const { pool } = require("../../../dbhelper");
const { current_epoch_time } = require("../../methods/current_epoch_time");
const { random_number } = require("../../methods/random_number");

const toggle_wishlist_model = async (user_id, product_id) => {
  try {
    const checkQuery = `SELECT * FROM wishlist WHERE user_id = $1 AND product_id = $2`;
    const checkRes = await pool.query(checkQuery, [user_id, product_id]);

    const currentTime = current_epoch_time();

    if (checkRes.rowCount > 0) {
      const is_wishlist = !checkRes.rows[0].is_wishlist;
      const updateQuery = `
        UPDATE wishlist 
        SET is_wishlist = $1, created_at = $2 
        WHERE id = $3 RETURNING *;
      `;
      const updateRes = await pool.query(updateQuery, [
        is_wishlist,
        currentTime,
        checkRes.rows[0].id,
      ]);
      return {
        success: true,
        message: is_wishlist ? "Added to wishlist" : "Removed from wishlist",
        data: updateRes.rows,
      };
    } else {
      const id = random_number();

      const insertQuery = `
        INSERT INTO wishlist(id, user_id, product_id, created_at, is_wishlist)
        VALUES ($4, $1, $2, $3, true)
        RETURNING *;
      `;
      const insertRes = await pool.query(insertQuery, [
        user_id,
        product_id,
        currentTime,
        id,
      ]);

      return {
        success: true,
        message: "Added to wishlist",
        data: insertRes.rows,
      };
    }
  } catch (err) {
    console.error("Error in toggle_wishlist_model:", err);
    return {
      success: false,
      error:
        "An unexpected error occurred while processing the wishlist toggle.",
    };
  }
};

module.exports = {
  toggle_wishlist_model,
};
