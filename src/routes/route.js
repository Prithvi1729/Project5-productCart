const express = require("express");

const router = express.Router();

const {userController} = require("../controllers");

//const { userAuth } = require("../middlewares");

// USER API'S

router.post("/register", userController.registerUser);

module.exports = router;
