// routes/payment.route.js
const express = require("express");
const isAuth = require("../methods/token_validate_middelware");
const router = express.Router();

const {
  initiate_payment_pg,
  handle_webhook_pg,
  check_status_pg,
} = require("../controllers/payment/phonepe_pg.controller");

// ================= PG DIRECT PAYMENT (FLUTTER SDK) =================
router.post("/pg/init", isAuth, initiate_payment_pg);
router.post("/pg/webhook", handle_webhook_pg); 
router.get("/pg/status/:transactionId", isAuth, check_status_pg);

module.exports = router;