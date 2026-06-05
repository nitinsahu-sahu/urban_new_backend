const { pool } = require("../../../dbhelper");

const get_orders_count_model = async (user_id) => {
  try {
    const values = [];
    let query = `
      SELECT 
        COUNT(*) FILTER (WHERE o.status = 'IN_PROCESS') AS ongoing,
        COUNT(*) FILTER (WHERE o.status = 'IN_WAY') AS delivery,
        COUNT(*) FILTER (WHERE o.status = 'DELIVERED') AS complete
      FROM orders o
      WHERE o.is_deleted = false
    `;

    if (user_id) {
      query += ` AND o.user_id = $1`;
      values.push(user_id);
    }

    const result = await pool.query(query, values);
    const counts = result.rows[0];
    console.log("Order counts fetched successfully:", counts);
    return {
      success: true,
      message: "Order counts fetched successfully.",
      data: {
        ongoing: parseInt(counts.ongoing, 10),
        delivery: parseInt(counts.delivery, 10),
        complete: parseInt(counts.complete, 10),
      },
    };
  } catch (error) {
    console.error("Error in get_orders_count_model:", error);
    return {
      success: false,
      message: "Failed to fetch order counts.",
      data: {
        ongoing: 0,
        delivery: 0,
        complete: 0,
      },
    };
  }
};

module.exports = {
  get_orders_count_model,
};
