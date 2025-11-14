import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProductListPage from './pages/ProductListPage.jsx';
import BarcodeScanPage from './pages/BarcodeScanPage.jsx';
import AISuggestions from './components/AISuggestions.jsx';

function App() {
  const [userId, setUserId] = useState(() => {
    // Retrieve userId from localStorage on app initialization
    return localStorage.getItem('userId');
  });

  useEffect(() => {
    // Store userId in localStorage whenever it changes
    if (userId) {
      localStorage.setItem('userId', userId);
    } else {
      localStorage.removeItem('userId');
    }
  }, [userId]);

  const handleLogout = () => {
    setUserId(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 flex flex-col">
        <Navbar userId={userId} onLogout={handleLogout} />
        <main className="flex-1 p-2 sm:p-4">
          <Routes>
            <Route path="/" element={userId ? <Navigate to="/products" /> : <Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage setUserId={setUserId} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/products" element={userId ? <ProductListPage userId={userId} /> : <Navigate to="/login" />} />
            <Route path="/scan" element={userId ? <BarcodeScanPage userId={userId} /> : <Navigate to="/login" />} />
            <Route path="/aisuggestions" element={<AISuggestions />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
