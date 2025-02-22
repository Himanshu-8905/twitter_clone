import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      toast.error("No session ID found.");
      navigate("/subscriptions");
      return;
    }

    const confirmSubscription = async () => {
      try {
        const response = await fetch(`${window.location.origin}/api/confirm-subscription`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Error Response:", data);
          toast.error(data.error || "Subscription confirmation failed.");
        } else {
          toast.success("Subscription confirmed!");
        }
      } catch (error) {
        console.error("Subscription Confirmation Error:", error);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
        navigate("/subscriptions");
      }
    };

    confirmSubscription();
  }, [sessionId, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <h1 className="text-2xl font-bold">
        {loading ? "Processing your payment..." : "Redirecting..."}
      </h1>
    </div>
  );
}
