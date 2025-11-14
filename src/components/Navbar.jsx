import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ userId, isGuest, onEnterGuest, onExitGuest, onLogout }) => {
  return (
    <header className="bg-gradient-to-r from-amber-500 to-yellow-500 shadow-md p-2 sm:p-4 flex justify-between items-center">
      <h1 className="text-lg sm:text-2xl font-bold text-white flex items-center">
        <span className="mr-1 sm:mr-2">🍲</span>
        <span className="hidden sm:inline">Food Pantry</span>
        <span className="sm:hidden">Pantry</span>
      </h1>
      <nav className="flex space-x-1 sm:space-x-3">
        {!userId && !isGuest ? (
          <>
            <Link to="/login" className="text-white hover:bg-amber-600 px-2 sm:px-3 py-1 sm:py-2 rounded-full transition-colors text-sm sm:text-base">
              <span className="flex items-center">
                <span className="mr-1">🔑</span>
                <span className="hidden sm:inline">Login</span>
              </span>
            </Link>
            <Link to="/register" className="text-white hover:bg-amber-600 px-2 sm:px-3 py-1 sm:py-2 rounded-full transition-colors text-sm sm:text-base">
              <span className="flex items-center">
                <span className="mr-1">📝</span>
                <span className="hidden sm:inline">Register</span>
              </span>
            </Link>
            <button onClick={onEnterGuest} className="text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 sm:px-3 py-1 sm:py-2 rounded-full transition-colors text-sm sm:text-base">
              <span className="flex items-center">
                <span className="mr-1">👀</span>
                <span className="hidden sm:inline">Continue as Guest</span>
                <span className="sm:hidden">Guest</span>
              </span>
            </button>
          </>
        ) : (
          <>
            <Link to="/products" className="text-white hover:bg-amber-600 px-2 sm:px-3 py-1 sm:py-2 rounded-full transition-colors text-sm sm:text-base">
              <span className="flex items-center">
                <span className="mr-1">🍱</span>
                <span className="hidden sm:inline">{isGuest ? 'Browse Pantry' : 'My Pantry'}</span>
              </span>
            </Link>
            <Link to="/scan" className="text-white hover:bg-amber-600 px-2 sm:px-3 py-1 sm:py-2 rounded-full transition-colors text-sm sm:text-base">
              <span className="flex items-center">
                <span className="mr-1">📷</span>
                <span className="hidden sm:inline">Scan Food</span>
              </span>
            </Link>
            <Link to="/aisuggestions" className="text-white hover:bg-amber-600 px-2 sm:px-3 py-1 sm:py-2 rounded-full transition-colors text-sm sm:text-base">
              <span className="flex items-center">
                <span className="mr-1">🧠</span>
                <span className="hidden sm:inline">Recipe Ideas</span>
              </span>
            </Link>
            {isGuest ? (
              <button onClick={onExitGuest} className="text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 sm:px-3 py-1 sm:py-2 rounded-full transition-colors text-sm sm:text-base">
                <span className="flex items-center">
                  <span className="mr-1">↩️</span>
                  <span className="hidden sm:inline">Exit Guest</span>
                </span>
              </button>
            ) : (
              <button onClick={onLogout} className="text-white hover:bg-red-600 px-2 sm:px-3 py-1 sm:py-2 rounded-full transition-colors text-sm sm:text-base">
                <span className="flex items-center">
                  <span className="mr-1">🚪</span>
                  <span className="hidden sm:inline">Logout</span>
                </span>
              </button>
            )}
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
