const { sendResponse } = require("../../utils/response");
const { StandardCheckoutClient, Env } = require("@phonepe-pg/pg-sdk-node");

const {
  create_payment_model,
  get_payment_by_transaction_id_model,
  update_payment_status_model,
  update_payment_refund_model,
  get_user_payments_model,
  get_payment_by_id_model
} = require("../../models/payment.model");
const {
  verify_phonepe_signature,
  format_amount_to_paise,
  generate_refund_transaction_id,
  generate_merchant_transaction_id,
  generate_merchant_order_id
} = require("../../methods/payment/payment_methods");

// Initialize PhonePe Client dd
const get_phonepe_client = () => {
  const clientId = process.env.PHONEPE_CLIENT_ID;
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
  const clientVersion = parseInt(process.env.PHONEPE_CLIENT_VERSION);
  const env = process.env.NODE_ENV === 'production' ? Env.PRODUCTION : Env.SANDBOX;

  return StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);
};

// ================= CREATE ORDER =================
exports.create_order = async (req, res) => {
  try {
    const { amount, metadata, merchantOrderId} = req.body;
    const user = req.user;

    if (!user) {
      return sendResponse(res, false, "User not found", null, 404);
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return sendResponse(res, false, "Invalid amount", null, 400);
    }

    // Generate or use provided merchantOrderId
    const order_id = merchantOrderId || generate_merchant_order_id();

    const redirect_url = `http://localhost:3000/check-status?merchantOrderId=${order_id}`
    // Create payment record in database
    const payment_result = await create_payment_model(
      user.user_id,
      amount,
      process.env.PHONEPE_CALLBACK_URL,
      metadata || {},
      order_id
    );

    if (!payment_result.success) {
      return sendResponse(res, false, payment_result.message, null, 400);
    }

    const payment = payment_result.data;

    // Initialize PhonePe client
    const phonepe_client = get_phonepe_client();

    // ========== CORRECT PAYLOAD WITH paymentFlow ==========
    const order_payload = {
      merchantOrderId: payment.merchant_order_id,
      amount: format_amount_to_paise(amount),
      redirectUrl: redirect_url,
      paymentFlow: {
        type: "PG_CHECKOUT",  // ✅ REQUIRED: Payment flow type
        message: "Payment for order " + payment.merchant_order_id,
        merchantCallbackUrl: process.env.PHONEPE_CALLBACK_URL
      },
      disablePaymentRetry: false,
      merchantUserId: user.user_id,
      mobileNumber: user.mobile_number || ''
    };

    console.log("Order Payload:", JSON.stringify(order_payload, null, 2));

    // ========== CALL SDK METHOD ==========
    const phonepe_response = await phonepe_client.createSdkOrder(order_payload);
    console.log("PhonePe Create Order Response:", phonepe_response);


    // ========== CHECK RESPONSE ==========
    if (phonepe_response && phonepe_response.token) {
      // Update payment record with token
      await update_payment_status_model(
        payment.merchant_transaction_id,
        'PENDING',
        phonepe_response.token,
        phonepe_response
      );

      // PhonePe payment page URL - SANDBOX के लिए
      const phonepe_payment_url = `https://mercury-uat.phonepe.com/transact/pg?token=${phonepe_response.token}`;

      return sendResponse(res, true, "Order created successfully", {
        token: phonepe_response.token,
        order_id: payment.merchant_order_id,
        payment_id: payment.id,
        merchant_transaction_id: payment.merchant_transaction_id,
        amount: amount,
        expires_in: phonepe_response.expiresIn || 3600,
        payment_url: phonepe_payment_url
      }, 201);

    } else {
      // Agar token nahi mila
      await update_payment_status_model(
        payment.merchant_transaction_id,
        'FAILED',
        null,
        phonepe_response
      );

      return sendResponse(res, false, "Order creation failed - No token received", {
        phonepe_response: phonepe_response,
        merchant_transaction_id: payment.merchant_transaction_id
      }, 400);
    }

  } catch (error) {
    console.error("Order creation error:", error);

    // Better error handling
    let errorMessage = error.message;
    let statusCode = 500;

    if (error.httpStatusCode) {
      statusCode = error.httpStatusCode;
      errorMessage = `PhonePe Error (${error.code}): ${error.message}`;
    }

    return sendResponse(res, false, errorMessage, null, statusCode);
  }
};

