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
const getAuthToken = async () => {
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

    const data = await response.json();
    if (data.access_token) {
      cachedToken = data.access_token;
      // Set expiry 5 minutes before actual expiry
      tokenExpiry = Date.now() + ((data.expires_in - 300) * 1000);
      
      return cachedToken;
    } else {
      return sendResponse(res, false, 'Failed to obtain auth token', null, 404);
    }
  } catch (error) {
    return sendResponse(res, false, error.message, null, 404);
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
    const amountInPaise = format_amount_to_paise(amount);

    // Step 1: Get Auth Token
    const authToken = await getAuthToken();

    // Step 2: Create PhonePe Order Payload (v2 format)
    const phonepePayload = {
      merchantOrderId: merchantOrderId,
      amount: amountInPaise,
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
    const orderData = await response.json();
    // console.log('📥 PhonePe Order Response:', orderData);
    // console.log('📥 Response Status:', response.status, response.statusText);

    if (response.ok && orderData.orderId) {
      // Step 5: Update payment with transaction ID
      await update_payment_status_model(
        merchantOrderId,
        orderData.state || 'PENDING',
        merchantOrderId,
        orderData
      );

      return sendResponse(res, true, "Payment initiated successfully", {
        orderToken: orderData.token,
        merchantOrderId: merchantOrderId,
        amount: amount,
        redirectUrl: orderData.data?.redirectUrl || null,
        orderData: orderData.data
      }, 200);
    } else {
      console.error('❌ Order creation failed:', orderData);
      return sendResponse(res, false, orderData.message || "Payment initiation failed", orderData, 400);
    }

  } catch (error) {
    return sendResponse(res, false, error.message, null, 500);
  }
};

// ========== VERIFY WEBHOOK AUTHORIZATION ==========
const verifyWebhookAuth = (req) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      console.error('❌ No Authorization header in webhook');
      return false;
    }

    // PhonePe sends: SHA256(username:password)
    const expectedAuth = `SHA256(${WEBHOOK_CONFIG.username}:${WEBHOOK_CONFIG.password})`;

    if (authHeader === expectedAuth) {
      console.log('✅ Webhook authorization verified');
      return true;
    } else {
      console.error('❌ Invalid authorization');
      return false;
    }
  } catch (error) {
    console.error('❌ Auth verification error:', error);
    return false;
  }
};

// ========== API 2: WEBHOOK (Callback from PhonePe) ==========
// exports.handle_webhook_pg = async (req, res) => {
//   const {
//     merchantOrderId,
//     transactionId,
//     state,
//     responseCode,
//     amount
//   } = payload;
//   try {
//     // ========== STEP 1: Verify Authorization ==========
//     if (!verifyWebhookAuth(req)) {
//       console.error('❌ Webhook authorization failed');
//       return res.status(200).json({
//         success: false,
//         message: "Authorization failed"
//       });
//     }

//     // ========== STEP 2: Extract Event Type ==========
//     const event = req.body.event;
//     const timestamp = req.body.timestamp;

//     // PhonePe events:
//     // - checkout.order.completed
//     // - checkout.order.failed
//     // - pg.refund.completed
//     // - pg.refund.failed

//     if (!event) {
//       console.error('❌ No event type in webhook');
//       return res.status(200).json({ success: false });
//     }

//     // ========== STEP 3: Extract Payload ==========
//     const payload = req.body.payload;

//     if (!payload) {
//       console.error();
//       return res.status(200).json({ success: false, message: "'❌ No payload in webhook'" });
//     }

//     const {
//       merchantOrderId,
//       transactionId,
//       state,
//       responseCode,
//       amount
//     } = payload;

//     if (!merchantOrderId) {
//       console.error('❌ No merchantOrderId in payload');
//       return res.status(200).json({ success: false });
//     }

//     // ========== STEP 4: Handle Different Events ==========
//     if (event === 'checkout.order.completed' || event === 'checkout.order.failed') {
//       // Payment status update
//       let paymentStatus = 'PENDING';

