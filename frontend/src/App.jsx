import { Navigate, Route, Routes } from "react-router-dom";
import './index.css';


import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import Subscriptions from "./pages/subscriptions/Subscriptions";
import Location from "./pages/location/Location";
import Record from "./pages/record/Record";

import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";

import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {
	const { data: authUser, isLoading } = useQuery({
		queryKey: ["authUser"],
		queryFn: async () => {
			try {
				// ✅ Check if token exists
				const token = localStorage.getItem("token");
				if (!token) {
					console.error("No token found in localStorage");
					return null;
				}
				console.log("The local storage token is ", token);

				// ✅ Send token in Authorization header
				const res = await fetch("/api/auth/me", {
					method: "GET",
					credentials: "include",
					headers: {
						"Authorization": `Bearer ${localStorage.getItem("token")}`,
						"Content-Type": "application/json",
					},
				});

				// ✅ Check if response is valid JSON before parsing
				const text = await res.text();
				if (!text) {
					console.error("Empty response from server");
					throw new Error("Empty response from server");
				}

				const data = JSON.parse(text);

				// ✅ Handle authentication errors
				if (!res.ok) {
					console.error("Auth Error:", data.error || "Something went wrong");
					throw new Error(data.error || "Something went wrong");
				}

				console.log("Authenticated User:", data);
				return data;
			} catch (error) {
				console.error("Error fetching auth user:", error.message);
				return null;
			}
		},
		retry: false,
	});
	

	if (isLoading) {
		return (
			<div className='h-screen flex justify-center items-center'>
				<LoadingSpinner size='lg' />
			</div>
		);
	}

	return (
		<div className='flex max-w-6xl mx-auto'>
			{/* Common component, bc it's not wrapped with Routes */}
			{authUser && <Sidebar />}
			<Routes>
				<Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
				<Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
				<Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
				<Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to='/login' />} />
				<Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
				<Route path='/record' element={authUser ? <Record /> : <Navigate to='/login' />} />
				<Route path='/subscriptions' element={authUser ? <Subscriptions /> : <Navigate to='/login' />} />
				<Route path='/location' element={authUser ? <Location /> : <Navigate to='/login' />} />
			</Routes>
			{authUser && <RightPanel />}
			<Toaster />
		</div>
	);
}

export default App;
