import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/user.model.js"; // Adjust the path based on your project structure

dotenv.config(); // Load environment variables

const updateUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const result = await User.updateMany(
      { subscription: { $exists: false } }, // Find users without subscription field
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

    console.log(`✅ Users updated: ${result.modifiedCount}`);
  } catch (error) {
    console.error("❌ Error updating users:", error);
  } finally {
    mongoose.connection.close();
  }
};

updateUsers();
