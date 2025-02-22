import Subscription from "../models/subscription.model.js";

const plans = [
  { name: "Free", price: 0, tweets: 1 },
  { name: "Bronze", price: 100, tweets: 3 },
  { name: "Silver", price: 300, tweets: 5 },
  { name: "Gold", price: 1000, tweets: Infinity }
];

export const createSubscription = async (userId, planName) => {
    const selectedPlan = plans.find(p => p.name.toLowerCase() === planName.toLowerCase());

    if (!selectedPlan) {
        throw new Error("Invalid subscription plan.");
    }

    const newSubscription = new Subscription({
        userId,
        plan: selectedPlan.name,
        tweetsRemaining: selectedPlan.tweets
    });

    await newSubscription.save();
};
