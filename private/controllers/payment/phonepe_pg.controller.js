//phonepe_pg.controller.js
const crypto = require('crypto');
const { sendResponse } = require("../../utils/response");
const {
  create_payment_model,
  get_payment_by_transaction_id_model,
  update_payment_status_model,
  get_payment_by_order_id_model
} = require("../../models/payment.model");
const {
  generate_merchant_transaction_id,
  format_amount_to_paise
} = require("../../methods/payment/payment_methods");

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
    console.log("Token response:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse token response:', parseError);
      if (res) {
        sendResponse(res, false, 'Failed to parse auth token response', null, 500);
      }
      return null;
    }

    if (data.access_token) {
      cachedToken = data.access_token;
      // Set expiry 5 minutes before actual expiry
      tokenExpiry = Date.now() + ((data.expires_in - 300) * 1000);
      return cachedToken;
    } else {
      console.error('❌ No access token in response:', data);
      if (res) {
        sendResponse(res, false, 'Failed to obtain auth token', data, 500);
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Token fetch error:', error);
    if (res) {
      sendResponse(res, false, error.message, null, 500);
    }
    return null;
  }
};

// ========== API 1: INITIATE PAYMENT ==========
exports.initiate_payment_pg = async (req, res) => {
  try {
    const { userId, amount, orderId } = req.body;
    const user = req.user;

    if (!amount || amount <= 0) {
      return sendResponse(res, false, "Invalid amount", null, 400);
    }

    // Generate merchant order ID
    const merchantOrderId = orderId || generate_merchant_transaction_id();

    // Step 1: Get Auth Token - FIX: Pass res properly
    const authToken = await getAuthToken(res);

    // Check if auth token retrieval failed
    if (!authToken) {
      return; // getAuthToken already sent the error response
    }

    // Step 2: Create PhonePe Order Payload (v2 format)
    const phonepePayload = {
      merchantOrderId: merchantOrderId,
      amount: format_amount_to_paise(amount),
      expireAfter: 1800, // 30 minutes in seconds
      metaInfo: {
        udf1: userId,
        udf2: user?.mobile_number || '',
        udf3: 'PG_Direct_Payment'
      },
      paymentFlow: {
        type: "PG_CHECKOUT"
      }
    };
    console.log('phonepePayload', phonepePayload);

    // Step 3: Save to Database first
    const paymentResult = await create_payment_model(
      userId,
      amount,
      process.env.PHONEPE_CALLBACK_URL,
      {
        orderId: orderId,
        purpose: 'PG Direct Payment',
        merchantOrderId: merchantOrderId
      },
      merchantOrderId
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

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);
    console.log("authToken:", authToken);

    // FIX: Properly read the response body
    const responseText = await response.text();
    console.log("Response body:", responseText);

    let orderData;
    try {
      orderData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse response:', parseError);
      return sendResponse(res, false, "Invalid response from PhonePe", { responseText }, 500);
    }

    console.log("Parsed orderData:", orderData);

    if (response.ok && orderData.orderId) {
      await update_payment_status_model(
        merchantOrderId,
        orderData.state || 'PENDING',
        merchantOrderId,
        orderData
      );

      return sendResponse(res, true, "Payment initiated successfully", {
        orderToken: orderData.token || orderData.data?.token,
        merchantOrderId: merchantOrderId,
        amount: amount,
        redirectUrl: orderData.data?.redirectUrl || null,
        orderData: orderData.data || orderData
      }, 200);
    } else {
      console.error('❌ Order creation failed:', orderData);
      return sendResponse(res, false, orderData.message || "Payment initiation failed", orderData, 400);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return sendResponse(res, false, error.message, null, 500);
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
      console.log('✅ Webhook authorization verified');
      return true;
    }

    return false;

  } catch (error) {
    return false;
  }
};

// ========== API 2: WEBHOOK (Callback from PhonePe) ==========
// exports.handle_webhook_pg = async (req, res) => {
// console.log("1. body",req.body);

//   try {
//     // 1. AUTH CHECK
//     if (!verifyWebhookAuth(req)) {
//       return res.status(200).json({ success: false });
//     }

