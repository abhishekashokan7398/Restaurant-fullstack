// controllers/orderController.js

const mongoose = require("mongoose");
const Order = require("../models/Order");
const Table = require("../models/Table");
const User = require("../models/userModel");
const Chef = require("../models/chefs");
const Setting = require("../models/Setting");
/**
 * Create an order (dine-in or take-away) with safe least-orders-first chef assignment
 */
exports.createOrder = async (req, res) => {
  try {
    let { type, contact, items, amount, totalAmount, cookingTime } = req.body;

    // ✅ Validation
    if (!type) return res.status(400).json({ success: false, message: "Order type is required." });
    type = type.toLowerCase();
    if (!["dine-in", "take-away"].includes(type))
      return res.status(400).json({ success: false, message: "Invalid order type." });
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ success: false, message: "At least one item is required." });
    if (typeof amount !== "number" || amount < 0)
      return res.status(400).json({ success: false, message: "Invalid amount." });

    totalAmount = typeof totalAmount === "number" && totalAmount >= amount ? totalAmount : amount;
    if (typeof cookingTime !== "number" || cookingTime < 0)
      return res.status(400).json({ success: false, message: "Invalid cooking time." });

    let user = null;
    let tableAssigned = null;
    let partySize = 1;

    // ✅ Handle dine-in logic
    if (type === "dine-in") {
      if (!contact || typeof contact !== "string")
        return res.status(400).json({ success: false, message: "Contact required for dine-in." });

      user = await User.findOne({ contact: contact.trim() });
      if (!user) return res.status(400).json({ success: false, message: "Please enter a valid phone number." });

      partySize = user.numberOfPersons || 1;

      tableAssigned = await Table.findOneAndUpdate(
        { chairs: { $gte: partySize }, isReserved: false },
        { $set: { isReserved: true, reservedAt: new Date() } },
        { sort: { chairs: 1 }, new: true }
      );

      if (!tableAssigned) {
        return res.status(400).json({ success: false, message: `No table available for ${partySize} persons.` });
      }
    }

    // 🔁 Concurrency-safe chef assignment (least-orders-first)
    const assignedChef = await Chef.findOneAndUpdate(
      {},
      { $inc: { ordersTaken: 1 }, $set: { lastAssignedAt: new Date() } },
      {
        sort: { ordersTaken: 1, _id: 1 }, // pick chef with least orders
        new: true,                        // return updated chef
      }
    );

    if (!assignedChef) {
      return res.status(400).json({ success: false, message: "No chefs available." });
    }

    // ✅ Create the order
    const orderData = {
      type,
      userId: user ? user._id : null,
      items,
      amount,
      totalAmount,
      cookingTime,
      table: tableAssigned ? tableAssigned._id : null,
      served: false,
      chef: assignedChef._id,
      ...(type === "dine-in" && { partySize }),
    };

    const newOrder = await Order.create(orderData);
    console.log("✅ Order created:", newOrder._id);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order: newOrder,
      table: tableAssigned,
      chef: { id: assignedChef._id, name: assignedChef.name },
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating order.",
      error: error.message,
    });
  }
};

/**
 * Update order status (served / unserved)
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { served } = req.body;
    const order = await Order.findById(req.params.id).populate("table").populate("chef");

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.served = served;
    order.servedAt = served ? new Date() : null;
    await order.save();

    // ✅ Release table if dine-in order served
    if (served && order.type === "dine-in" && order.table) {
      await Table.findByIdAndUpdate(order.table._id, {
        isReserved: false,
        reservedAt: null,
      });
    }

    

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("❌ Error updating order:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};


/* -------------------------------------------------------
   🟢 GET ALL ORDERS
------------------------------------------------------- */
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("table")
      .populate("chef", "name speciality")
      .populate("userId", "name phone")
      .sort({ createdAt: -1 });

    const mapped = orders.map((o) => ({
      id: o._id.toString(),
      tableId: o.table?._id?.toString() || null,
      tableNumber: o.table?.number || null,
      chairs: o.table?.chairs || null,
      time: new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      items: o.items.length,
      totalQty: o.items.reduce((sum, it) => sum + (it.quantity || 0), 0),
      type: o.type === "dine-in" ? "Dine In" : "Take Away",
      status: o.served ? "Served" : o.type === "dine-in" ? "Processing" : "Not Picked",
      statusColor: o.served ? "green" : o.type === "dine-in" ? "orange" : "gray",
      itemsDetails: o.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
    }));

    res.status(200).json({ success: true, orders: mapped });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Server error retrieving orders", error: error.message });
  }
};

/**
 * Get order by ID
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name contact")
      .populate("chef", "name speciality")
      .populate("table");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("❌ Error fetching order by id:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching order",
      error: error.message,
    });
  }
};

/**
 * Get total orders count
 */
exports.getTotalOrders = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    res.json({ message: "Total orders retrieved successfully", totalOrders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching total orders", error: error.message });
  }
};

/**
 * Get total revenue
 */
