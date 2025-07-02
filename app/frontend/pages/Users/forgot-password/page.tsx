'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(data.errors || ['Something went wrong. Please try again.']);
      } else {
        // Redirect or show success message (e.g., email sent)
        alert('A password reset link has been sent to your email.');
        router.push('/');
      }
    } catch (error) {
      setErrors(['Network error. Please try again later.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-lg border border-gray-200">
          <div className="text-center py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Forgot Password</h2>
            <p className="text-gray-600">Enter your email address</p>
          </div>
          <div className="p-6">
            {errors.length > 0 && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
                {errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="relative mb-4">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 bg-gray-200 rounded-r-md border border-l-0 border-gray-300">
                  <i className="fas fa-envelope text-gray-500"></i>
                </div>
              </div>
              <div className="mb-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200 ${
                    isSubmitting ? 'opacity-50' : ''
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Continue'}
                </button>
              </div>
              <p className="text-center">
                <Link href="/" className="text-blue-600 hover:underline">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}