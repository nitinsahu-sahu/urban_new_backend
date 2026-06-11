//phonepe_pg.controller.js
const crypto = require('crypto');
const { sendResponse } = require("../../utils/response");
const {
  create_payment_model,
  get_payment_by_transaction_id_model,
  update_payment_status_model,
  get_payment_by_order_id_model,
  update_webhook_data,
  updateOrderStatusToInProcess
} = require("../../models/payment.model");
const {
  generate_merchant_transaction_id,
  format_amount_to_paise,
  generate_merchant_order_id
} = require("../../methods/payment/payment_methods");
const { pool } = require("../../../dbhelper");

// PhonePe Configuration
const PHONEPE_CONFIG = {
  clientId: process.env.PHONEPE_CLIENT_ID,
  clientSecret: process.env.PHONEPE_CLIENT_SECRET,
  clientVersion: parseInt(process.env.PHONEPE_CLIENT_VERSION) || 1,
  merchantId: process.env.PHONEPE_MERCHANT_ID,
  env: process.env.PHONEPE_ENV === 'PRODUCTION' ? 'PRODUCTION' : 'SANDBOX',
};

// Base URLs
const API_URLS = {
  SANDBOX: {
    token: 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token',
    order: 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/sdk/order',
    status: 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order'
  },
  PRODUCTION: {
    token: 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token',
    order: 'https://api.phonepe.com/apis/pg/checkout/v2/sdk/order',
    status: 'https://api.phonepe.com/apis/pg/checkout/v2/order'
  },
};

const getApiUrls = () => {
  return API_URLS[PHONEPE_CONFIG.env] || API_URLS.SANDBOX;
};

const WEBHOOK_CONFIG = {
  username: process.env.PHONEPE_WEBHOOK_USERNAME || 'your_webhook_username',
  password: process.env.PHONEPE_WEBHOOK_PASSWORD || 'your_webhook_password'
};

// Store token in memory with expiry
let cachedToken = null;
let tokenExpiry = null;

// ========== GET OAUTH TOKEN ==========
const getAuthToken = async (res) => {
  // Return cached token if still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const urls = getApiUrls();

    const formData = new URLSearchParams();
    formData.append('client_id', PHONEPE_CONFIG.clientId);
    formData.append('client_version', PHONEPE_CONFIG.clientVersion.toString());
    formData.append('client_secret', PHONEPE_CONFIG.clientSecret);
    formData.append('grant_type', 'client_credentials');

    const response = await fetch(urls.token, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    // FIX: Properly read the response
    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      if (res) {
        sendResponse(res, false, 'Failed to parse auth token response', null, 500);
      }
      return null;
    }

    if (data.access_token) {
      cachedToken = data.access_token;
      tokenExpiry = Date.now() + ((data.expires_in - 300) * 1000);
      return cachedToken;
    } else {
      if (res) {
        sendResponse(res, false, 'Failed to obtain auth token', data, 500);
      }
      return null;
    }
  } catch (error) {
    if (res) {
      sendResponse(res, false, error.message, null, 500);
    }
    return null;
  }
};

// ========== VERIFY WEBHOOK AUTHORIZATION ==========
const verifyWebhookAuth = (req) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return false;
    }

    // Generate SHA256(username:password) - exactly as PhonePe does
    const authString = `${WEBHOOK_CONFIG.username}:${WEBHOOK_CONFIG.password}`;
    const expectedHash = crypto
      .createHash('sha256')
      .update(authString)
      .digest('hex');

    const expectedAuth = `SHA256(${authString})`;

    // Try both formats (PhonePe sometimes sends just hash, sometimes with wrapper)
    if (authHeader === expectedAuth || authHeader === expectedHash) {
      return true;
    }

    return false;

  } catch (error) {
    return false;
  }
};

