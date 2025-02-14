import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const response = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>", // ✅ Replace with verified sender email
      to: [email],
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}`,
    });

    console.log("Resend API Response:", response);

    // Store OTP for verification (Use a DB in production)
    otpStorage[email] = otp;

    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Resend API Error:", error);
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