// ================= INITIATE PAYMENT =================
exports.initiate_payment = async (req, res) => {
  try {
    const { amount, redirect_url, callback_url, metadata } = req.body;
    const user_id = req.user.user_id;

    // Validate amount
    if (!amount || amount <= 0) {
      return sendResponse(res, false, "Invalid amount", null, 400);
    }

    // Create payment record in database
    const payment_result = await create_payment_model(
      user_id,
      amount,
      callback_url || process.env.PHONEPE_CALLBACK_URL,
      metadata || {}
    );

    if (!payment_result.success) {
      return sendResponse(res, false, payment_result.message, null, 400);
    }

    const payment = payment_result.data;

    // Initialize PhonePe client
    const phonepe_client = get_phonepe_client();

    // Create payment request payload
    const payload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId: payment.merchant_transaction_id,
      merchantUserId: user_id,
      amount: format_amount_to_paise(amount),
      redirectUrl: redirect_url || `${process.env.FRONTEND_URL}/payment/status`,
      redirectMode: 'REDIRECT',
      callbackUrl: callback_url || process.env.PHONEPE_CALLBACK_URL,
      mobileNumber: req.user.mobile_number || '',
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    // Initiate payment with PhonePe
    const phonepe_response = await phonepe_client.pay(payload);

    // ========== CHECK IF RESPONSE HAS redirectUrl ==========
    if (phonepe_response && phonepe_response.redirectUrl) {
      // Update payment record with response
      await update_payment_status_model(
        payment.merchant_transaction_id,
        'PENDING',
        phonepe_response.orderId || null,
        phonepe_response
      );

      return sendResponse(res, true, "Payment initiated successfully", {
        payment_url: phonepe_response.redirectUrl,
        order_id: phonepe_response.orderId,
        state: phonepe_response.state,
        expire_at: phonepe_response.expireAt,
        merchant_transaction_id: payment.merchant_transaction_id,
        merchant_order_id: payment.merchant_order_id,
        payment_id: payment.id
      }, 200);
    } else if (phonepe_response && phonepe_response.success) {
      // Fallback: agar success field hai
      return sendResponse(res, true, "Payment initiated successfully", {
        payment_url: phonepe_response.data?.instrumentResponse?.redirectInfo?.url || phonepe_response.redirectUrl,
        merchant_transaction_id: payment.merchant_transaction_id,
        merchant_order_id: payment.merchant_order_id,
        payment_id: payment.id
      }, 200);
    } else {
      // Payment initiation failed
      await update_payment_status_model(
        payment.merchant_transaction_id,
        'FAILED',
        null,
        phonepe_response
      );

      return sendResponse(res, false, "Payment initiation failed", {
        error_details: phonepe_response,
        merchant_transaction_id: payment.merchant_transaction_id
      }, 400);
    }

  } catch (error) {
    console.error("Payment initiation error:", error);
    return sendResponse(res, false, error.message, null, 500);
  }
};

// ================= CHECK ORDER STATUS =================
exports.check_order_status = async (req, res) => {
  try {
    const { merchant_transaction_id, details } = req.params;

    const payment_result = await get_payment_by_transaction_id_model(merchant_transaction_id);

    if (!payment_result.success) {
      return sendResponse(res, false, "Payment not found", null, 404);
    }

    const payment = payment_result.data;
    const phonepe_client = get_phonepe_client();
    console.log("phonepe_client", phonepe_client);

    const phonepe_response = await phonepe_client.getOrderStatus(merchant_transaction_id);
    console.log("Status Response:", phonepe_response);

    // Response me state directly available hai
    const state = phonepe_response.state || phonepe_response.data?.state;

    if (state) {
      // Map PhonePe status to our status
      let payment_status;
      switch (state) {
        case 'COMPLETED':
          payment_status = 'SUCCESS';
          break;
        case 'FAILED':
          payment_status = 'FAILED';
          break;
        case 'CANCELLED':
          payment_status = 'CANCELLED';
          break;
        default:
          payment_status = 'PENDING';
      }

      const update_result = await update_payment_status_model(
        merchant_transaction_id,
        payment_status,
        phonepe_response.transactionId || phonepe_response.orderId,
        phonepe_response
      );

      return sendResponse(res, true, "Order status retrieved", {
        status: payment_status,
        state: state,
        order_id: phonepe_response.orderId,
        payment_details: update_result.data
      }, 200);
    } else {
      return sendResponse(res, false, "Failed to get order status", phonepe_response, 400);
    }

  } catch (error) {
    console.error("Check order status error:", error);
    return sendResponse(res, false, error.message, null, 500);
  }
};

