'use client';
import Link from 'next/link';
import React from 'react';

const ErrorPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white px-6">
      <h1 className="text-[10rem] md:text-[12rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-blue-500 animate-pulse drop-shadow-xl">
        404
      </h1>
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Page Not Found</h2>
      <p className="text-lg md:text-xl text-gray-300 mb-8 text-center max-w-2xl">
        Sorry, the page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/pages/admin/dashboard"
        className="px-8 py-4 bg-red-600 hover:bg-red-700 transition text-white text-lg rounded-full shadow-lg"
      >
        ⬅ Back to Admin Home
      </Link>
    </div>
  );
};

export default ErrorPage;
