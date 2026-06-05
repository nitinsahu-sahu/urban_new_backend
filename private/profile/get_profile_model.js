const { pool } = require("../../dbhelper");
const jwt = require("jsonwebtoken");

const get_profile_model = async (authorizationHeader) => {
  try {
    const token = authorizationHeader.substring(7);

    const email = await jwt.verify(
      token,
      "deepak",
      async (error, decodedToken) => {
        if (error) {
          return {
            success: false,
            error: "Invalid token or Token Expired",
          };
        }

        if (!decodedToken || !decodedToken.email) {
          console.error("Invalid token");
          return {
            success: false,
            error: "Invalid Token",
            message:
              "Your session has expired. Please log in again to continue.",
          };
        }

        return decodedToken.email;
      }
    );

    const query = `
      SELECT 
        u.*, 
        COUNT(o.order_id) FILTER (
          WHERE o.status = 'IN_CART' AND o.is_deleted = false
        ) AS cart_count
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.user_id
      WHERE u.email = $1
      GROUP BY u.user_id
    `;
    const values = [email];

    const result = await pool.query(query, values);

    if (result.rowCount > 0) {
      result.rows[0].is_new_user =
        result.rows[0].full_name && result.rows[0].phone ? false : true;
        
      delete result.rows[0].password;

      return {
        success: true,
        message: "Profile data fetched successfully",
        data: result.rows,
      };
    } else {
      return {
        success: true,
        message: "Profile data Not Found",
        data: [],
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = { get_profile_model };
