import { createSubscription } from "../services/subscription.service.js";

export const subscribeUser = async (req, res) => {
    try {
        const { userId, plan } = req.body;

        await createSubscription(userId, plan);
        res.status(201).json({ message: "Subscription created successfully!" });

    } catch (error) {
        console.error("Error creating subscription:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
export const confirmSubscription = async (req, res) => {
    console.log("Subscription API Hit of confirm"); // ✅ Debugging
    res.status(200).json({ message: "Subscription confirmed" });
  };
  
