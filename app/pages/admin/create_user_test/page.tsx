'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usersName, setUsersName] = useState('');
  const [rulesId, setRulesId] = useState('');
  const [roles, setRoles] = useState<{ rules_id: number; rules_name: string }[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('/api/data/roles');
        const data = await response.json();
        if (response.ok) {
          setRoles(data);
          setRulesId(data[0]?.rules_id.toString() || ''); // Default to first role
        } else {
          setErrors([data.error || 'Failed to load roles.']);
        }
      } catch (error) {
        setErrors(['Error loading roles.']);
      }
    };
    fetchRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);

    // Client-side validation
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrors(['Invalid email format.']);
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setErrors(['Password must be at least 6 characters.']);
      setIsLoading(false);
      return;
    }
    if (!rulesId) {
      setErrors(['Please select a role.']);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/data/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usersName, email, password, rulesId: parseInt(rulesId) }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors([data.error || 'Sign up failed. Please try again.']);
        setIsLoading(false);
        return;
      }
      router.push('/');
    } catch (error) {
      setErrors(['An error occurred. Please try again later.']);
      setIsLoading(false);
    }
  };

  return (
    <div className="sign-up-page flex items-center justify-center min-h-screen bg-gray-100">
      <div className="sign-up-box w-full max-w-sm">
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
            <p className="sign-up-box-msg text-center mb-4">Sign up for a new account.</p>
            {errors.length > 0 && (
              <div className="alert alert-danger text-center mb-4" role="alert">
                {errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="input-group mb-4 flex">
                <input
                  type="text"
                  className="form-control flex-1 p-2 border border-r-0 border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full Name"
                  value={usersName}
                  onChange={(e) => setUsersName(e.target.value)}
                  required
                />
                <span className="input-group-text p-2 bg-gray-200 rounded-r-md">
                  <i className="fas fa-user"></i>
                </span>
              </div>
              <div className="input-group mb-4 flex">
                <input
                  type="email"
                  className="form-control flex-1 p-2 border border-r-0 border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <span className="input-group-text p-2 bg-gray-200 rounded-r-md">
                  <i className="fas fa-envelope"></i>
                </span>
              </div>
              <div className="input-group mb-4 flex">
                <input
                  type="password"
                  className="form-control flex-1 p-2 border border-r-0 border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className="input-group-text p-2 bg-gray-200 rounded-r-md">
                  <i className="fas fa-lock"></i>
                </span>
              </div>
              <div className="input-group mb-4 flex">
                <select
                  className="form-control flex-1 p-2 border border-r-0 border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={rulesId}
                  onChange={(e) => setRulesId(e.target.value)}
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.rules_id} value={role.rules_id}>
                      {role.rules_name}
                    </option>
                  ))}
                </select>
                <span className="input-group-text p-2 bg-gray-200 rounded-r-md">
                  <i className="fas fa-user-tag"></i>
                </span>
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                disabled={isLoading}
              >
                {isLoading ? 'Signing up...' : 'Sign Up'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}