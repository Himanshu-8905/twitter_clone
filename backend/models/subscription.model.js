import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
	{
		userId: { 
			type: mongoose.Schema.Types.ObjectId, 
			ref: "User", 
			required: true, 
			unique: true 
		},
		plan: { 
			type: String, 
			required: true,
			enum: ["free", "basic", "premium"], // Restrict to predefined plans
		},
		postsRemaining: { 
			type: Number, 
			required: true, 
			default: 0 
		},
		renewalDate: { 
			type: Date, 
			required: true 
		},
	},
	{ timestamps: true }
);

const Subscription = mongoose.model("Subscription", SubscriptionSchema);
export default Subscription;