//       if (state === 'COMPLETED' || responseCode === 'SUCCESS') {
//         paymentStatus = 'SUCCESS';
//       } else if (state === 'FAILED' || responseCode === 'FAILURE') {
//         paymentStatus = 'FAILED';
//       }

//       console.log('✅ Payment Status:', paymentStatus);

//       // Update database
//       const updateResult = await update_payment_status_model(
//         merchantOrderId,
//         paymentStatus,
//         transactionId,
//         payload
//       );

//       console.log('📝 Update Result:', updateResult);

//       if (updateResult.success && paymentStatus === 'SUCCESS') {
//         await handleSuccessfulPaymentPG(merchantOrderId, payload);
//       }

//     } else if (event === 'pg.refund.completed' || event === 'pg.refund.failed') {
//       // Handle refund events
//       console.log('🔄 Refund event received:', event);
//       // Add refund handling logic here
//     } else {
//       console.log('ℹ️  Unknown event type:', event);
//     }

//     // ========== STEP 5: Return Success ==========
//     return res.status(200).json({
//       success: true,
//       message: "Webhook processed successfully"
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
  console.log('📩 Webhook Received:');

  try {
    console.log('📩 Webhook Received:', JSON.stringify(req.body));

    // 1. AUTH CHECK
    if (!verifyWebhookAuth(req)) {
      console.error('❌ Invalid webhook signature');
      return res.status(200).json({ success: false });
    }

    const { event, payload } = req.body;

    if (!event || !payload) {
      console.error('❌ Missing event/payload');
      return res.status(200).json({ success: false });
    }

    const {
      merchantOrderId,
      transactionId,
      state,
      responseCode,
      amount
    } = payload;

    console.log('📦 Extracted:', {
      merchantOrderId,
      transactionId,
      state,
      responseCode,
      amount
    });

    if (!merchantOrderId) {
      console.error('❌ merchantOrderId missing');
      return res.status(200).json({ success: false });
    }

    // 2. STATUS NORMALIZATION
    const successStates = ['COMPLETED', 'SUCCESS', 'AUTHORIZED', 'SETTLED'];

    let paymentStatus = 'PENDING';

    if (successStates.includes(state) || responseCode === 'SUCCESS') {
      paymentStatus = 'SUCCESS';
    } else if (state === 'FAILED' || responseCode === 'FAILURE') {
      paymentStatus = 'FAILED';
    }

    console.log('📊 Final Status:', paymentStatus);

    // 3. DB UPDATE (IMPORTANT FIX)
    const updateResult = await update_payment_status_model(
      merchantOrderId,     // ✅ IMPORTANT: ORDER ID use karo
      paymentStatus,
      transactionId,
      payload
    );

    console.log('📝 DB Update Result:', updateResult);

    // 4. SUCCESS HANDLER
    if (updateResult.success && paymentStatus === 'SUCCESS') {
      await handleSuccessfulPaymentPG(merchantOrderId, payload);
    }

    return res.status(200).json({
      success: true,
      message: "Webhook processed"
    });

  } catch (error) {
    console.error('❌ Webhook Error:', error);

    return res.status(200).json({
      success: false,
      message: error.message
    });
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

// ========== HELPER: Handle Successful Payment ==========
// const handleSuccessfulPaymentPG = async (merchantOrderId, paymentData) => {
//   try {
//     console.log('🎉 Processing successful payment:', merchantOrderId);

//     // Get payment details from database
//     const paymentResult = await get_payment_by_transaction_id_model(merchantOrderId);

//     if (paymentResult.success) {
//       const payment = paymentResult.data;

//       // Your business logic here:
//       // 1. Update appointment status
//       // 2. Send confirmation email
//       // 3. Create invoice
//       // 4. Send push notification

//       console.log('✅ Business logic completed for:', merchantOrderId);
//     } else {
//       console.error('❌ Payment record not found for business logic');
//     }
//   } catch (error) {
//     console.error('❌ Business logic error:', error);
//   }
// };
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