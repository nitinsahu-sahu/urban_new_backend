const { pool } = require("../../dbhelper");

const validateToken = async (authorizationHeader) => {
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    console.error("Invalid token");
    return {
      success: false,
      error: "Invalid Token",
      message: "Your session has expired. Please log in again to continue.",
    };
  }

  const token = authorizationHeader.substring(7);

  try {
    // Fetch email from login_logs and join with users to get user_id
    const query = `
      SELECT 
        ll.email, 
        u.user_id AS user_id
      FROM login_logs ll
      JOIN users u ON u.email = ll.email
      WHERE ll.web_token = $1 OR ll.app_token = $1
      LIMIT 1;
    `;

    const values = [token];
    const resss = await pool.query(query, values);

    if (resss.rows.length === 0) {
      return {
        success: false,
        error: "Invalid Token",
        message: "Your session has expired. Please log in again to continue.",
      };
    }

    return {
      success: true,
      email: resss.rows[0].email,
      user_id: resss.rows[0].user_id,
    };

  } catch (e) {
    console.error("DB error:", e);
    return {
      success: false,
      error: "Database Error",
      message: "Something went wrong. Please try again later.",
    };
  }
};

module.exports = {
  validateToken,
};
