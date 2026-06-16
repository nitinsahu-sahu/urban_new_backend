const discountModel = require('../../models/discount.model');
const { sendResponse } = require('../../utils/response');
const { pool } = require('../../../dbhelper');
const { check_in_cart_model } = require('../../orders/check_in_cart/check_in_cart_model');

exports.validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.user_id;
    
    // Step 1: Get cart items
    const cartQuery = `
      SELECT 
        o.*,
        json_array_elements(o.product) as product_item
      FROM orders o
      WHERE o.user_id = $1 
        AND o.status = 'IN_CART'
        AND o.is_deleted = false
    `;
    
    const cartResult = await pool.query(cartQuery, [userId]);
    
    if (cartResult.rows.length === 0) {
      return sendResponse(res, false, "Cart is empty", null, 400);
    }
    
    // Step 2: Calculate subtotal manually
    let subtotal = 0;
    const itemsForDiscount = [];
    
    for (const row of cartResult.rows) {
      const item = row.product_item;

      const price = parseFloat(item.price);
      const quantity = parseInt(item.product_quantity);
      subtotal += price * quantity;
      
      itemsForDiscount.push({
        productId: item.product_id,
        quantity: quantity,
        priceSnapshot: price
      });
    }
    
    // Step 3: Find discount
    const discountResult = await discountModel.getDiscountByCode(code);
    
    if (!discountResult.success || !discountResult.data) {
      return sendResponse(res, false, "Invalid or expired coupon code", null, 400);
    }
    
    const discount = discountResult.data;
    
    // Step 4: Check usage limit
    if (discount.usage_limit && discount.used_count >= discount.usage_limit) {
      return sendResponse(res, false, "Coupon usage limit exceeded", null, 400);
    }
    
    // Step 5: Check minimum order amount
    if (subtotal < discount.min_order_amount) {
      return sendResponse(res, false, 
        `Minimum order amount of ₹${discount.min_order_amount} required`, 
        null, 400);
    }
    
    // Step 6: Check user eligibility
    const eligibilityResult = await discountModel.checkUserEligibility(discount.id, userId);
    console.log("==>>",eligibilityResult);
    
    if (!eligibilityResult.success || !eligibilityResult.isEligible) {
      return sendResponse(res, false, 
        eligibilityResult.error || "You are not eligible for this coupon", 
        null, 400);
    }
    
    // Step 7: Calculate discount
    const discountCalculation = discountModel.calculateDiscount(
      discount, 
      subtotal, 
      itemsForDiscount
    );
    
    const discountAmount = discountCalculation.discountAmount;
    const finalAmount = discountCalculation.finalAmount;
    
    // Step 8: Return success
    return sendResponse(res, true, "Coupon applied successfully", {
      discountId: discount.id,
      code: discount.code,
      name: discount.name,
      discountType: discount.discount_type,
      discountValue: discount.discount_value,
      discountAmount: discountAmount,
      finalAmount: finalAmount,
      originalAmount: subtotal,
      savings: discountAmount,
      minOrderAmount: discount.min_order_amount,
      isValid: true
    }, 200);
    
  } catch (error) {
    console.error("Validate coupon error:", error);
    return sendResponse(res, false, error.message || "Server Error", null, 500);
  }
};

