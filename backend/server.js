import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import nodemailer from "nodemailer";
import Stripe from 'stripe';
import User from './models/user.model.js';
import bodyParser from 'body-parser';

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import otpRoutes from "./routes/otp.route.js";
import cors from "cors";
import connectMongoDB from "./db/connectMongoDB.js";
import jwt from "jsonwebtoken";
import subscriptionRoutes from "./routes/subscription.route.js";
import { plans } from "./config/plans.js";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/otp", otpRoutes);
//app.use("/api/subscription", subscriptionRoutes);
//app.use("/api", subscriptionRoutes); 
app.use("/api/subscription", subscriptionRoutes);

const allowedOrigins = [
  "http://localhost:3000",
  "https://twitter-clone-i7ah.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  exposedHeaders: ["Authorization"],
}));

const transporter = nodemailer.createTransport({
  host: "gmail",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send Email Route
app.post("/api/send-email", async (req, res) => {
  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: "Missing email fields" });
  }

  try {
    const info = await transporter.sendMail({
      from: '"Twitter 👻" <himanshukpal890@gmail.com>', // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      text: "Message From Twitter", // plain text body
      html: html, // html body
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Stripe Checkout Session
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { plan, price } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: plan },
            unit_amount: price * 100,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscriptions`,
      metadata: { userId, plan },
    });

    res.json({ id: session.id });

    // ✅ Confirm subscription after 5 seconds instead of 2
    setTimeout(async () => {
      try {
        await confirmSubscription(userId, session.id);
      } catch (error) {
        console.error("Error confirming subscription:", error);
      }
    }, 5000); // 5-second delay for better stability

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Confirm Subscription Manually (for frontend retry)
app.post("/api/confirm-subscription", async (req, res) => {
  try {
    const { sessionId } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    await confirmSubscription(userId, sessionId);
    res.status(200).json({ message: "Subscription confirmed successfully" });

  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Helper function to confirm subscription
const confirmSubscription = async (userId, sessionId) => {
  try {

    // Fetch session details
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.payment_status !== "unpaid") {
      console.log("Payment not successful for session:");
      return;
    }

    const plan = session.metadata.plan;
    const planDetails = plans.find((p) => p.name === plan);

    if (!planDetails) {
      console.log("Invalid plan selected:", plan);
      return;
    }

    // Fetch user
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found:", userId);
      return;
    }

    // Update subscription
    user.subscription = {
      plan,
      postLimit: planDetails.tweets,
      subscribedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
    };

    await user.save();
    console.log("Subscription confirmed for user:", userId);
  } catch (error) {
    console.error("Subscription confirmation error:", error);
  }
};



// app.get("/api/user", async (req, res) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//       return res.status(401).json({ error: "No token provided" });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.userId;

//     const user = await User.findById(userId).select("-password");
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.status(200).json(user);
//   } catch (error) {
//     console.error("Error fetching user:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });




// app.get("/subscription", protectRoute, async (req, res) => {
//   try {
//     const userId = req.user.id; // Extract user ID from token
//     const user = await User.findById(userId).select("subscription"); // Fetch subscription details

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.json(user.subscription); // Send only subscription data
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });





app.get("/api/user", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/api/subscription", protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("subscription");
    console.log("useremail is " , user.email)
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.subscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).json({ error: "Server error" });
  }
});






// subcription part
import { checkPostLimit } from "./middleware/postLimit.js";
import Post from "./models/post.model.js";

app.post("/create", checkPostLimit, async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id;

    const newPost = new Post({
      userId,
      text,
      media: {
        img: req.body.img || null,
        video: req.body.video || null,
        audio: req.body.audio || null,
      },
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: "Failed to create post" });
  }
});

// update mongodb
import mongoose from "mongoose";
import { protectRoute } from "./middleware/protectRoute.js";

const updateUsers = async () => {
  try {
    await User.updateMany(
      { subscription: { $exists: false } }, 
      {
        $set: {
          subscription: {
            plan: "Free",
            postLimit: 1,
            subscribedAt: null,
            expiresAt: null,
          },
        },
      }
    );
  } catch (error) {
    console.error("❌ Error updating users:", error);
  }
};

// Run the update function when server starts
mongoose.connection.once("open", () => {
  console.log("🚀 Connected to MongoDB");
  updateUsers();
});


// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongoDB();
});