// ================= INITIATE REFUND =================
exports.initiate_refund = async (req, res) => {
  try {
    const { merchant_transaction_id, amount, reason } = req.body;

    // Get original payment
    const payment_result = await get_payment_by_transaction_id_model(merchant_transaction_id);

    if (!payment_result.success) {
      return sendResponse(res, false, "Payment not found", null, 404);
    }

    const payment = payment_result.data;

    if (payment.status !== 'SUCCESS') {
      return sendResponse(res, false, "Payment not eligible for refund", null, 400);
    }

    const refund_transaction_id = generate_refund_transaction_id(merchant_transaction_id);

    const phonepe_client = get_phonepe_client();

    const refund_payload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      originalMerchantTransactionId: merchant_transaction_id,
      merchantRefundId: refund_transaction_id,
      amount: format_amount_to_paise(amount),
      callbackUrl: process.env.PHONEPE_REFUND_CALLBACK_URL
    };

    const phonepe_response = await phonepe_client.refund(refund_payload);

    if (phonepe_response.success) {
      // Update payment metadata with refund details
      let current_metadata = payment.metadata || {};
      let refunds = current_metadata.refunds || [];

      refunds.push({
        refund_transaction_id,
        amount: format_amount_to_paise(amount),
        reason: reason || '',
        status: 'INITIATED',
        timestamp: new Date().toISOString()
      });

      current_metadata.refunds = refunds;

      const update_result = await update_payment_refund_model(
        merchant_transaction_id,
        current_metadata
      );

      return sendResponse(res, true, "Refund initiated successfully", {
        refund_transaction_id,
        original_transaction_id: merchant_transaction_id,
        amount: amount
      });
    } else {
      return sendResponse(res, false, "Refund initiation failed", phonepe_response, 400);
    }

  } catch (error) {
    console.error("Refund initiation error:", error);
    return sendResponse(res, false, error.message, null, 500);
  }
};

// ================= VERIFY REFUND =================
exports.verify_refund = async (req, res) => {
  try {
    const { refund_transaction_id } = req.params;

    const phonepe_client = get_phonepe_client();
    const phonepe_response = await phonepe_client.getRefundStatus(refund_transaction_id);

    if (phonepe_response.success) {
      // Find payment with this refund
      const query = `
        SELECT * FROM payments 
        WHERE metadata->'refunds' @> $1::jsonb
        AND is_active = true 
        AND is_deleted = false
      `;
      const values = [JSON.stringify([{ refund_transaction_id }])];
      const result = await pool.query(query, values);

      if (result.rows.length > 0) {
        const payment = result.rows[0];
        let metadata = payment.metadata || {};
        let refunds = metadata.refunds || [];

        const refund_index = refunds.findIndex(r => r.refund_transaction_id === refund_transaction_id);

        if (refund_index !== -1) {
          refunds[refund_index].status = phonepe_response.data.state;
          refunds[refund_index].verified_at = new Date().toISOString();

          await update_payment_refund_model(payment.merchant_transaction_id, metadata);

          return sendResponse(res, true, "Refund status verified", {
            refund_status: phonepe_response.data.state,
            refund_details: refunds[refund_index]
          });
        }
      }

      return sendResponse(res, false, "Refund not found", null, 404);
    } else {
      return sendResponse(res, false, "Failed to verify refund", phonepe_response, 400);
    }

  } catch (error) {
    console.error("Verify refund error:", error);
    return sendResponse(res, false, error.message, null, 500);
  }
};

