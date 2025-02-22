import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true, // Allow sending cookies
});

// Fetch user profile (protected route)
export const fetchUserProfile = async () => {
    try {
      const response = await api.get("/api/users/me");
      console.log("User Profile Response:", response); // Debugging log
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error.response?.data || error);
      return null;
    }
  };
  
