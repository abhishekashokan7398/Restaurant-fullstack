const Table = require("../models/Table");

/* -------------------------------------------------------
   🟢 GET TABLE AVAILABILITY
------------------------------------------------------- */
exports.getTableAvailability = async (req, res) => {
  try {


    const total = await Table.countDocuments();
    const reserved = await Table.countDocuments({ isReserved: true });
    const free = total - reserved;

    res.status(200).json({
      success: true,
      total,
      reserved,
      free
    });
  } catch (error) {
    console.error("❌ Error getting table availability:", error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* -------------------------------------------------------
   🟢 GET ALL TABLES
------------------------------------------------------- */
exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ number: 1 });
    res.status(200).json({ success: true, tables });
  } catch (error) {
    console.error("❌ Error fetching tables:", error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* -------------------------------------------------------
   🟢 CREATE NEW TABLE
------------------------------------------------------- */
exports.createTable = async (req, res) => {
  try {

        const count = await Table.countDocuments();
    if (count >= 30) {
      return res.status(400).json({
        success: false,
        message: "Cannot create more than 30 tables."
      });
    }

    const { number, chairs } = req.body;
    if (number == null || chairs == null) {
      return res.status(400).json({
        success: false,
        message: "Table number and chairs count are required"
      });
    }

    const existing = await Table.findOne({ number });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Table with number ${number} already exists`
      });
    }

    const newTable = await Table.create({ 
      number, 
      chairs, 
      isReserved: false,
      reservedAt: null 
    });
    res.status(201).json({
      success: true,
      message: "Table created successfully",
      table: newTable
    });
  } catch (error) {
    console.error("❌ Error creating table:", error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* -------------------------------------------------------
   🟢 DELETE TABLE
------------------------------------------------------- */
exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ success: false, message: "Table not found" });

    if (table.isReserved) {
      return res.status(400).json({ success: false, message: "Cannot delete a reserved table" });
    }

    // Delete the table
    await Table.findByIdAndDelete(req.params.id);

    // ✅ Renumber remaining tables in ascending order
    const tables = await Table.find().sort({ number: 1 });

    for (let i = 0; i < tables.length; i++) {
      if (tables[i].number !== i + 1) {
        tables[i].number = i + 1;
        await tables[i].save();
      }
    }

    res.status(200).json({ success: true, message: "Table deleted and numbers updated" });
  } catch (err) {
    console.error("❌ Error deleting table:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------------------------------------------
   🟢 UPDATE TABLE RESERVATION STATUS (RESERVE)
------------------------------------------------------- */
exports.updateTableReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { isReserved } = req.body;

    if (typeof isReserved !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isReserved must be a boolean"
      });
    }

    const table = await Table.findById(id);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found"
      });
    }

    table.isReserved = isReserved;
    // Set reservation time when reserving, clear when releasing
    table.reservedAt = isReserved ? new Date() : null;
    await table.save();

    res.status(200).json({
      success: true,
      message: `Table reservation status updated: ${isReserved ? "Reserved" : "Released"}`,
      table
    });
  } catch (error) {
    console.error("❌ Error updating table reservation:", error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* -------------------------------------------------------
   🟢 RELEASE TABLE (alias for reservation off)
------------------------------------------------------- */
exports.releaseTable = async (req, res) => {
  try {
    const { id } = req.params;
    const table = await Table.findById(id);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found"
      });
    }

    table.isReserved = false;
    table.reservedAt = null; // Clear reservation time
    await table.save();

    res.status(200).json({
      success: true,
      message: "Table released successfully",
      table
    });
  } catch (error) {
    console.error("❌ Error releasing table:", error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* -------------------------------------------------------
   🟢 AUTO-RELEASE TABLES AFTER 40 MINUTES
------------------------------------------------------- */
exports.autoReleaseTables = async () => {
  try {
    const minutesToAutoRelease = 40; // Auto-release after 40 minutes
    const autoReleaseTime = new Date(Date.now() - minutesToAutoRelease * 60 * 1000);
    
    // Find tables that have been reserved for more than 40 minutes
    const tablesToRelease = await Table.find({
      isReserved: true,
      reservedAt: { $lte: autoReleaseTime }
    });

    // Release all tables that exceeded 40 minutes
    for (const table of tablesToRelease) {
      table.isReserved = false;
      table.reservedAt = null;
      await table.save();
     
    }
  } catch (error) {
    console.error("❌ Error auto-releasing tables:", error.message);
  }
};