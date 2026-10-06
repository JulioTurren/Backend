const express = require("express");

const router = express.Router();

const {charge} = require("../controllers/snailPayController");

const verifyToken = require("../middleware/authMiddleware");


router.post("/charge",verifyToken,charge);

module.exports = router;