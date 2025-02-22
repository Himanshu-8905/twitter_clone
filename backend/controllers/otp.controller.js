import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail", // Change as needed
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

// In-memory OTP storage (Replace this with DB logic in production)
const otpStorage = {};

// Send OTP to user's email
export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER, // Sender email
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}`,
    });

    // Store OTP for verification (Use a DB in production)
    otpStorage[email] = otp;

    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Nodemailer Error:", error);
    res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
};

// Verify OTP
export const verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  if (!otpStorage[email] || otpStorage[email] !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  delete otpStorage[email]; // Remove OTP after successful verification
  res.status(200).json({ message: "OTP verified successfully!" });
};
