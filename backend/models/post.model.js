import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		text: {
			type: String,
		},
		img: {
			type: String,
		},
		audio: {
			type: String, 
		},
		video: {
			type: String, 
		},
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		comments: [
			{
				text: {
					type: String,
					required: true,
				},
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					required: true,
				},
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		subscriptionPost: {
			type: Boolean,
			default: false, // True if it's a premium-only post
		},
	},
	{ timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;

