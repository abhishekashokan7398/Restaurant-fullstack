const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getTotalOrders,
  getTotalRevenue,
  getRevenueSummary,
  getChefOrderCountById,
  getOrderCountByTypeAndPeriod,
  markOrdersAsServed,
} = require("../controllers/orderController");

// Get total order count
router.get("/count", getTotalOrders);

// Get total revenue
router.get("/revenue", getTotalRevenue);

// Get revenue summary
router.get("/revenue/summary", getRevenueSummary);

// Get order count by type & period
router.get("/count/by-type", getOrderCountByTypeAndPeriod);

// Trigger auto-serve manually
router.get("/auto-serve", async (req, res) => {
  try {
    await markOrdersAsServed();
    res.json({ message: "Auto-serve process executed successfully." });
  } catch (error) {
    console.error("Error executing auto-serve process:", error);
    res.status(500).json({ message: "Error executing auto-serve process." });
  }
});

// Create new order
router.post("/", createOrder);

// Get all orders
router.get("/", getOrders);

// Get chef order count by ID
router.get("/chef/orders/:chefId", getChefOrderCountById);

// Get single order by ID
router.get("/:id", getOrderById);

// Update order status (served or not)
router.put("/:id/status", updateOrderStatus);

module.exports = router;
