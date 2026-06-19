const router = require('express').Router();
const discountController = require('../controllers/discount/discount.controller');
const isAuth = require("../methods/token_validate_middelware");

// const isAdmin = require('../middlewares/role.middleware');
// const validateMiddleware = require('../middlewares/validate.middleware');
// const {
//   createDiscountSchema,
//   validateCouponSchema,
//   updateDiscountSchema
// } = require('../validators/discount.validator');

router.use(isAuth);

// Public routes
router.post('/validate', discountController.validateCoupon);
router.get('/all', discountController.getAllDiscounts);
router.get('/:id', discountController.getDiscountById);
router.put('/:id', discountController.updateDiscount);
router.post('/', discountController.createDiscount);

// Delete Routes
router.delete('/:id', discountController.deleteDiscount); // Soft delete
router.delete('/permanent/:id', discountController.permanentDeleteDiscount); // Hard delete
router.post('/restore/:id', discountController.restoreDiscount); // Restore soft-deleted

// Get deleted discounts
router.get('/deleted/all', discountController.getDeletedDiscounts);

// router.post('/validate', validateMiddleware(validateCouponSchema), discountController.validateCoupon);

// User routes
// router.get('/available', discountController.getAvailableCoupons);
// router.get('/my-usage', discountController.getMyUsage);

// Admin routes
// router.use(isAdmin);
// router.post('/', validateMiddleware(createDiscountSchema), discountController.createDiscount);

// router.put('/:id', validateMiddleware(updateDiscountSchema), discountController.updateDiscount);
// router.delete('/:id', discountController.deleteDiscount);
// router.post('/:id/toggle-status', discountController.toggleDiscountStatus);
// router.get('/stats/summary', discountController.getDiscountStats);

module.exports = router;