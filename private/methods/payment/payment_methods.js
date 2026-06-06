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

const verify_phonepe_signature = (payload, receivedSignature, saltKey, saltIndex) => {
  try {
    // Method 1: SHA256 + Salt Key
    const payloadString = JSON.stringify(payload);
    const dataToHash = payloadString + saltKey;
    
    const hash = crypto
      .createHash('sha256')
      .update(dataToHash)
      .digest('hex');
    
    // Expected format: hash###saltIndex
    const expectedSignature = `${hash}###${saltIndex}`;
    
    console.log("Generated Hash:", hash);
    console.log("Expected Signature:", expectedSignature);
    console.log("Received Signature:", receivedSignature);
    
    // Compare signatures
    return receivedSignature === expectedSignature;
    
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
};

const format_amount_to_paise = (amount) => {
  return Math.round(amount * 100);
};

const format_paise_to_amount = (paise) => {
  return (paise / 100).toFixed(2);
};

const verifyPGChecksum = (base64Response, receivedChecksum, saltKey, saltIndex) => {
  // PhonePe webhook response verify करने का formula
  const stringToHash = base64Response + saltKey;
  const sha256Hash = crypto
    .createHash('sha256')
    .update(stringToHash)
    .digest('hex');
  
  const expectedChecksum = `${sha256Hash}###${saltIndex}`;
  
  return receivedChecksum === expectedChecksum;
};
module.exports = {
  verifyPGChecksum,
  generate_merchant_transaction_id,
  generate_merchant_order_id,
  generate_refund_transaction_id,
  verify_phonepe_signature,
  format_amount_to_paise,
  format_paise_to_amount
};