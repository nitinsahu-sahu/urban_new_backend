const express = require("express");
const { get_profile_controller } = require("./get_profile_controller");
const router = express.Router();
const validateTokenMiddleware = require("../methods/token_validate_middelware");
router.get("/", validateTokenMiddleware, get_profile_controller);

module.exports = router;
