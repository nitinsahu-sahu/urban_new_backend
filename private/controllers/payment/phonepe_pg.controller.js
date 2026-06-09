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
// const getAuthToken = async () => {
//   // Return cached token if still valid
//   if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
//     return cachedToken;
//   }

//   try {
//     const urls = getApiUrls();

//     const formData = new URLSearchParams();
//     formData.append('client_id', PHONEPE_CONFIG.clientId);
//     formData.append('client_version', PHONEPE_CONFIG.clientVersion.toString());
//     formData.append('client_secret', PHONEPE_CONFIG.clientSecret);
//     formData.append('grant_type', 'client_credentials');

//     const response = await fetch(urls.token, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       body: formData.toString()
//     });

//     const data = await response.json();
//     if (data.access_token) {
//       cachedToken = data.access_token;
//       // Set expiry 5 minutes before actual expiry
//       tokenExpiry = Date.now() + ((data.expires_in - 300) * 1000);
//       return cachedToken;
//     } else {
//       return sendResponse(res, false, 'Failed to obtain auth token', null, 404);
//     }
//   } catch (error) {
//     return sendResponse(res, false, error.message, null, 404);
//   }
// };
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
// exports.initiate_payment_pg = async (req, res) => {
//   try {
//     const { userId, amount, orderId } = req.body;
//     const user = req.user;

//     if (!amount || amount <= 0) {
//       return sendResponse(res, false, "Invalid amount", null, 400);
//     }

//     // Generate merchant order ID
//     const merchantOrderId = orderId || generate_merchant_transaction_id();

//     // Step 1: Get Auth Token
//     const authToken = await getAuthToken();

//     // Step 2: Create PhonePe Order Payload (v2 format)
//     const phonepePayload = {
//       merchantOrderId: merchantOrderId,
//       amount: format_amount_to_paise(amount),
//       expireAfter: 1800, // 30 minutes in seconds
//       metaInfo: {
//         udf1: userId,
//         udf2: user?.mobile_number || '',
//         udf3: 'PG_Direct_Payment'
//       },
//       paymentFlow: {
//         type: "PG_CHECKOUT"
//       }
//     };
// console.log('phonepePayload',phonepePayload);

//     // Step 3: Save to Database first
//     const paymentResult = await create_payment_model(
//       userId,
//       amount,
//       process.env.PHONEPE_CALLBACK_URL,
//       {
//         orderId: orderId,
//         purpose: 'PG Direct Payment',
//         merchantOrderId: merchantOrderId
//       },
//       merchantOrderId
//     );

//     if (!paymentResult.success) {
//       return sendResponse(res, false, "Failed to create payment record", null, 500);
//     }

//     // Step 4: Call PhonePe API to create order
//     const urls = getApiUrls();

//     const response = await fetch(urls.order, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `O-Bearer ${authToken}`,
//       },
//       body: JSON.stringify(phonepePayload)
//     });
//     console.log("==>",response);
//     console.log("authToken",authToken);
    
//     const orderData = await response.json();

//     if (response.ok && orderData.orderId) {
//       await update_payment_status_model(
//         merchantOrderId,
//         orderData.state || 'PENDING',
//         merchantOrderId,
//         orderData
//       );

//       return sendResponse(res, true, "Payment initiated successfully", {
//         orderToken: orderData.token,
//         merchantOrderId: merchantOrderId,
//         amount: amount,
//         redirectUrl: orderData.data?.redirectUrl || null,
//         orderData: orderData.data
//       }, 200);
//     } else {
//       console.error('❌ Order creation failed:', orderData);
//       return sendResponse(res, false, orderData.message || "Payment initiation failed", orderData, 400);
//     }

//   } catch (error) {
//     return sendResponse(res, false, error.message, null, 500);
//   }
// };
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
exports.handle_webhook_pg = async (req, res) => {

  try {
    console.log('📩 Webhook Received:', JSON.stringify(req.body));

    // 1. AUTH CHECK
    if (!verifyWebhookAuth(req)) {
      console.error('❌ Invalid webhook signature');
      return res.status(200).json({ success: false });
    }

    const { event, payload, type} = req.body;

    if (!event || !payload) {
      console.error('❌ Missing event/payload');
      return res.status(200).json({ success: false });
    }

    const {
      merchantOrderId,
      paymentDetails, 
      state,
      amount
    } = payload;
console.log('🔍 Type of paymentDetails:', typeof paymentDetails);
console.log('🔍 Is Array?', Array.isArray(paymentDetails));
console.log('🔍 Full paymentDetails:', JSON.stringify(paymentDetails, null, 2));
    if (!merchantOrderId) {
      console.error('❌ merchantOrderId missing');
      return res.status(200).json({ success: false });
    }

    // ✅ FIX: Extract transactionId from array
    let transactionId = null;
    if (paymentDetails && Array.isArray(paymentDetails) && paymentDetails.length > 0) {
      transactionId = paymentDetails[0].transactionId;
      console.log('✅ Extracted transactionId:', transactionId);
    } else {
      console.log('⚠️ paymentDetails is not an array or empty:', paymentDetails);
    }

    // 2. STATUS NORMALIZATION
    let paymentStatus = 'PENDING';

    if (state === 'COMPLETED') {
      paymentStatus = 'SUCCESS';
    } else if (state === 'FAILED') {
      paymentStatus = 'FAILED';
    }

    console.log('📊 Final Status:', paymentStatus);

    // 3. DB UPDATE - Pass correct transactionId
    const updateResult = await update_payment_status_model(
      merchantOrderId,
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

