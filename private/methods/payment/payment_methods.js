// methods/payment/payment_methods.js
const crypto = require('crypto');
const { current_epoch_time } = require("../current_epoch_time");
const { random_number } = require("../random_number");

const generate_merchant_transaction_id = () => {
  const prefix = 'TXN';
  const epoch = current_epoch_time();
  const random = random_number();
  const hash = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}_${epoch}_${random}_${hash}`;
};

const generate_merchant_order_id = () => {
  const prefix = 'ORDER';
  const epoch = current_epoch_time();
  const random = random_number();
  return `${prefix}_${epoch}_${random}`;
};

const generate_refund_transaction_id = (originalTransactionId) => {
  const prefix = 'REFUND';
  const epoch = current_epoch_time();
  return `${prefix}_${epoch}_${originalTransactionId}`;
};

const verify_phonepe_signature = (req) => {
  // Just check if request has valid headers
  const clientId = req.headers['x-client-id'];
  const merchantId = req.headers['x-merchant-id'];
  
  // Basic validation
  return clientId === process.env.PHONEPE_CLIENT_ID;
};

const format_amount_to_paise = (amount) => {
  return Math.round(amount * 100);
};

const format_paise_to_amount = (paise) => {
  return (paise / 100).toFixed(2);
};

module.exports = {
  generate_merchant_transaction_id,
  generate_merchant_order_id,
  generate_refund_transaction_id,
  verify_phonepe_signature,
  format_amount_to_paise,
  format_paise_to_amount
};