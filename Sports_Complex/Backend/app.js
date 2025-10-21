//iT2p1inTx5Hixzw4

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");

const userRoutes = require("./Route/UserRoutes");
const paymentRoutes = require("./Route/PaymentRoutes"); 
const eventRoutes = require('./Route/eventRoutes');
const inventoryRoutes = require("./Route/InventoryRoutes");
const feedbackRoutes = require('./Route/feedback.routes');
const ticketRoutes = require('./Route/ticket.routes');
const bookingRoutes = require('./Route/bookingRoutes');

const app = express();

// Middleware
app.use(express.json());

// Request logging for debugging (shows incoming requests in console)
app.use(morgan('dev'));

// Explicit CORS policy: allows the frontend dev server and common headers
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin like mobile apps or curl
    if (!origin) return callback(null, true);
    try {
      const url = new URL(origin);
      // Allow any localhost or 127.0.0.1 origin (any port)
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return callback(null, true);
      }
    } catch (e) {
      // not a valid URL - fallthrough to deny
    }
    // Add other allowed hostnames if needed (example: production host)
    const allowed = ['http://your-production-host.com'];
    if (allowed.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error('CORS policy: Origin not allowed'));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/payments", paymentRoutes); 
app.use('/api/v1/events', eventRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/bookings', bookingRoutes);
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

// Add connection event listeners for debugging
mongoose.connection.on('connecting', () => {
  console.log('MongoDB connecting...');
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Connect MongoDB with improved error handling
mongoose.connect("mongodb+srv://admin:iT2p1inTx5Hixzw4@cluster0.vig2cxt.mongodb.net/test?retryWrites=true&w=majority", mongoOptions)
  .then(() => {
    console.log("MongoDB connection established");
    app.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch(err => {
    console.error("MongoDB connection failed:", err);
    console.log("Please check your internet connection and MongoDB Atlas configuration");
    process.exit(1);
  });