// ================= HANDLE WEBHOOK =================
exports.handle_webhook = async (req, res) => {
  try {
    console.log("===== Webhook Received =====");
    console.log("Headers:", req.headers);
    
    // ✅ PhonePe header 'x-verify' (lowercase in Express)
    const phonepeSignature = req.headers['x-verify'];
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX;
    
    console.log("Signature present:", !!phonepeSignature);
    
    if (!phonepeSignature) {
      console.error("❌ No signature in headers");
      return res.status(200).json({  // 200 to prevent PhonePe retries
        success: false,
        code: "MISSING_SIGNATURE"
      });
    }
    
    // Parse raw body
    let payload;
    try {
      payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (e) {
      payload = req.body;
    }
    
    const isValid = verify_phonepe_signature(payload, phonepeSignature, saltKey, saltIndex);
    
    if (!isValid) {
      console.error("❌ Invalid signature");
      return res.status(200).json({
        success: false,
        code: "INVALID_SIGNATURE"
      });
    }
    
    console.log("✅ Signature verified");
    
    // Process payment data
    let paymentData = payload;
    
    if (payload.response) {
      try {
        const decoded = Buffer.from(payload.response, 'base64').toString('utf-8');
        paymentData = JSON.parse(decoded);
      } catch (e) {
        console.error("Decode error:", e);
      }
    }
    
    const data = paymentData.data || paymentData;
    const { merchantTransactionId, transactionId, state } = data;
    
    console.log("Payment Data:", { merchantTransactionId, transactionId, state });
    
    if (!merchantTransactionId) {
      return res.status(200).json({ success: false, code: "NO_TRANSACTION_ID" });
    }
    
    let paymentStatus;
    switch (state) {
      case 'COMPLETED': paymentStatus = 'SUCCESS'; break;
      case 'FAILED': paymentStatus = 'FAILED'; break;
      case 'CANCELLED': paymentStatus = 'CANCELLED'; break;
      default: paymentStatus = 'PENDING';
    }
    
    await update_payment_status_model(merchantTransactionId, paymentStatus, transactionId, paymentData);
    
    // If payment successful, trigger business logic
    if (paymentStatus === 'SUCCESS') {
      await handle_successful_payment(merchantTransactionId);
    }
    
    return res.status(200).json({
      success: true,
      code: "SUCCESS"
    });
    
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    return res.status(200).json({
      success: false,
      code: "ERROR"
    });
  }
};

// Helper function to handle successful payments
const handle_successful_payment = async (merchant_transaction_id) => {
  try {
    // Add your business logic here
    // For example: update user subscription, send email, etc.
    console.log("Payment successful for transaction:", merchant_transaction_id);

    // You can query the payment details and perform necessary actions
    const payment_result = await get_payment_by_transaction_id_model(merchant_transaction_id);

    if (payment_result.success) {
      const payment = payment_result.data;
      // Example: Update user's subscription status
      // await update_user_subscription(payment.user_id, payment.metadata);
    }
  } catch (error) {
    console.error("Error handling successful payment:", error);
  }
};

// ================= GET PAYMENT HISTORY =================
exports.get_payment_history = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { page = 1, limit = 10, status } = req.query;

    const result = await get_user_payments_model(
      user_id,
      parseInt(page),
      parseInt(limit),
      status
    );

    if (result.success) {
      return sendResponse(res, true, "Payment history retrieved", result.data);
    } else {
      return sendResponse(res, false, result.message, null, 400);
    }

  } catch (error) {
    console.error("Get payment history error:", error);
    return sendResponse(res, false, error.message, null, 500);
  }
};

// ================= GET SINGLE PAYMENT =================
exports.get_payment_by_id = async (req, res) => {
  try {
    const { payment_id } = req.params;
    const user_id = req.user.user_id;

    const result = await get_payment_by_id_model(payment_id, user_id);

    if (result.success) {
      return sendResponse(res, true, "Payment details retrieved", result.data);
    } else {
      return sendResponse(res, false, result.message, null, 404);
    }

  } catch (error) {
    console.error("Get payment by ID error:", error);
    return sendResponse(res, false, error.message, null, 500);
  }
};

exports.payment_return = async (req, res) => {
  try {
    console.log("===== PhonePe Return URL Called =====");
    console.log("Query Parameters:", req.query);
    
    const { 
      merchantTransactionId, 
      transactionId, 
      code, 
      message 
    } = req.query;
    
    // PhonePe different formats mein bhej sakta hai
    const txnId = merchantTransactionId || req.query.merchant_transaction_id;
    
    console.log("Transaction ID:", txnId, "Code:", code);
    
    switch (code) {
      case 'PAYMENT_SUCCESS':
        console.log("✅ Payment Successful:", txnId);
        
        // Update payment status
        await update_payment_status_model(txnId, 'SUCCESS', transactionId);
        
        // Redirect to Flutter app using deep link
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment/return?` +
          `status=success&` +
          `order_id=${txnId}&` +
          `transaction_id=${transactionId}`
        );
        
      case 'PAYMENT_ERROR':
        console.log("❌ Payment Failed:", txnId);
        await update_payment_status_model(txnId, 'FAILED', transactionId);
        
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment/return?` +
          `status=failed&` +
          `order_id=${txnId}&` +
          `message=${encodeURIComponent(message || 'Payment failed')}`
        );
        
      case 'PAYMENT_PENDING':
        console.log("⏳ Payment Pending:", txnId);
        
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment/return?` +
          `status=pending&` +
          `order_id=${txnId}`
        );
        
      default:
        console.log("❓ Unknown status:", code);
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment/return?` +
          `status=unknown&` +
          `order_id=${txnId}&` +
          `code=${code}`
        );
    }
    
  } catch (error) {
    console.error("❌ Return URL Error:", error);
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/return?status=error`
    );
  }
};
