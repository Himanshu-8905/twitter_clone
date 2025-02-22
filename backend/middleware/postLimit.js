import User from "../models/user.model.js";
import Post from "../models/post.model.js";

export const checkPostLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Get the user's posts count
    const postCount = await Post.countDocuments({ userId: user._id });

    if (postCount >= user.subscription.postLimit) {
      return res.status(403).json({ error: "Post limit reached. Upgrade to post more." });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
