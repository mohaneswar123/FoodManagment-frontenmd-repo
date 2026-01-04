import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  className = '',
  disabled = false,
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-2 
    rounded-full font-semibold
    transition-all duration-200 ease-in-out
    transform hover:scale-105 active:scale-95
    focus:outline-none focus:ring-4 focus:ring-opacity-50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-amber-500 to-yellow-500 
      hover:from-amber-600 hover:to-yellow-600
      focus:ring-amber-300
      text-white shadow-lg hover:shadow-xl
    `,
    secondary: `
      bg-gradient-to-r from-orange-500 to-red-500 
      hover:from-orange-600 hover:to-red-600
      focus:ring-orange-300
      text-white shadow-lg hover:shadow-xl
    `,
    success: `
      bg-gradient-to-r from-green-500 to-emerald-500 
      hover:from-green-600 hover:to-emerald-600
      focus:ring-green-300
      text-white shadow-lg hover:shadow-xl
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-pink-500 
      hover:from-red-600 hover:to-pink-600
      focus:ring-red-300
      text-white shadow-lg hover:shadow-xl
    `,
    warning: `
      bg-gradient-to-r from-yellow-500 to-orange-500 
      hover:from-yellow-600 hover:to-orange-600
      focus:ring-yellow-300
      text-white shadow-lg hover:shadow-xl
    `,
    ghost: `
      bg-transparent text-gray-600 
      hover:bg-gray-100 hover:text-gray-800
      focus:ring-gray-200
      shadow-none
    `
  };

  const sizes = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base',
    large: 'px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg'
  };

  const combinedClasses = `
    ${baseClasses}
    ${variants[variant] || variants.primary}
    ${sizes[size]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      className={combinedClasses}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;