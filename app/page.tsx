// root file for the starting page


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface LoginResponse {
  token: string;
  user: { isAdmin: boolean; users_id: number; email: string; users_name: string; [key: string]: any };
  error?: string;
}

interface UserImageResponse {
  imagePath: string;
  usersId?: number;
  error?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors(['Please enter a valid email address.']);
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setErrors(['Password must be at least 6 characters.']);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/data/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data: LoginResponse = await response.json();
      console.log('Login response data:', data);

      if (!response.ok) {
        setErrors([data.error || 'Login failed. Please try again.']);
        if (response.status === 401) setErrors(['Invalid credentials.']);
        else if (response.status >= 500) setErrors(['Server error. Try again later.']);
        setIsLoading(false);
        return;
      }

      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));

      // Fetch user image
      try {
        const imageResponse = await fetch(`/api/data/user_image?users_id=${data.user.users_id}`);
        console.log('Image response status:', imageResponse.status);
        const imageData: UserImageResponse = await imageResponse.json();
        console.log('Image response data:', imageData);

        if (imageResponse.ok && imageData.imagePath) {
          const imagePath = imageData.imagePath.toLowerCase();
          sessionStorage.setItem('userImage', imagePath);
          console.log('Stored userImage in sessionStorage:', imagePath);
        } else {
          console.error('Image fetch failed:', imageData.error || 'No image path returned');
          sessionStorage.setItem('userImage', '/Uploads/user_image/Default-avatar.jpg');
          console.log('Stored default userImage in sessionStorage:', '/Uploads/user_image/Default-avatar.jpg');
        }
      } catch (imageError) {
        console.error('Failed to fetch user image:', imageError);
        sessionStorage.setItem('userImage', '/Uploads/user_image/Default-avatar.jpg');
        console.log('Stored default userImage in sessionStorage due to error:', '/Uploads/user_image/Default-avatar.jpg');
      }

      router.push(data.user.isAdmin ? '/frontend/pages/admin/dashboard' : '/frontend/pages/Users/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setErrors(['An error occurred. Please try again later.']);
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page flex items-center justify-center min-h-screen bg-gray-100">
      <div className="login-box w-full max-w-sm">
        <div className="card bg-white rounded-2xl shadow-lg">
          <div className="card-header bg-gray-500 text-white text-center flex flex-col items-center py-4 rounded-t-2xl">
            <Image
              src="/img/logo_Station.png"
              alt="PTT Cambodia Logo"
              width={120}
              height={120}
              className="mb-2"
            />
            <h4>PTT (CAMBODIA) Limited</h4>
          </div>
          <div className="card-body p-8">
            <p className="login-box-msg text-center mb-4">
              Login with your email and password.
            </p>
            {errors.length > 0 && (
              <div className="alert alert-danger text-center mb-4" role="alert" aria-live="polite">
                {errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="input-group mb-4 flex">
                <input
                  type="email"
                  className="form-control flex-1 p-2 border border-r-0 border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Email address"
                />
                <span className="input-group-text p-2 bg-gray-200 rounded-r-md">
                  <i className="fas fa-envelope" aria-hidden="true"></i>
                </span>
              </div>
              <div className="input-group mb-4 flex">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control flex-1 p-2 border border-r-0 border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-label="Password"
                />
                <span className="input-group-text p-2 bg-gray-200 rounded-r-md">
                  <i className="fas fa-lock" aria-hidden="true"></i>
                </span>
              </div>
              <div className="form-check mb-4">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="showpassword"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                />
                <label className="form-check-label" htmlFor="showpassword">
                  Show Password
                </label>
              </div>
              <div className="flex justify-between mb-4">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="remember"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <label className="form-check-label" htmlFor="remember">
                    Remember Me
                  </label>
                </div>
                <Link href="/forgot-password" className="text-blue-600 hover:underline">
                  I forgot my password
                </Link>
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}