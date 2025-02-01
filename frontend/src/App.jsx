import { Navigate, Route, Routes } from "react-router-dom";
import './index.css';
import { useState } from "react";

import HomePage from "./pages/home/HomePage";
import { Toaster } from "react-hot-toast";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='flex max-w-6xl mx-auto'>
			{/* Common component, bc it's not wrapped with Routes */}
			{authUser && <Sidebar />}
			<Routes>
				<Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
				<Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
				<Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
				<Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to='/login' />} />
				<Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
				<Route path='/record' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
			</Routes>
			{authUser && <RightPanel />}
			<Toaster />
      </div>
    </>
  )
}

export default App
