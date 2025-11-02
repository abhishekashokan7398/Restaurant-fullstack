const Menu = require("../models/menuModel");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");

exports.createMenuItem = async (req, res) => {

  
  try {
    const { name, description, price, category } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required: name, description, price, category" 
      });
    }

    //  Validate price is a number
    if (isNaN(price) || parseFloat(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid positive number"
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: "Image is required" 
      });
    }
  
    //  Upload to Cloudinary with error handling
    let result;
    try {
      result = await cloudinary.uploader.upload(req.file.path, {
        folder: `restaurant/menu/${category}`,
      });
    } catch (cloudinaryError) {
      // Clean up temp file
      try { fs.unlinkSync(req.file.path); } catch(e) {}
      
      return res.status(500).json({ 
        success: false,
        message: "Image upload failed", 
        error: cloudinaryError.message 
      });
    }

    
    //  Create menu item
    const menu = new Menu({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category: category.trim(),
      imageUrl: result.secure_url,
      imagePublicId: result.public_id,
    });

    await menu.save();

    // Clean up temp file
    try { 
      fs.unlinkSync(req.file.path); 
    } catch(e) {
      console.warn("⚠️ Could not delete temp file:", e.message);
    }

    res.status(201).json({ 
      success: true,
      message: "Menu item created successfully", 
      menu 
    });
    
  } catch (err) {
    console.error("❌ Error creating menu item:", err);
    
    // Clean up temp file on error
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch(e) {}
    }
    
    //  Handle duplicate key errors
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Menu item with this name already exists"
      });
    }
    
    //  Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    res.status(500).json({ 
      success: false,
      message: "Error creating menu item", 
      error: err.message 
    });
  }
};

exports.getMenuItems = async (req, res) => {
  try {
    const menus = await Menu.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: menus.length,
      menus
    });
  } catch (err) {
    console.error("❌ Error fetching menu items:", err);
    res.status(500).json({ 
      success: false,
      message: "Error fetching menu items",
      error: err.message 
    });
  }
};

exports.updateMenuItem = async (req, res) => {

  try {
    const { id } = req.params;
    const { name, description, price, category } = req.body;
    
    // Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Menu item ID is required"
      });
    }

    const menu = await Menu.findById(id);
    if (!menu) {
      return res.status(404).json({ 
        success: false,
        message: "Menu item not found" 
      });
    }

    if (req.file) {
      
      
      // Delete old image
      if (menu.imagePublicId) {
        try { 
          await cloudinary.uploader.destroy(menu.imagePublicId); 
     
        } catch(e){ 
          console.warn('⚠️ Cloudinary destroy warning:', e.message); 
        }
      }

      // Upload new image
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: `restaurant/menu/${category || menu.category}`,
      });

      menu.imageUrl = result.secure_url;
      menu.imagePublicId = result.public_id;
      
      // Clean up temp file
      try { 
        fs.unlinkSync(req.file.path); 
        
      } catch(e) {
        console.warn("⚠️ Could not delete temp file:", e.message);
      }
    }

    // ✅ Update fields if provided
    if (name) menu.name = name.trim();
    if (description) menu.description = description.trim();
    if (price) {
      if (isNaN(price) || parseFloat(price) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a valid positive number"
        });
      }
      menu.price = parseFloat(price);
    }
    if (category) menu.category = category.trim();

    await menu.save();

    res.json({ 
      success: true,
      message: "Menu item updated successfully", 
      menu 
    });
  } catch (err) {
    console.error("❌ Error updating menu item:", err);
    
    // Clean up temp file on error
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch(e) {}
    }
    
    res.status(500).json({ 
      success: false,
      message: "Error updating menu item", 
      error: err.message 
    });
  }
};

exports.getMenuByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!category) {
      return res.status(400).json({ 
        success: false,
        message: "Category parameter is required" 
      });
    }

    const menus = await Menu.find({ category: new RegExp(category, 'i') });

    res.json({
      success: true,
      category,
      count: menus.length,
      menus
    });
  } catch (err) {
    console.error("❌ Error fetching category items:", err);
    res.status(500).json({ 
      success: false,
      message: "Error fetching category items", 
      error: err.message 
    });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Menu item ID is required"
      });
    }

    const menu = await Menu.findById(id);
    if (!menu) {
      return res.status(404).json({ 
        success: false,
        message: "Menu item not found" 
      });
    }

    if (menu.imagePublicId) {
      try { 
        await cloudinary.uploader.destroy(menu.imagePublicId); 
        console.log("✅ Cloudinary image deleted");
      } catch(e){ 
        console.warn('⚠️ Cloudinary destroy warning:', e.message); 
      }
    }

    await Menu.findByIdAndDelete(id);

    res.json({ 
      success: true,
      message: "Menu item deleted successfully" 
    });
  } catch (err) {
    console.error("❌ Error deleting menu item:", err);
    res.status(500).json({ 
      success: false,
      message: "Error deleting menu item", 
      error: err.message 
    });
  }
};