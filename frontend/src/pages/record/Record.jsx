import React, { useState, useRef } from "react";
import { Mic, Square, Send, Upload } from "lucide-react";
import toast from "react-hot-toast";
import UseAuth from "./UseAuth";

export default function Record() {
  const { user } = UseAuth(); // ✅ Hooks should always be at the top level
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  if (!user?.email) {
    return <p>Loading user data...</p>;
  }

  const startRecording = async () => {
    const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
    if (!(hours === 10 || (hours === 11 && minutes === 0))) {
      toast.error("Recordings are only available between 10:00 AM and 11:00 AM.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size > 100 * 1024 * 1024) {
          toast.error("Audio file size exceeds 100MB limit");
          return;
        }
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast.error("Error accessing microphone");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleSendOtp = async () => {
    if (!user?.email) {
      toast.error("User email not found. Please log in.");
      return;
    }

    try {
      const response = await fetch("/api/otp/send-otp", {
        method: "POST",
        body: JSON.stringify({ email: user.email }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send OTP");
      }

      setIsOtpSent(true);
      toast.success("OTP sent to your email!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleVerifyOtp = async () => {
    if (!user?.email || !otp) {
      toast.error("Please enter OTP");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const response = await fetch("/api/otp/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email: user.email, otp }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Invalid OTP");
      }

      toast.success("OTP verified successfully!");
      setIsOtpVerified(true);
      setIsOtpSent(false);
      setOtp("");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handlePostTweet = async () => {
    if (!audioBlob) {
      toast.error("No audio recorded!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("text", "New audio tweet");
      formData.append("audio", audioBlob);

      const response = await fetch("/api/posts/create", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to post audio tweet");
      }

      toast.success("Audio tweet posted successfully!");
      setAudioBlob(null);
      setIsOtpVerified(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Record Audio Tweet</h1>

      <div className="bg-gray-900 rounded-lg p-6">
        <div className="flex items-center gap-4 mb-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 flex items-center gap-2"
            >
              <Mic size={20} />
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 flex items-center gap-2"
            >
              <Square size={20} />
              Stop Recording
            </button>
          )}
        </div>

        {audioBlob && (
          <div className="space-y-4">
            <audio controls src={URL.createObjectURL(audioBlob)} className="w-full" />

            {!isOtpSent && !isOtpVerified && (
              <button
                onClick={handleSendOtp}
                className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 flex items-center gap-2"
              >
                <Send size={20} />
                Send OTP
              </button>
            )}

            {isOtpSent && !isOtpVerified && (
              <div className="flex gap-4">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="p-2 rounded border border-gray-600"
                />
                <button
                  onClick={handleVerifyOtp}
                  disabled={isVerifyingOtp}
                  className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
                >
                  {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            )}

            {isOtpVerified && (
              <button
                onClick={handlePostTweet}
                className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600 flex items-center gap-2"
              >
                <Upload size={20} />
                Post Tweet
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
