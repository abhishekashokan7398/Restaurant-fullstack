const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const { autoReleaseTables } = require('./controllers/tableController');
dotenv.config();
const app = express();

// CORS: allow your frontend origin
// app.use(cors({
//   origin: "https://restaurantabhi.netlify.app/",
//   credentials: true
// }));



app.use(cors({
  origin: '*' // Insecure for production!
}));



app.use(express.json());

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log('MongoDB connected✅');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};
connectDB();
app.get('/',(req,res)=>
{
  res.json("backend connected ");
})
// Routes
app.use("/api/menu", require("./routes/menu"));
app.use("/api/user", require("./routes/user"));
app.use("/api/order", require("./routes/order"));
app.use("/api/chefs", require("./routes/chef"));
app.use("/api/stats", require("./routes/stats"));
app.use("/api/tables", require("./routes/tableRoutes"));

//  AUTO-RELEASE SCHEDULER - Check every 5 minutes for tables to release
setInterval(autoReleaseTables, 5 * 60 * 1000); // Check every 5 minutes

// Also run once when server starts to clear any old reservations
autoReleaseTables();

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
