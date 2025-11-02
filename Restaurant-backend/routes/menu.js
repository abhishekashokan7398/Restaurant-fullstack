const express = require("express");
const router = express.Router();
const Menu = require("../models/menuModel");
const upload = require("../utils/multer");
const cloudinary  = require("../config/cloudinary");
const fs = require("fs");


// ✅ CREATE (Add new food item)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category, averagePrepTime } = req.body;

    if (!name || !price || !category || !averagePrepTime) {
      return res.status(400).json({ message: "Name, price, category, and averagePrepTime are required" });
    }

    let imageUrl = "";
    let imagePublicId = "";

    if (req.file) {
      const folderPath = `restaurant/menu/${category}`;
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: folderPath,
      });
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;

      // Remove temp file
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }

    const menu = await Menu.create({
      name,
      description,
      price,
      category,
      averagePrepTime,
      imageUrl,
      imagePublicId,
    });

    res.status(201).json({ message: "Menu item created successfully", menu });
  } catch (error) {
    console.error("Error creating menu item:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ READ (Get all food items)
router.get("/", async (req, res) => {
  try {
    const items = await Menu.find().sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ READ (Get food items by exact category name)


// ✅ READ (Get all unique categories)
router.get("/categories", async (req, res) => {
  try {
    const categories = await Menu.distinct("category");
    if (categories.length === 0) {
      return res.status(404).json({ message: "No categories found" });
    }

    res.status(200).json({
      message: "Available categories",
      count: categories.length,
      categories: categories.sort(),
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ UPDATE (Update food item and replace image)
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, averagePrepTime } = req.body;

    const item = await Menu.findById(id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });

    if (req.file) {
      // Delete old image from Cloudinary
      if (item.imagePublicId) {
        await cloudinary.uploader.destroy(item.imagePublicId);
      }

      // Upload new image
      const folderPath = `restaurant/menu/${category || item.category}`;
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: folderPath,
      });

      item.imageUrl = result.secure_url;
      item.imagePublicId = result.public_id;

      // Remove temp file
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }

    item.name = name || item.name;
    item.description = description || item.description;
    item.price = price || item.price;
    item.category = category || item.category;
    item.averagePrepTime = averagePrepTime || item.averagePrepTime;

    await item.save();

    res.status(200).json({ message: "Menu item updated successfully", item });
  } catch (error) {
    console.error("Error updating menu item:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ DELETE (Delete food item and remove image from Cloudinary)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Menu.findById(id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });

    if (item.imagePublicId) {
      await cloudinary.uploader.destroy(item.imagePublicId);
    }

    await Menu.findByIdAndDelete(id);
    res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;

    // Case-insensitive match (e.g. 'burgers' == 'Burgers')
    const items = await Menu.find({
      category: { $regex: new RegExp(`^${category}$`, "i") },
    });

    if (!items || items.length === 0) {
      return res.status(404).json({ message: `No items found for ${category}` });
    }

    res.status(200).json({
      message: `Items in category: ${category}`,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error("Error fetching category items:", error);
    res.status(500).json({ message: "Server error", error });
  }
});


module.exports = router;
