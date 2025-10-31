import React from 'react';
// --- 1. IMPORT Navigate ---
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import Profile from './components/Profile/Profile';
import PublicProfile from './components/Profile/PublicProfile';
import Matches from './components/Matches/Matches';
import Home from './components/Home/Home';
import PrivateRoute from './components/Auth/PrivateRoute';
import Navbar from './components/Layout/Navbar';
// We removed CalendarView, so this is correct.

import { AuthProvider, useAuth } from './context/AuthContext';

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* --- 2. UPDATE PUBLIC ROUTES --- */}
      {/* If user is logged in, redirect / to /dashboard. Otherwise, show Home. */}
      <Route 
        path="/" 
        element={user ? <Navigate to="/dashboard" replace /> : <Home />} 
      />
      {/* If user is logged in, redirect /login to /dashboard. Otherwise, show Login. */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      {/* If user is logged in, redirect /signup to /dashboard. Otherwise, show Signup. */}
      <Route 
        path="/signup" 
        element={user ? <Navigate to="/dashboard" replace /> : <Signup />} 
      />
      
      {/* --- PRIVATE ROUTES (No Change) --- */}
      <Route 
        path="/dashboard" 
        element={<PrivateRoute><Dashboard /></PrivateRoute>} 
      />
      <Route 
        path="/profile" 
        element={<PrivateRoute><Profile /></PrivateRoute>} 
      />
      <Route 
        path="/matches" 
        element={<PrivateRoute><Matches /></PrivateRoute>} 
      />
      <Route 
        path="/profile/:userId" 
        element={<PrivateRoute><PublicProfile /></PrivateRoute>} 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
          <Navbar />
          
          {/* This 'pt-20' padding fixes the navbar overlap */}
          <main className="container mx-auto px-4 py-8 pt-20">
            <AppRoutes />
          </main>
          
          <ToastContainer position="top-right" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;