//     const { event, payload, type } = req.body;


//     const {
//       merchantOrderId,
//       paymentDetails,
//       state,
//       amount
//     } = payload;
//     if (!merchantOrderId) {
//       console.error('❌ merchantOrderId missing');
//       return res.status(200).json({ success: false });
//     }

//     // ✅ FIX: Extract transactionId from array
//     let transactionId = null;
//     if (paymentDetails && Array.isArray(paymentDetails) && paymentDetails.length > 0) {
//       transactionId = paymentDetails[0].transactionId;
//       console.log('✅ Extracted transactionId:', transactionId);
//     } else {
//       console.log('⚠️ paymentDetails is not an array or empty:', paymentDetails);
//     }

//     // 2. STATUS NORMALIZATION
//     let paymentStatus = 'PENDING';

//     if (state === 'COMPLETED') {
//       paymentStatus = 'SUCCESS';
//     } else if (state === 'FAILED') {
//       paymentStatus = 'FAILED';
//     }

//     console.log('📊 Final Status:', paymentStatus);

//     // 3. DB UPDATE - Pass correct transactionId
//     const updateResult = await update_payment_status_model(
//       merchantOrderId,
//       paymentStatus,
//       transactionId,
//       payload
//     );

//     console.log('📝 DB Update Result:', updateResult);

//     // 4. SUCCESS HANDLER
//     if (updateResult.success && paymentStatus === 'SUCCESS') {
//       await handleSuccessfulPaymentPG(merchantOrderId, payload);
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Webhook processed"
//     });

//   } catch (error) {
//     console.error('❌ Webhook Error:', error);

