// routes/payment.route.js
const express = require("express");
const {
  initiate_payment,
  create_order,
  check_order_status,
  initiate_refund,
  verify_refund,
  handle_webhook,
  get_payment_history,
  get_payment_by_id
} = require("../controllers/payment/payment.controller");
const isAuth = require("../methods/token_validate_middelware");
const router = express.Router();

// ================= PAYMENT INITIATION =================
router.post("/initiate", isAuth, initiate_payment);

// ================= ORDER CREATION =================
router.post("/create-order", isAuth, create_order);

// ================= ORDER STATUS =================
router.get("/status/:merchant_transaction_id", isAuth, check_order_status);

// ================= REFUND =================
router.post("/refund/initiate", isAuth, initiate_refund);
router.get("/refund/verify/:refund_transaction_id", isAuth, verify_refund);

// ================= WEBHOOK (NO AUTH REQUIRED) =================
router.post("/webhook", handle_webhook);

// ================= PAYMENT HISTORY =================
router.get("/history", isAuth, get_payment_history);
router.get("/:payment_id", isAuth, get_payment_by_id);

module.exports = router;