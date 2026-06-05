const { pool } = require("../../../dbhelper");

const get_notification_model = async (
  not_id,
  is_active,
  page = 1,
  limit = 10,
  search,
  user_id
) => {
  try {
    let query = `
      SELECT n.*, COALESCE(inr.is_readed, false) AS is_readed, COUNT(*) OVER() as count
      FROM notification n
      LEFT JOIN public.is_noti_readed inr ON n.not_id = inr.noti_id AND inr.user_id = $${1}
      WHERE 1 = 1 AND (inr.is_deleted IS NULL OR inr.is_deleted = false)
    `;
    const values = [user_id];

    if (not_id) {
      query += ` AND n.not_id = $${values.length + 1}`;
      values.push(not_id);
    }
    if (is_active !== undefined) {
      query += ` AND n.is_active = $${values.length + 1}`;
      values.push(is_active);
    }
    if (search) {
      query += ` AND (n.title ILIKE $${values.length + 1} OR n.description ILIKE $${values.length + 2})`;
      values.push(`%${search}%`);
      values.push(`%${search}%`);
    }

    // Add pagination
    if (limit && page) {
      query += ` ORDER BY n.created_at DESC LIMIT $${values.length + 1} OFFSET $${
        values.length + 2
      }`;
      values.push(limit);
      values.push((page - 1) * limit);
    }

    const result = await pool.query(query, values);
    const count = result?.rows[0]?.count;

    if (result.rows.length === 0) {
      return {
        success: true,
        message: "No matching records found.",
        data: [],
        count,
      };
    }

    return {
      success: true,
      message: "Data retrieved successfully.",
      count,
      page,
      limit,
      data: result.rows,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "An unexpected error occurred while fetching notification data.",
      data: [],
      count: 0,
    };
  }
};

module.exports = {
  get_notification_model,
};
