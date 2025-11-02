const Chef = require("../models/chefs"); // adjust path if needed

// ✅ Add a new chef
exports.addChef = async (req, res) => {
  try {
    const { name } = req.body;

    
    
    if (!name) {
      return res.status(400).json({ message: "Chef name is required" });
    }

    const newChef = new Chef({ name });
    await newChef.save();

    res.status(201).json({
      success: true,
      message: "Chef added successfully",
      chef: newChef,
    });
  } catch (error) {
    console.error("Add Chef Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Get all chefs
exports.getAllChefs = async (req, res) => {
  try {
    const chefs = await Chef.find();
    
    res.status(200).json(chefs);
  } catch (error) {
   
    res.status(500).json({ message: "Server error", error });
  }
};


