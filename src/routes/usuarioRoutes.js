const express = require("express");
const { register,login, getProfile, addBalance} = require("../controllers/usuarioController");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/balance",verifyToken,addBalance);

router.get("/profile", verifyToken,getProfile);

module.exports = router;