// ========== API 1: INITIATE PAYMENT ==========
exports.initiate_payment_pg = async (req, res) => {

  try {
    const { amount, merchantOrderId, orderId } = req.body;
    console.log("==orderId==", orderId);

    const user = req.user;

    if (!amount || amount <= 0) {
      return sendResponse(res, false, "Invalid amount", null, 400);
    }

    // Generate merchant order ID
    const merchantTranx_Id = generate_merchant_transaction_id() || merchantOrderId;
    const order_Id = orderId ? orderId : generate_merchant_order_id();

    // Step 1: Get Auth Token - FIX: Pass res properly
    const authToken = await getAuthToken(res);

    if (!authToken) {
      return;
    }
    // Step 2: Create PhonePe Order Payload (v2 format)
    const phonepePayload = {
      merchantOrderId: merchantTranx_Id,
      amount: format_amount_to_paise(amount),
      expireAfter: 1800, // 30 minutes in seconds
      metaInfo: {
        udf1: user.user_Id,
        udf2: user?.email || '',
        udf3: 'PG_Direct_Payment'
      },
      paymentFlow: {
        type: "PG_CHECKOUT"
      }
    };

    // Step 3: Save to Database first
    const paymentResult = await create_payment_model(
      user.user_id,
      amount,
      process.env.PHONEPE_CALLBACK_URL,
      {
        purpose: 'PG Direct Payment',
        merchantTranxId: merchantTranx_Id
      },
      merchantTranx_Id,
      order_Id
    );

    if (!paymentResult.success) {
      return sendResponse(res, false, "Failed to create payment record", null, 500);
    }

    // Step 4: Call PhonePe API to create order
    const urls = getApiUrls();

    const response = await fetch(urls.order, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${authToken}`,
      },
      body: JSON.stringify(phonepePayload)
    });

    const responseText = await response.text();

    let orderData;
    try {
      orderData = JSON.parse(responseText);
    } catch (parseError) {
      return sendResponse(res, false, "Invalid response from PhonePe", { responseText }, 500);
    }

    if (response.ok && orderData.orderId) {

      const update = await update_payment_status_model(
        merchantTranx_Id,
        orderData.state,
        orderData.orderId,
        orderData
      );
      return sendResponse(res, true, "Payment initiated successfully", {
        orderToken: orderData.token || orderData.data?.token,
        merchantOrderId: merchantTranx_Id,
        amount: amount,
        redirectUrl: orderData.data?.redirectUrl || null,
        orderData: orderData.data || orderData
      }, 200);
    } else {
      return sendResponse(res, false, orderData.message || "Payment initiation failed", orderData, 400);
    }
  } catch (error) {
    return sendResponse(res, false, error.message, null, 500);
  }
};

// ========== API 2: WEBHOOK (Callback from PhonePe) ==========
exports.handle_webhook_pg = async (req, res) => {
  console.log('📥 Webhook Received:', req.body);

  try {
    // 1. AUTH CHECK
    if (!verifyWebhookAuth(req)) {
      return res.status(200).json({ success: false, message: "Auth failed" });
    }

    // 2. PARSE WEBHOOK BODY
    const webhookData = req.body;
    console.log('📥 Webhook Received:', JSON.stringify(webhookData, null, 2));

    // 3. EXTRACT PAYLOAD DATA
    const { event, payload } = webhookData;

    if (!payload || !payload.merchantOrderId) {
      console.error('❌ Invalid webhook payload');
      return res.status(200).json({
        success: false,
        message: "Invalid payload structure"
      });
    }

    const {
      merchantOrderId, state, orderId, amount, paymentDetails
    } = payload;

    // 4. DETERMINE PAYMENT STATUS
    let paymentStatus = 'PENDING';
    let paymentCompletedAt = null;

    if (state === 'COMPLETED') {
      paymentStatus = 'SUCCESS';
      if (paymentDetails && paymentDetails.length > 0) {
        paymentCompletedAt = new Date(paymentDetails[0].timestamp).toISOString();
      } else {
        paymentCompletedAt = new Date().toISOString();
      }
    } else if (state === 'FAILED') {
      paymentStatus = 'FAILED';
    } else if (state === 'PENDING') {
      paymentStatus = 'PENDING';
    }

    // 5. UPDATE DATABASE
    const paymentResult = await update_webhook_data(
      paymentStatus,
      webhookData,
      paymentCompletedAt,
      orderId
    );
    return res.status(200).json({
      success: true,
      message: "Webhook updated successfully",
      data: paymentResult
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ========== HELPER: Handle Successful Payment ==========
const handleSuccessfulPaymentPG = async (merchantOrderId, paymentData) => {
  try {

    const paymentResult = await get_payment_by_order_id_model(merchantOrderId);

    if (!paymentResult.success) {
      console.error('❌ Payment not found for success handler');
      return;
    }

    const payment = paymentResult.data;

    // Example actions:
    // - update appointment
    // - send email
    // - generate invoice

  } catch (error) {
    console.error('❌ Success handler error:', error);
  }
};

// ========== API 3: CHECK ORDER STATUS ==========
exports.check_status_pg = async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Get auth token
    const authToken = await getAuthToken();

    // Call PhonePe Status API
    const urls = getApiUrls();
    const url = `${urls.status}/${transactionId}/status`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${authToken}`,
      }
    });

    const data = await response.json();

    // Update local database if needed
    let paymentStatus = 'PENDING';
    let paymentCompletedAt = null;

    if (data.state === 'COMPLETED') {
      paymentStatus = 'SUCCESS';
      if (data.paymentDetails && data.paymentDetails.length > 0) {
        paymentCompletedAt = new Date(data.paymentDetails[0].timestamp).toISOString();
      } else {
        paymentCompletedAt = new Date().toISOString();
      }
    } else if (data.state === 'FAILED') {
      paymentStatus = 'FAILED';
    }

    // 5. UPDATE DATABASE
    const paymentResult = await update_webhook_data(
      paymentStatus,
      data,
      paymentCompletedAt,
      data.orderId
    );

    // if (paymentResult.status === "SUCCESS") {
    //   const upstatus = await updateOrderStatusToInProcess(paymentResult.merchant_order_id)

    // }
    return sendResponse(res, true, "Status retrieved", {
      status: paymentStatus,
      transactionId: transactionId,
      rawResponse: data,
    }, 200);

  } catch (error) {
    console.error('❌ Status Check Error:', error);
    return sendResponse(res, false, error.message, null, 500);
  }
};

