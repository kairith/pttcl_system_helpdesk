'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${className} ${
        onClick ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;