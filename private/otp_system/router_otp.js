const express = require("express");

const { verify_otp_controller } = require("./verify_otp_controller");


const router = express.Router();

router.post("/", verify_otp_controller);


module.exports = router;
