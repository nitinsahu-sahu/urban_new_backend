const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const morgan = require("morgan"); // <-- Morgan imported here
const path = require("path");
const os = require("os");
const { pool, initializeDatabase } = require("./dbhelper");

// Setup middleware
app.use(morgan("combined")); // <-- Logs requests to console

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(cors());
app.use(express.json({
  verify: (req, res, buf, encoding) => {
    req.rawBody = buf.toString();
  },
  limit: '10mb'
}));
// app.use(express.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Routes
const users = require("./private/users/router_users");
const verify_otp = require("./private/otp_system/router_otp");
const profile = require("./private/profile/get_profile.router");
const products = require("./private/products/router_products");
const brand = require("./private/brand/router_brand");
const category = require("./private/category/router_category");
const address = require("./private/address/router_address");
const orders = require("./private/orders/router_orders");
const app_default = require("./private/app_default/app_default_route");
const product_ratings = require("./private/ratings/product_ratings.routes");
const spacial_offers = require("./private/spacial_offers/spacial_offers.routes");
const wishlist = require("./private/wishlist/router_wishlist");
const offer_coupon = require("./private/offer_coupon/offer_coupon.routes");
const home_banner = require("./private/home_banner/router_home_banner");
const product_offers = require("./private/product_offers/router_product_offers");
const notification = require("./private/notification/router_notification");
const payments = require("./private/payments/router_payments");
const payment = require("./private/routes/payment.routes");
const { handleUpload } = require("./private/upload/upload_file");
const errorHandler = require("./private/methods/errorHandler");

// Status route
app.get("/status", (request, response) => {
  response.json({
    success: true,
    message: "Server is active",
    info: "node.js, Express, and Postgres API Developed By Deepak Gupta",
    server: os.platform(),
    env: process.env.ENVIRONMENT,
    db_user_name: process.env.DB_USER_MYSQL,
    api: `Urban Dental API (${process.env.ENVIRONMENT})`,
  });
});

// IMPORTANT: Webhook route के लिए raw body parser
app.use('/payment/pg/webhook', express.raw({ 
  type: 'application/json',
  limit: '5mb' 
}));

// Mount routes
app.use("/users", users);
app.use("/verify_otp", verify_otp);
app.use("/profile", profile);
app.use("/products", products);
app.use("/brand", brand);
app.use("/category", category);
app.use("/address", address);
app.use("/orders", orders);
app.use("/app_default", app_default);
app.use("/product_ratings", product_ratings);
app.use("/spacial_offers", spacial_offers);
app.use("/offer_coupon", offer_coupon);
app.use("/home_banner", home_banner);
app.use("/product_offers", product_offers);
app.use("/notification", notification);
app.use("/payments", payments);
app.use("/payment", payment);
app.use("/wishlist", wishlist);
app.post("/upload", upload.single("file"), handleUpload);

// Global error handler
app.use(errorHandler);

// Uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// ==================== DATABASE INITIALIZATION & SERVER START ====================
const startServer = async () => {
  try {
    // Step 1: Database Connection
    await pool.connect();
    await initializeDatabase();
    // Step 3: Start Server
    const port = process.env.RUN_PORT || 3000;
    app.listen(port, () => {
      console.log("═══════════════════════════════════════════════════");
      console.log(`🚀 Server running on: http://localhost:${port}`);
      console.log(`🌍 Environment: ${process.env.ENVIRONMENT || 'development'}`);
      console.log(`📅 Started at: ${new Date().toLocaleString()}`);
      console.log(`💻 Platform: ${os.platform()}`);
      console.log("═══════════════════════════════════════════════════");
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    console.error("Error details:", error);
    
    // Agar database connection fail ho jaye to server start nahi hoga
    if (error.code === 'ECONNREFUSED') {
      console.error("💡 Tip: Check if PostgreSQL is running");
    }
    
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  // Don't exit, just log
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  try {
    await pool.end();
  } catch (err) {
    console.error("Error closing database connection:", err);
  }
  process.exit(0);
});

process.on("SIGINT", async () => {
  try {
    await pool.end();
  } catch (err) {
    console.error("Error closing database connection:", err);
  }
  process.exit(0);
});

// ==================== START SERVER ====================
startServer();