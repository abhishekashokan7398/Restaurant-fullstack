const express = require("express");
const router = express.Router();
const chefController = require("../controllers/chefController");

// Routes
router.post("/", chefController.addChef);
router.get("/", chefController.getAllChefs);


module.exports = router;
