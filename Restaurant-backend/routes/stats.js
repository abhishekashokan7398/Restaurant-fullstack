const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/userModel");

// 🔹 Utility: date range helper
function getDateRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  return { start, end };
}

// 🔹 Revenue Stats (daily, weekly, monthly)
router.get("/revenue", async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    const { start: weekStart, end: weekEnd } = getDateRange(7);
    const { start: monthStart, end: monthEnd } = getDateRange(30);

    const [daily, weekly, monthly] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: weekStart, $lte: weekEnd } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    res.json({
      dailyRevenue: daily[0]?.total || 0,
      weeklyRevenue: weekly[0]?.total || 0,
      monthlyRevenue: monthly[0]?.total || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching revenue", error: err.message });
  }
});

// 🔹 Total clients visited
router.get("/clients", async (req, res) => {
  try {
    const totalClients = await User.countDocuments();
    res.json({ totalClients });
  } catch (err) {
    res.status(500).json({ message: "Error fetching client count" });
  }
});

// 🔹 Dine-in vs Take-away percentage
router.get("/percentages", async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const dineInCount = await Order.countDocuments({ type: "dine-in" });
    const takeAwayCount = await Order.countDocuments({ type: "take-away" });

    const dineInPercentage = totalOrders ? ((dineInCount / totalOrders) * 100).toFixed(2) : 0;
    const takeAwayPercentage = totalOrders ? ((takeAwayCount / totalOrders) * 100).toFixed(2) : 0;

    res.json({
      totalOrders,
      dineInPercentage,
      takeAwayPercentage,
    });
  } catch (err) {
    res.status(500).json({ message: "Error calculating percentages" });
  }
});

// 🔹 Daily order stats + served counts
router.get("/orders", async (req, res) => {
  try {
    const { start, end } = getDateRange(1);

    const [totalOrders, servedOrders, dineIn, takeAway] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      Order.countDocuments({ served: true, createdAt: { $gte: start, $lte: end } }),
      Order.countDocuments({ type: "dine-in", createdAt: { $gte: start, $lte: end } }),
      Order.countDocuments({ type: "take-away", createdAt: { $gte: start, $lte: end } }),
    ]);

    res.json({
      date: new Date().toLocaleDateString(),
      totalOrders,
      servedOrders,
      dineInOrders: dineIn,
      takeAwayOrders: takeAway,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching daily orders" });
  }
});

module.exports = router;
