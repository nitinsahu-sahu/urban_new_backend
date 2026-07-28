const reviewOtpEnabled = () =>
  process.env.REVIEW_OTP_BYPASS_ENABLED === "true";

const reviewPhone = () => process.env.REVIEW_OTP_PHONE?.trim();
const reviewOtp = () => process.env.REVIEW_OTP_CODE?.trim();

const reviewVerificationId = "review-otp-bypass";

const isReviewPhone = (phone) =>
  reviewOtpEnabled() &&
  Boolean(reviewPhone()) &&
  phone === reviewPhone();

const isReviewOtp = (verificationId, otp) =>
  reviewOtpEnabled() &&
  Boolean(reviewPhone()) &&
  Boolean(reviewOtp()) &&
  verificationId === reviewVerificationId &&
  otp === reviewOtp();

module.exports = {
  isReviewOtp,
  isReviewPhone,
  reviewPhone,
  reviewVerificationId,
};