//     return res.status(200).json({
//       success: false,
//       message: error.message
//     });
//   }
// };
exports.handle_webhook_pg = async (req, res) => {
  console.log("📨 Webhook received at:", new Date().toISOString());
  console.log("📦 Raw Body:", JSON.stringify(req.body, null, 2));
  
  try {
    // 1. AUTH CHECK
    if (!verifyWebhookAuth(req)) {
      console.error('❌ Webhook auth verification failed');
      return res.status(200).json({ success: false, message: "Auth failed" });
    }

    // 2. EXTRACT DATA - Handle multiple possible structures
    let webhookData = req.body;
    
    // Case 1: Direct payload structure
    if (webhookData.payload && typeof webhookData.payload === 'object') {
      var { event, payload } = webhookData;
    }
    // Case 2: Data wrapped inside another object
    else if (webhookData.data && webhookData.data.payload) {
      var { event, payload } = webhookData.data;
    }
    // Case 3: No wrapper, direct structure
    else if (webhookData.event && (webhookData.merchantOrderId || webhookData.payload)) {
      var event = webhookData.event;
      var payload = webhookData.payload || webhookData;
    }
    // Case 4: Fallback - treat entire body as payload
    else {
      console.log("⚠️ Using fallback - treating entire body as payload");
      var event = webhookData.event;
      var payload = webhookData;
    }

    console.log("✅ Parsed Event:", event);
    console.log("✅ Parsed Payload Keys:", payload ? Object.keys(payload) : "No payload");

    // 3. SAFELY EXTRACT REQUIRED FIELDS with multiple fallbacks
    const merchantOrderId = payload?.merchantOrderId 
      || webhookData.merchantOrderId 
      || payload?.merchantOrderId 
      || req.body.merchantOrderId;
    
    const state = payload?.state 
      || webhookData.state 
      || req.body.state;
    
    const amount = payload?.amount 
      || webhookData.amount 
      || req.body.amount;
    
    let paymentDetails = payload?.paymentDetails 
      || webhookData.paymentDetails 
      || req.body.paymentDetails;
    
    // 4. HANDLE paymentDetails if it's a string (JSON stringified)
    if (paymentDetails && typeof paymentDetails === 'string') {
      try {
        paymentDetails = JSON.parse(paymentDetails);
        console.log("✅ Parsed paymentDetails from string");
      } catch (e) {
        console.error("❌ Failed to parse paymentDetails string:", e.message);
      }
    }

    // 5. VALIDATE merchantOrderId
    if (!merchantOrderId) {
      console.error('❌ merchantOrderId missing in webhook');
      console.error('Full webhook data:', JSON.stringify(req.body, null, 2));
      return res.status(200).json({ 
        success: false, 
        message: "merchantOrderId missing",
        receivedData: req.body 
      });
    }

    console.log(`✅ Processing order: ${merchantOrderId}`);
    console.log(`📊 Order State: ${state}`);
    console.log(`💰 Amount: ${amount}`);

    // 6. EXTRACT TRANSACTION ID safely
    let transactionId = null;
    if (paymentDetails && Array.isArray(paymentDetails) && paymentDetails.length > 0) {
      transactionId = paymentDetails[0].transactionId || paymentDetails[0].transaction_id;
      console.log('✅ Extracted transactionId:', transactionId);
      console.log('✅ Payment Mode:', paymentDetails[0].paymentMode);
      console.log('✅ Payment State:', paymentDetails[0].state);
    } else if (paymentDetails && typeof paymentDetails === 'object' && !Array.isArray(paymentDetails)) {
      // Handle case where paymentDetails is an object, not array
      transactionId = paymentDetails.transactionId || paymentDetails.transaction_id;
      console.log('✅ Extracted transactionId from object:', transactionId);
    } else {
      console.log('⚠️ No paymentDetails found or invalid format');
    }

    // 7. DETERMINE PAYMENT STATUS
    let paymentStatus = 'PENDING';
    
    if (state === 'COMPLETED' || state === 'SUCCESS' || state === 'SUCCESSFUL') {
      paymentStatus = 'SUCCESS';
    } else if (state === 'FAILED' || state === 'FAILURE' || state === 'ERROR') {
      paymentStatus = 'FAILED';
    } else if (state === 'PENDING' || state === 'INITIATED') {
      paymentStatus = 'PENDING';
    }

    console.log('📊 Final Payment Status:', paymentStatus);

    // 8. CHECK FOR DUPLICATE WEBHOOK
    const isDuplicate = await checkDuplicateWebhook(merchantOrderId, transactionId);
    if (isDuplicate) {
      console.log(`⚠️ Duplicate webhook received for order: ${merchantOrderId}`);
      return res.status(200).json({ 
        success: true, 
        message: "Duplicate webhook ignored" 
      });
    }

    // 9. UPDATE DATABASE
    const updateResult = await update_payment_status_model(
      merchantOrderId,
      paymentStatus,
      transactionId,
      payload || webhookData
    );

    console.log('📝 DB Update Result:', updateResult);

    // 10. HANDLE SUCCESSFUL PAYMENT
    if (updateResult.success && paymentStatus === 'SUCCESS') {
      try {
        await handleSuccessfulPaymentPG(merchantOrderId, payload || webhookData);
        console.log(`✅ Success handler executed for order: ${merchantOrderId}`);
      } catch (successHandlerError) {
        console.error(`❌ Success handler failed for order ${merchantOrderId}:`, successHandlerError);
        // Don't return error, webhook already processed
      }
    }

    // 11. RETURN SUCCESS RESPONSE
    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
      orderId: merchantOrderId,
      status: paymentStatus
    });

  } catch (error) {
    console.error('❌ Webhook Processing Error:', error);
    console.error('Error Stack:', error.stack);
    
    // Always return 200 to PhonePe to prevent retries
    return res.status(200).json({
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Helper function to check duplicate webhooks
async function checkDuplicateWebhook(merchantOrderId, transactionId) {
  try {
    // You need to implement this based on your database
    // Example: Check if this order already has a webhook processed
    const existingWebhook = await check_webhook_processed_model(merchantOrderId, transactionId);
    return existingWebhook && existingWebhook.processed === true;
  } catch (error) {
    console.error('Error checking duplicate webhook:', error);
    return false; // Assume not duplicate if check fails
  }
}

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
    console.log('📥 Status Response:', data);

    // Update local database if needed
    let paymentStatus = 'PENDING';
    if (data.state === 'COMPLETED') {
      paymentStatus = 'SUCCESS';
    } else if (data.state === 'FAILED') {
      paymentStatus = 'FAILED';
    }

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

