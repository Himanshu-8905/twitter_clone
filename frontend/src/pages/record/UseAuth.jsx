import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie"; // Import js-cookie to read cookies

const UseAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Try fetching the token from cookies first
    let token = Cookies.get("token");

    // If not found in cookies, fallback to localStorage
    if (!token) {
      token = localStorage.getItem("token");
    }

    console.log("Token from storage/cookie:", token); // Debugging log

    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded Token:", decoded); // Check the structure of the token

        // Ensure token has an email or relevant user data
        if (decoded && decoded.email) {
          setUser(decoded);
        } else {
          console.warn("Token is valid but does not contain an email field");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  return { user };
};

export default UseAuth;
