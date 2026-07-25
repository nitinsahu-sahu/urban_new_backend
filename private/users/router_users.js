const express = require("express");
const { get_user } = require("./get/get_user_controller");
const { create_user } = require("./create/create_user_controller");
const { update_user } = require("./update/update_user_controller");
const { active_user } = require("./active/active_user_controller");
const { delete_user } = require("./delete/delete_user_controller");
const { signup_user_controller } = require("./signUp/signup_controller");
const { login_user_controller } = require("./newLogin/newLogin_controller");
const { forget_password_controller } = require("./forgetPass/forget_password.controller");
const { verify_forget_otp_controller } = require("./forgetPass/verify_forget_otp.controller");
const { reset_password_controller } = require("./forgetPass/reset_password.controller");
const validateTokenMiddleware = require("../methods/token_validate_middelware");

const router = express.Router();

router.get("/", validateTokenMiddleware, get_user);
router.post("/", create_user);
router.post("/signup", signup_user_controller);
router.post("/login", login_user_controller);
router.post("/forget-password", forget_password_controller);
router.post("/verify-forget-otp", verify_forget_otp_controller);
router.post("/reset-password", reset_password_controller);
router.put("/", validateTokenMiddleware, update_user);
router.put("/is_active", validateTokenMiddleware, active_user);
router.delete("/:id", delete_user);

module.exports = router;
