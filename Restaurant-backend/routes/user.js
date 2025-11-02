const express = require("express");
const router = express.Router();
const User = require("../models/userModel");

/* ============================
   ✅ Create or Update User
=============================== */
router.post("/", async (req, res) => {
  try {
    const { name, address, contact, numberOfPersons } = req.body;

    if (!contact) {
      return res.status(400).json({ message: "Contact number is required" });
    }

    const trimmedContact = contact.trim();

    // Check if user already exists by contact
    let user = await User.findOne({ contact: trimmedContact });

    if (user) {
      // Update existing user details
      user.numberOfPersons = numberOfPersons ?? user.numberOfPersons;
      if (name) user.name = name;
      if (address) user.address = address;
      await user.save();

      return res.json({
        message: "User already exists — updated details",
        user,
      });
    }

    // Validate required fields for new user
    if (!name || !address) {
      return res.status(400).json({
        message: "Name and address are required for new users",
      });
    }

    // Create new user
    const newUser = await User.create({
      name,
      address,
      contact: trimmedContact,
      numberOfPersons,
    });

    return res.json({
      message: "New user created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating/updating user:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

/* ============================
   ✅ Get User by Contact Number
   (must come BEFORE /:id route)
=============================== */
router.get("/", async (req, res) => {
  try {
    const { contact } = req.query;

    // If ?contact is provided, find by contact number
    if (contact) {
      const user = await User.findOne({ contact });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json(user);
    }

    // Otherwise return all users
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});

/* ============================
   ✅ Get Unique Contact Count
=============================== */
router.get("/count/unique-contacts", async (req, res) => {
  try {
    const uniqueContacts = await User.distinct("contact");
    const countUnique = uniqueContacts.length;
    return res.status(200).json({ uniqueContactCount: countUnique });
  } catch (err) {
    console.error("Error counting unique contacts:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

/* ============================
   ✅ Alternative Unique Count
=============================== */
router.get("/count/unique", async (req, res) => {
  try {
    const uniqueContacts = await User.distinct("contact");
    const count = uniqueContacts.length;

    res.json({
      message: "Unique users based on contact number",
      uniqueUserCount: count,
    });
  } catch (error) {
    console.error("Error fetching unique users:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ============================
   ✅ Get User by ID
=============================== */
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    res.status(400).json({
      message: "Invalid user ID or server error",
      error: err.message,
    });
  }
});

module.exports = router;
