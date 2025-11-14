import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProductListPage from './pages/ProductListPage.jsx';
import BarcodeScanPage from './pages/BarcodeScanPage.jsx';
import AISuggestions from './components/AISuggestions.jsx';
import BackendDownPopup from './components/BackendDownPopup.jsx';

function App() {
  const [userId, setUserId] = useState(() => {
    // Retrieve userId from localStorage on app initialization
    return localStorage.getItem('userId');
  });
  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem('guestMode') === '1';
  });

  useEffect(() => {
    // Store userId in localStorage whenever it changes
    if (userId) {
      localStorage.setItem('userId', userId);
    } else {
      localStorage.removeItem('userId');
    }
  }, [userId]);

  useEffect(() => {
    if (isGuest) {
      localStorage.setItem('guestMode', '1');
    } else {
      localStorage.removeItem('guestMode');
    }
  }, [isGuest]);

  const handleLogout = () => {
    setUserId(null);
    setIsGuest(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 flex flex-col">
        <BackendDownPopup />
        {isGuest && (
          <div className="bg-amber-100 text-amber-900 text-center text-sm py-2 shadow">
            Guest mode: view-only. Login to save or delete.
          </div>
        )}
        <Navbar userId={userId} isGuest={isGuest} onEnterGuest={() => setIsGuest(true)} onExitGuest={() => setIsGuest(false)} onLogout={handleLogout} />
        <main className="flex-1 p-2 sm:p-4">
          <Routes>
            <Route path="/" element={userId || isGuest ? <Navigate to="/products" /> : <Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage setUserId={setUserId} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/products" element={userId || isGuest ? <ProductListPage userId={userId} isGuest={isGuest} /> : <Navigate to="/login" />} />
            <Route path="/scan" element={userId || isGuest ? <BarcodeScanPage userId={userId} isGuest={isGuest} /> : <Navigate to="/login" />} />
            <Route path="/aisuggestions" element={<AISuggestions />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
