const express = require("express");
const router = express.Router();
const {
  getTables,
  createTable,
  deleteTable,
  updateTableReservation,
  releaseTable,
  getTableAvailability,
} = require("../controllers/tableController");

// Get all tables
router.get("/", getTables);

// Get availability of tables
router.get("/availability", getTableAvailability);

// Create a new table
router.post("/", createTable);

// Delete a table
router.delete("/:id", deleteTable);

// Reserve or update a table’s status
router.put("/:id/reserve", updateTableReservation);

// Release a reserved table
router.put("/:id/release", releaseTable);

module.exports = router;
