
import React from "react";
import { Check } from "lucide-react";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";

const stripePromise = loadStripe("pk_test_51QsfcDFLb2BdTcS1sBL90TGF1HuKTrGYramI0hQJUVcoZhMppVLgfF3hlXhRN1gMsuQytArftlEH40jLhBIgBDsc00sVN3ODnh");

const plans = [
  { name: "Free", price: 0, tweets: 1, features: ["1 tweet per month", "Basic features"] },
  { name: "Bronze", price: 100, tweets: 3, features: ["3 tweets per month", "Audio tweets", "Priority support"] },
  { name: "Silver", price: 300, tweets: 5, features: ["5 tweets per month", "Audio tweets", "Priority support", "Analytics"] },
  { name: "Gold", price: 1000, tweets: Infinity, features: ["Unlimited tweets", "Audio tweets", "Priority support", "Analytics", "Verified badge"] },
];

export default function Subscriptions() {
  const navigate = useNavigate();

  const handleSubscribe = async (plan) => {
    try {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
  
     // Allow subscriptions only between 10:00 AM and 11:00 AM
      if (!(hours === 10 || (hours === 11 && minutes === 0))) {
        toast.error("Subscriptions are only available between 10:00 AM and 11:00 AM.");
        return;
      }
  
      const token = localStorage.getItem("token");
  
      if (!token) {
        toast.error("You must be logged in to subscribe.");
        return;
      }
  
      const response = await fetch("https://twitter-clone-i7ah.onrender.com/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: plan.name, price: plan.price }),
      });
  
      const session = await response.json();
      console.log("session id is " , session);
  
      if (session.error) {
        toast.error(session.error);
        return;
      }
  
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: session.id });
    } catch (error) {
      console.error("Subscription Error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };
  

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Subscription Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
            <p className="text-3xl font-bold mb-4">
              {plan.price === 0 ? "Free" : `₹${plan.price}`}
              <span className="text-sm text-gray-400">/month</span>
            </p>
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check size={16} className="text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan)}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
            >
              Subscribe
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