exports.getTotalRevenue = async (req, res) => {
  try {
    const result = await Order.aggregate([{ $group: { _id: null, totalRevenue: { $sum: "$amount" } } }]);
    const totalRevenue = result[0]?.totalRevenue || 0;
    res.json({ message: "Total revenue calculated successfully", totalRevenue });
  } catch (error) {
    res.status(500).json({ message: "Error calculating revenue", error: error.message });
  }
};

/**
 * Get revenue summary by period
 */
exports.getRevenueSummary = async (req, res) => {
  try {
    const { period = "daily" } = req.query;
    const groupBy =
      {
        daily: { $dayOfMonth: "$createdAt" },
        weekly: { $week: "$createdAt" },
        monthly: { $month: "$createdAt" },
        yearly: { $year: "$createdAt" },
      }[period] || { $dayOfMonth: "$createdAt" };

    const results = await Order.aggregate([
      { $group: { _id: groupBy, revenue: { $sum: "$totalAmount" } } },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      period,
      data: results.map((r) => ({ label: r._id, revenue: r.revenue })),
    });
  } catch (error) {
    console.error("❌ Error in getRevenueSummary:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * Get order count by type & period
 */
/**
 * Get order count by type & period (with served %, dine-in %, take-away %)
 */
exports.getOrderCountByTypeAndPeriod = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Helper: count dine-in, take-away, and served
    const countByType = async (startDate) => {
      const result = await Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            dineIn: { $sum: { $cond: [{ $eq: ["$type", "dine-in"] }, 1, 0] } },
            takeAway: { $sum: { $cond: [{ $eq: ["$type", "take-away"] }, 1, 0] } },
            served: { $sum: { $cond: ["$served", 1, 0] } },
          },
        },
      ]);

      const stats = result[0] || { dineIn: 0, takeAway: 0, served: 0 };

      // Total orders
      const totalOrders = stats.dineIn + stats.takeAway;

      // Prevent division by zero
      if (totalOrders === 0) {
        return { ...stats, dineInPercent: 0, takeAwayPercent: 0, servedPercent: 0 };
      }

      // 🧮 Calculate percentages
      const dineInActive = Math.max(stats.dineIn - stats.served, 0); // active dine-ins (not yet served)
      const dineInPercent = ((dineInActive / totalOrders) * 100).toFixed(2);
      const takeAwayPercent = ((stats.takeAway / totalOrders) * 100).toFixed(2);
      const servedPercent = ((stats.served / totalOrders) * 100).toFixed(2);

      return {
        ...stats,
        totalOrders,
        dineInPercent: Number(dineInPercent),
        takeAwayPercent: Number(takeAwayPercent),
        servedPercent: Number(servedPercent),
      };
    };

    const [daily, weekly, monthly] = await Promise.all([
      countByType(startOfDay),
      countByType(startOfWeek),
      countByType(startOfMonth),
    ]);

    res.json({
      message: "Order summary retrieved",
      daily,
      weekly,
      monthly,
    });
  } catch (error) {
    console.error("❌ Error fetching order summary:", error);
    res.status(500).json({ message: "Error fetching order summary", error: error.message });
  }
};


/**
 * Get chef order count by ID
 */
exports.getChefOrderCountById = async (req, res) => {
  try {
    const { chefId } = req.params;
    const totalOrders = await Order.countDocuments({ chef: chefId });
    res.status(200).json({ success: true, chefId, totalOrders });
  } catch (error) {
    console.error("❌ Error fetching chef order count by id:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Fix chefs missing 'ordersTaken' field
 */
exports.fixChefsMissingOrdersTaken = async (req, res) => {
  try {
    const result = await Chef.updateMany(
      { ordersTaken: { $exists: false } },
      { $set: { ordersTaken: 0 } }
    );

    console.log(`✅ Fixed ${result.modifiedCount} chefs missing ordersTaken field`);

    const chefs = await Chef.find({});
    res.json({
      success: true,
      message: `Fixed ${result.modifiedCount} chefs`,
      chefs: chefs.map((chef) => ({
        id: chef._id,
        name: chef.name,
        ordersTaken: chef.ordersTaken,
      })),
    });
  } catch (error) {
    console.error("❌ Error fixing chefs:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Auto-mark old dine-in orders as served and release tables
 */
const markOrdersAsServed = async () => {
  try {
    const cutoff = new Date(Date.now() - 45 * 60 * 1000); // 45 mins
    const ordersToServe = await Order.find({
      served: false,
      createdAt: { $lte: cutoff },
      table: { $ne: null },
    });

    if (ordersToServe.length === 0) return;

    const orderIds = ordersToServe.map((o) => o._id);
    const tableIds = ordersToServe.map((o) => o.table);

    await Order.updateMany(
      { _id: { $in: orderIds } },
      { served: true, servedAt: new Date() }
    );

    await Table.updateMany(
      { _id: { $in: tableIds } },
      { isReserved: false, reservedAt: null }
    );

    console.log(`✅ Auto-served ${ordersToServe.length} orders and released tables`);
  } catch (err) {
    console.error("❌ Error auto-serving orders:", err.message);
  }
};

setInterval(markOrdersAsServed, 60 * 1000);