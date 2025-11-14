import React from 'react';

const Input = ({ label, value, onChange, className, ...props }) => (
  <label className="block mb-3 sm:mb-4">
    {label && (
      <span className="block text-sm sm:text-base font-semibold text-amber-800 mb-2 flex items-center">
        <span className="mr-2">
          {props.type === 'password' ? '🔒' : 
           props.type === 'email' ? '📧' : 
           props.type === 'date' ? '📅' :
           label.toLowerCase().includes('barcode') ? '📊' :
           label.toLowerCase().includes('username') ? '👤' : '📝'}
        </span>
        {label}
      </span>
    )}
    <input
      className={`w-full border-2 border-amber-200 rounded-lg px-4 py-3 sm:py-3 
                 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 
                 bg-amber-50 text-amber-900 placeholder-amber-500
                 transition-all duration-200 ease-in-out
                 disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200
                 hover:border-amber-300 hover:bg-amber-25
                 ${className || ''}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  </label>
);

export default Input;