// Create discount (Admin)
exports.createDiscount = async (req, res) => {

    try {
        let data = req.body;

        // Normalize code
        if (!data.code) {
            return sendResponse(res, false, "Discount code is required", null, 400);
        }

        data.code = data.code.toUpperCase();

        // Check duplicate
        const existingDiscount = await discountModel.getDiscountByCode(data.code);
        if (existingDiscount.success && existingDiscount.data) {
            return sendResponse(res, false, "Discount code already exists", null, 409);
        }

        // Required fields check
        const requiredFields = ["name", "discountType", "discountValue", "endDate"];
        for (let field of requiredFields) {
            if (!data[field]) {
                return sendResponse(res, false, `${field} is required`, null, 400);
            }
        }

        // Validate discount type (only percentage and fixed)
        const validDiscountTypes = ["percentage", "fixed"];
        if (!validDiscountTypes.includes(data.discountType)) {
            return sendResponse(res, false, "Discount type must be either 'percentage' or 'fixed'", null, 400);
        }

        // Percentage validation
        if (data.discountType === "percentage" && data.discountValue > 100) {
            return sendResponse(res, false, "Percentage cannot exceed 100", null, 400);
        }

        // Fixed amount validation
        if (data.discountType === "fixed" && data.discountValue <= 0) {
            return sendResponse(res, false, "Fixed discount amount must be greater than 0", null, 400);
        }

        // Validate applicableTo - must be 'product'
        if (data.applicableTo && data.applicableTo !== 'product') {
            return sendResponse(res, false, "Discount can only be applied to products", null, 400);
        }

        // Validate applicableModel - must be 'product'
        if (data.applicableModel && data.applicableModel !== 'product') {
            return sendResponse(res, false, "Applicable model must be 'product'", null, 400);
        }

        // Date validation
        if (new Date(data.startDate) > new Date(data.endDate)) {
            return sendResponse(res, false, "Start date must be before end date", null, 400);
        }

        // Prepare discount data for PostgreSQL
        const discountData = {
            code: data.code,
            name: data.name,
            description: data.description || null,
            discount_type: data.discountType,
            discount_value: parseFloat(data.discountValue),
            applicable_to: 'product', // Force to product only
            applicable_ids: data.applicableIds || [], // Product IDs
            applicable_model: 'product', // Force to product only
            min_order_amount: parseFloat(data.minOrderAmount) || 0,
            max_discount_amount: data.maxDiscountAmount ? parseFloat(data.maxDiscountAmount) : null,
            usage_limit: data.usageLimit ? parseInt(data.usageLimit) : null,
            per_user_limit: data.perUserLimit ? parseInt(data.perUserLimit) : 1,
            eligible_users: data.eligibleUsers || [],
            excluded_users: data.excludedUsers || [],
            start_date: data.startDate || new Date(),
            end_date: data.endDate,
            is_active: data.isActive !== undefined ? data.isActive : true,
            stackable: data.stackable || false,
            priority: data.priority ? parseInt(data.priority) : 0,
            first_purchase_only: data.firstPurchaseOnly || false,
            new_user_only: data.newUserOnly || false,
            created_by: req.user.user_id,
            metadata: data.metadata || {}
        };

        // Create discount
        const result = await discountModel.createDiscount(discountData);

        if (!result.success) {
            return sendResponse(res, false, result.error || "Failed to create discount", null, 500);
        }

        return sendResponse(res, true, "Discount created successfully", result.data, 201);

    } catch (error) {
        console.error("Create discount error:", error);
        return sendResponse(res, false, error.message || "Server Error", null, 500);
    }
};

// Update discount (Admin)
exports.updateDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    // Convert camelCase to snake_case for database
    const dbUpdateData = {};

    if (updateData.code) {
      dbUpdateData.code = updateData.code.toUpperCase();
      
      // Check if new code conflicts with existing
      const existingDiscount = await discountModel.getDiscountByCode(dbUpdateData.code);
      if (existingDiscount.success && existingDiscount.data && existingDiscount.data.id !== parseInt(id)) {
        return sendResponse(res, false, "Discount code already exists", null, 409);
      }
      
    }

    // Map all possible fields
    const fieldMapping = {
      name: 'name',
      description: 'description',
      discountType: 'discount_type',
      discountValue: 'discount_value',
      minOrderAmount: 'min_order_amount',
      maxDiscountAmount: 'max_discount_amount',
      usageLimit: 'usage_limit',
      perUserLimit: 'per_user_limit',
      startDate: 'start_date',
      endDate: 'end_date',
      isActive: 'is_active',
      stackable: 'stackable',
      priority: 'priority',
      firstPurchaseOnly: 'first_purchase_only',
      newUserOnly: 'new_user_only',
      applicableTo: 'applicable_to',
      applicableModel: 'applicable_model',
      metadata: 'metadata'
    };

    for (const [key, dbKey] of Object.entries(fieldMapping)) {
      if (updateData[key] !== undefined) {
        dbUpdateData[dbKey] = updateData[key];
      }
    }

    // Handle array fields
    if (updateData.applicableIds) {
      dbUpdateData.applicable_ids = updateData.applicableIds;
    }
    if (updateData.eligibleUsers) {
      dbUpdateData.eligible_users = updateData.eligibleUsers;
    }
    if (updateData.excludedUsers) {
      dbUpdateData.excluded_users = updateData.excludedUsers;
    }

    // Handle buy_x_get_y
    if (updateData.buyXGetY) {
      if (updateData.buyXGetY.buyQuantity) {
        dbUpdateData.buy_quantity = updateData.buyXGetY.buyQuantity;
      }
      if (updateData.buyXGetY.getQuantity) {
        dbUpdateData.get_quantity = updateData.buyXGetY.getQuantity;
      }
      if (updateData.buyXGetY.applicableProductIds) {
        dbUpdateData.applicable_product_ids = updateData.buyXGetY.applicableProductIds;
      }
    }

    const result = await discountModel.updateDiscount(id, dbUpdateData);

    if (!result.success) {
      return sendResponse(res, false, result.error, null, 404);
    }

    return sendResponse(res, true, "Discount updated successfully", result.data, 200);

  } catch (error) {
    console.error("Update discount error:", error);
    return sendResponse(res, false, error.message || "Server Error", null, 500);
  }
};

