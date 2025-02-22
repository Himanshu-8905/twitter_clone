import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
	  username: { type: String, required: true, unique: true },
	  fullName: { type: String, required: true },
	  password: { type: String, required: true, minLength: 6 },
	  email: { type: String, required: true, unique: true },
	  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
	  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
	  profileImg: { type: String, default: "" },
	  coverImg: { type: String, default: "" },
	  bio: { type: String, default: "" },
	  link: { type: String, default: "" },
	  likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post", default: [] }],
  
	  // Subscription field (Ensure this exists)
	  subscription: {
		plan: { type: String, enum: ["Free", "Bronze", "Silver", "Gold"], default: "Free" },
		postLimit: { type: Number, default: 1 }, // Default to Free plan (1 tweet per month)
		subscribedAt: { type: Date, default: null },
		expiresAt: { type: Date, default: null },
	  },
	},
	{ timestamps: true }
  );
  
  const User = mongoose.model("User", userSchema);
  export default User;
  