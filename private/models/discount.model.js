// models/discountModel.js
const { pool } = require("../../dbhelper");

const discountModel = {
    // Create discount
    createDiscount: async (discountData) => {
        
        try {
            const {
                code, name, description, discount_type, discount_value,
                applicable_to, applicable_ids, applicable_model,
                min_order_amount, max_discount_amount, usage_limit,
                per_user_limit, eligible_users, excluded_users,
                start_date, end_date, is_active, stackable, priority,
                first_purchase_only, new_user_only, created_by, metadata
            } = discountData;
console.log(created_by);

            // Count: 24 columns (including metadata)
            const query = `
        INSERT INTO discounts (
          code, name, description, discount_type, discount_value,
          applicable_to, applicable_ids, applicable_model,
          min_order_amount, max_discount_amount, usage_limit,
          per_user_limit, eligible_users, excluded_users,
          start_date, end_date, is_active, stackable, priority,
          first_purchase_only, new_user_only, created_by, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
        RETURNING *
      `;

            // 24 values matching the columns
            const values = [
                code,                           // $1
                name,                           // $2
                description,                    // $3
                discount_type,                  // $4
                discount_value,                 // $5
                applicable_to || 'product',     // $6
                applicable_ids || [],           // $7
                applicable_model || 'product',  // $8
                min_order_amount || 0,          // $9
                max_discount_amount || null,    // $10
                usage_limit || null,            // $11
                per_user_limit || 1,            // $12
                eligible_users || [],           // $13
                excluded_users || [],           // $14
                start_date,                     // $15
                end_date,                       // $16
                is_active !== undefined ? is_active : true,  // $17
                stackable || false,             // $18
                priority || 0,                  // $19
                first_purchase_only || false,   // $20
                new_user_only || false,         // $21
                created_by,                     // $22
                metadata || {}                  // $23
            ];

            const result = await pool.query(query, values);
            return { success: true, data: result.rows[0] };
        } catch (error) {
            console.error("Create discount error:", error);
            return { success: false, error: error.message };
        }
    },

    // Get discount by ID
    getDiscountById: async (id) => {
        try {
            const query = 'SELECT * FROM discounts WHERE id = $1 AND is_deleted = false';
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                return { success: false, error: "Discount not found" };
            }

            // Get usage statistics
            const statsQuery = `
        SELECT 
          COUNT(*) as total_used,
          SUM(discount_amount) as total_discount_given,
          COUNT(DISTINCT user_id) as unique_users
        FROM discount_usage 
        WHERE discount_id = $1 AND is_successful = true
      `;
            const statsResult = await pool.query(statsQuery, [id]);

            return {
                success: true,
                data: {
                    ...result.rows[0],
                    usageStats: {
                        totalUsed: parseInt(statsResult.rows[0].total_used),
                        totalDiscountGiven: parseFloat(statsResult.rows[0].total_discount_given) || 0,
                        uniqueUsers: parseInt(statsResult.rows[0].unique_users)
                    }
                }
            };
        } catch (error) {
            console.error("Get discount by ID error:", error);
            return { success: false, error: error.message };
        }
    },

    // Get discount by code
    getDiscountByCode: async (code) => {
        try {
            const query = `
        SELECT * FROM discounts 
        WHERE UPPER(code) = UPPER($1) 
          AND is_active = true 
          AND is_deleted = false
          AND start_date <= CURRENT_TIMESTAMP
          AND end_date >= CURRENT_TIMESTAMP
      `;

            const result = await pool.query(query, [code]);
            return { success: true, data: result.rows[0] || null };
        } catch (error) {
            console.error("Get discount by code error:", error);
            return { success: false, error: error.message };
        }
    },

    // Check user eligibility
    checkUserEligibility: async (discountId, userId) => {
        
        try {
            // Get discount details
            const discountQuery = 'SELECT * FROM discounts WHERE id = $1';
            const discountResult = await pool.query(discountQuery, [discountId]);

            if (discountResult.rows.length === 0) {
                return { success: false, error: "Discount not found" };
            }

            const discount = discountResult.rows[0];

            // Check if discount is valid
            const now = new Date();
            if (!discount.is_active || discount.is_deleted ||
                now < discount.start_date || now > discount.end_date) {
                return { success: false, error: "Discount is not valid" };
            }

            // Check usage limit
            if (discount.usage_limit && discount.used_count >= discount.usage_limit) {
                return { success: false, error: "Usage limit exceeded" };
            }

            // Check per user limit
            const userUsageQuery = `
        SELECT COUNT(*) as usage_count 
        FROM discount_usage 
        WHERE discount_id = $1 AND user_id = $2 AND is_successful = true
      `;
            const userUsageResult = await pool.query(userUsageQuery, [discountId, userId]);
            const userUsageCount = parseInt(userUsageResult.rows[0].usage_count);

            if (userUsageCount >= discount.per_user_limit) {
                return { success: false, error: "User usage limit exceeded" };
            }

            // Check eligible users
            if (discount.eligible_users && discount.eligible_users.length > 0) {
                if (!discount.eligible_users.includes(userId)) {
                    return { success: false, error: "User not eligible" };
                }
            }

            // Check excluded users
             if (discount.excluded_users && discount.excluded_users.length > 0) {
            const excludedUsers = Array.isArray(discount.excluded_users) 
                ? discount.excluded_users 
                : discount.excluded_users.replace(/[{}"]/g, '').split(',').map(u => u.trim());
            
            if (excludedUsers.includes(String(userId))) {
                return { success: false, error: "User excluded from discount" };
            }
        }

            // Check first purchase only
            if (discount.first_purchase_only) {
                const ordersQuery = `
          SELECT COUNT(*) as order_count 
          FROM orders 
          WHERE user_id = $1 
            AND status IN ('DELIVERED', 'COMPLETED')
            AND is_deleted = false
        `;
                const ordersResult = await pool.query(ordersQuery, [userId]);
                if (parseInt(ordersResult.rows[0].order_count) > 0) {
                    return { success: false, error: "First purchase only" };
                }
            }

            // Check new user only
            if (discount.new_user_only) {
                const newUserQuery = `
          SELECT COUNT(*) as order_count 
          FROM orders 
          WHERE user_id = $1 
            AND status = 'DELIVERED'
            AND is_deleted = false
        `;
                const newUserResult = await pool.query(newUserQuery, [userId]);
                if (parseInt(newUserResult.rows[0].order_count) > 0) {
                    return { success: false, error: "New users only" };
                }
            }

            return { success: true, isEligible: true, discount };
        } catch (error) {
            console.error("Check user eligibility error:", error);
            return { success: false, error: error.message };
        }
    },

    // Calculate discount
    calculateDiscount: (discount, amount, items = []) => {
        try {
            let discountAmount = 0;

            switch (discount.discount_type) {
                case 'percentage':
                    discountAmount = (amount * discount.discount_value) / 100;
                    if (discount.max_discount_amount) {
                        discountAmount = Math.min(discountAmount, discount.max_discount_amount);
                    }
                    break;

                case 'fixed':
                    discountAmount = Math.min(discount.discount_value, amount);
                    break;

                default:
                    return { success: false, error: "Invalid discount type" };
            }

            return {
                discountAmount: Math.round(discountAmount * 100) / 100,
                finalAmount: Math.max(0, amount - discountAmount),
            };
        } catch (error) {
            console.error("Calculate discount error:", error);
            return { success: false, error: error.message };
        }
    },

    // Record discount usage
    recordDiscountUsage: async (discountId, userId, orderId, discountAmount, originalAmount, finalAmount) => {
        try {
            const query = `
        INSERT INTO discount_usage (
          discount_id, user_id, order_id, discount_amount, 
          original_amount, final_amount
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

            const values = [discountId, userId, orderId, discountAmount, originalAmount, finalAmount];
            const result = await pool.query(query, values);

            // Update used count
            const updateQuery = `
        UPDATE discounts 
        SET used_count = used_count + 1 
        WHERE id = $1
      `;
            await pool.query(updateQuery, [discountId]);

            return { success: true, data: result.rows[0] };
        } catch (error) {
            console.error("Record discount usage error:", error);
            return { success: false, error: error.message };
        }
    },

    // Get all discounts (admin)
    getAllDiscounts: async (filters = {}, page = 1, limit = 20) => {
        try {
            const offset = (page - 1) * limit;
            let query = 'SELECT * FROM discounts WHERE is_deleted = false';
            let countQuery = 'SELECT COUNT(*) FROM discounts WHERE is_deleted = false';
            const values = [];
            let valueIndex = 1;

            if (filters.isActive !== undefined) {
                query += ` AND is_active = $${valueIndex}`;
                countQuery += ` AND is_active = $${valueIndex}`;
                values.push(filters.isActive);
                valueIndex++;
            }

            if (filters.search) {
                query += ` AND (code ILIKE $${valueIndex} OR name ILIKE $${valueIndex})`;
                countQuery += ` AND (code ILIKE $${valueIndex} OR name ILIKE $${valueIndex})`;
                values.push(`%${filters.search}%`);
                valueIndex++;
            }

            query += ` ORDER BY priority DESC, created_at DESC LIMIT $${valueIndex} OFFSET $${valueIndex + 1}`;
            values.push(limit, offset);

            const [discountsResult, countResult] = await Promise.all([
                pool.query(query, values),
                pool.query(countQuery, values.slice(0, -2))
            ]);

            return {
                success: true,
                data: {
                    discounts: discountsResult.rows,
                    total: parseInt(countResult.rows[0].count),
                    page,
                    limit
                }
            };
        } catch (error) {
            console.error("Get all discounts error:", error);
            return { success: false, error: error.message };
        }
    },

    // Get available coupons for user
    getAvailableCoupons: async (userId, cartTotal = 0) => {
        try {
            const query = `
        SELECT d.*, 
               (SELECT COUNT(*) FROM discount_usage du 
                WHERE du.discount_id = d.id 
                  AND du.user_id = $1 
                  AND du.is_successful = true) as user_usage_count
        FROM discounts d
        WHERE d.is_active = true
          AND d.is_deleted = false
          AND d.start_date <= CURRENT_TIMESTAMP
          AND d.end_date >= CURRENT_TIMESTAMP
          AND d.min_order_amount <= $2
          AND (d.usage_limit IS NULL OR d.used_count < d.usage_limit)
          AND (d.eligible_users = '{}' OR $1 = ANY(d.eligible_users))
          AND NOT ($1 = ANY(d.excluded_users))
          AND d.applicable_to = 'product'
          AND d.discount_type IN ('percentage', 'fixed')
        ORDER BY d.priority DESC
      `;

            const result = await pool.query(query, [userId, cartTotal]);

            // Filter out discounts where user has exceeded per_user_limit
            const eligibleDiscounts = result.rows.filter(discount =>
                parseInt(discount.user_usage_count) < discount.per_user_limit
            );

            return { success: true, data: eligibleDiscounts };
        } catch (error) {
            console.error("Get available coupons error:", error);
            return { success: false, error: error.message };
        }
    },

    // Update discount
    updateDiscount: async (id, updateData) => {
        try {
            const setClause = Object.keys(updateData)
                .map((key, index) => `${key} = $${index + 2}`)
                .join(', ');

            const values = [id, ...Object.values(updateData)];
            const query = `UPDATE discounts SET ${setClause} WHERE id = $1 AND is_deleted = false RETURNING *`;

            const result = await pool.query(query, values);

            if (result.rows.length === 0) {
                return { success: false, error: "Discount not found" };
            }

            return { success: true, data: result.rows[0] };
        } catch (error) {
            console.error("Update discount error:", error);
            return { success: false, error: error.message };
        }
    },

    // Delete discount (soft delete)
    deleteDiscount: async (id) => {
        try {
            const query = `
        UPDATE discounts 
        SET is_deleted = true, is_active = false 
        WHERE id = $1 
        RETURNING *
      `;

            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                return { success: false, error: "Discount not found" };
            }

            return { success: true, data: result.rows[0] };
        } catch (error) {
            console.error("Delete discount error:", error);
            return { success: false, error: error.message };
        }
    },

    // Toggle discount status
    toggleStatus: async (id) => {
        try {
            const query = `
        UPDATE discounts 
        SET is_active = NOT is_active 
        WHERE id = $1 AND is_deleted = false 
        RETURNING *
      `;

            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                return { success: false, error: "Discount not found" };
            }

            return { success: true, data: result.rows[0] };
        } catch (error) {
            console.error("Toggle discount status error:", error);
            return { success: false, error: error.message };
        }
    },

    // Get discount statistics
    getStats: async (period = 'month') => {
        try {
            let dateFilter;
            const now = new Date();

            switch (period) {
                case 'week':
                    dateFilter = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    dateFilter = new Date(now.setMonth(now.getMonth() - 1));
                    break;
                case 'year':
                    dateFilter = new Date(now.setFullYear(now.getFullYear() - 1));
                    break;
                default:
                    dateFilter = new Date(now.setMonth(now.getMonth() - 1));
            }

            // Overall stats
            const summaryQuery = `
        SELECT 
          COUNT(*) as total_discounts_used,
          SUM(discount_amount) as total_discount_amount,
          COUNT(DISTINCT user_id) as unique_users
        FROM discount_usage 
        WHERE used_at >= $1 AND is_successful = true
      `;
            const summaryResult = await pool.query(summaryQuery, [dateFilter]);

            // Top discounts
            const topDiscountsQuery = `
        SELECT 
          d.id,
          d.code,
          d.name,
          COUNT(*) as usage_count,
          SUM(du.discount_amount) as total_discount_amount
        FROM discount_usage du
        JOIN discounts d ON du.discount_id = d.id
        WHERE du.used_at >= $1 AND du.is_successful = true
        GROUP BY d.id, d.code, d.name
        ORDER BY usage_count DESC
        LIMIT 10
      `;
            const topDiscountsResult = await pool.query(topDiscountsQuery, [dateFilter]);

            // Daily usage
            const dailyUsageQuery = `
        SELECT 
          DATE(used_at) as date,
          COUNT(*) as count,
          SUM(discount_amount) as amount
        FROM discount_usage 
        WHERE used_at >= $1 AND is_successful = true
        GROUP BY DATE(used_at)
        ORDER BY date
        LIMIT 30
      `;
            const dailyUsageResult = await pool.query(dailyUsageQuery, [dateFilter]);

            return {
                success: true,
                data: {
                    summary: {
                        totalDiscountsUsed: parseInt(summaryResult.rows[0].total_discounts_used),
                        totalDiscountAmount: parseFloat(summaryResult.rows[0].total_discount_amount) || 0,
                        uniqueUsers: parseInt(summaryResult.rows[0].unique_users)
                    },
                    topDiscounts: topDiscountsResult.rows,
                    dailyUsage: dailyUsageResult.rows,
                    period
                }
            };
        } catch (error) {
            console.error("Get discount stats error:", error);
            return { success: false, error: error.message };
        }
    },

    // Get user's discount usage history
    getUserUsageHistory: async (userId, page = 1, limit = 20) => {
        try {
            const offset = (page - 1) * limit;

            const query = `
        SELECT 
          du.*,
          d.code as discount_code,
          d.name as discount_name,
          d.discount_type,
          d.discount_value
        FROM discount_usage du
        JOIN discounts d ON du.discount_id = d.id
        WHERE du.user_id = $1 AND du.is_successful = true
        ORDER BY du.used_at DESC
        LIMIT $2 OFFSET $3
      `;

            const countQuery = `
        SELECT COUNT(*) 
        FROM discount_usage 
        WHERE user_id = $1 AND is_successful = true
      `;

            const [result, countResult, totalSavingsResult] = await Promise.all([
                pool.query(query, [userId, limit, offset]),
                pool.query(countQuery, [userId]),
                pool.query(`
          SELECT COALESCE(SUM(discount_amount), 0) as total_savings
          FROM discount_usage 
          WHERE user_id = $1 AND is_successful = true
        `, [userId])
            ]);

            return {
                success: true,
                data: {
                    usages: result.rows,
                    total: parseInt(countResult.rows[0].count),
                    totalSavings: parseFloat(totalSavingsResult.rows[0].total_savings),
                    page,
                    limit
                }
            };
        } catch (error) {
            console.error("Get user usage history error:", error);
            return { success: false, error: error.message };
        }
    }
};

module.exports = discountModel;