// Get all discounts (Admin)
exports.getAllDiscounts = async (req, res) => {
    try {
        let { page = 1, limit = 20, isActive, search } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);
        if (limit > 100) limit = 100;

        const filters = {};

        if (isActive !== undefined) {
            filters.isActive = isActive === 'true';
        }

        if (search) {
            filters.search = search;
        }

        const result = await discountModel.getAllDiscounts(filters, page, limit);

        if (!result.success) {
            return sendResponse(res, false, result.error, null, 500);
        }

        return sendResponse(res, true, "Discounts fetched successfully", {
            total: result.data.total,
            page: result.data.page,
            limit: result.data.limit,
            totalPages: Math.ceil(result.data.total / limit),
            discounts: result.data.discounts
        }, 200);

    } catch (error) {
        console.error("Get all discounts error:", error);
        return sendResponse(res, false, error.message || "Server Error", null, 500);
    }
};

// Get discount by ID (Admin)
exports.getDiscountById = async (req, res) => {

    try {
        const result = await discountModel.getDiscountById(req.params.id);

        if (!result.success) {
            return sendResponse(res, false, result.error, null, 404);
        }
        // Get creator details
        const creatorQuery = 'SELECT user_id, full_name, email FROM users WHERE user_id = $1';

        const creatorResult = await pool.query(creatorQuery, [result.data.created_by]);

        // Get eligible users details
        let eligibleUsers = [];
        if (result.data.eligible_users && result.data.eligible_users.length > 0) {
            const usersQuery = `SELECT user_id, full_name, email FROM users WHERE user_id = ANY($1)`;
            const usersResult = await pool.query(usersQuery, [result.data.eligible_users]);
            eligibleUsers = usersResult.rows;
        }

        // Get excluded users details
        let excludedUsers = [];
        if (result.data.excluded_users && result.data.excluded_users.length > 0) {
            const usersQuery = `SELECT user_id, full_name, email FROM users WHERE user_id = ANY($1)`;
            const usersResult = await pool.query(usersQuery, [result.data.excluded_users]);
            excludedUsers = usersResult.rows;
        }

        const discountData = {
            ...result.data,
            createdBy: creatorResult.rows[0] || null,
            eligibleUsers: eligibleUsers,
            excludedUsers: excludedUsers,
            usageStats: {
                totalUsed: result.data.usageStats.totalUsed,
                totalDiscountGiven: result.data.usageStats.totalDiscountGiven,
                uniqueUsersCount: result.data.usageStats.uniqueUsers,
                remainingUses: result.data.usage_limit
                    ? result.data.usage_limit - result.data.used_count
                    : null
            }
        };

        return sendResponse(res, true, "Discount fetched successfully", discountData, 200);

    } catch (error) {
        console.error("Get discount by ID error:", error);
        return sendResponse(res, false, error.message || "Server Error", null, 500);
    }
};

