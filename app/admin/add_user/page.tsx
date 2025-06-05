'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import HeaderWithSidebar from '@/app/components/common/Header';
export default function CreateUserPage() {
  const [usersName, setUsersName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState(1); // Default to Active
  const [rulesId, setRulesId] = useState('');
  const [roles, setRoles] = useState<{ rules_id: number; rules_name: string }[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Fetch roles
  useEffect(() => {
    fetch('/api/data/roles')
      .then(res => res.json())
      .then(data => {
        setRoles(data);
        setRulesId(data[0]?.rules_id.toString() || '');
      })
      .catch(() => setErrors(['Failed to load roles.']));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);

    // Client-side validation
    if (!usersName || !email || !password || !company || !rulesId) {
      setErrors(['All fields are required.']);
      setIsLoading(false);
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrors(['Invalid email format.']);
      setIsLoading(false);
      return;
    }
    if (password.length < 8) {
      setErrors(['Password must be at least 8 characters.']);
      setIsLoading(false);
      return;
    }
    if (![0, 1].includes(Number(status))) {
      setErrors(['Status must be Active or Inactive.']);
      setIsLoading(false);
      return;
    }

    try {
      const token = sessionStorage.getItem('token'); // Adjust based on your auth setup
      if (!token) {
        setErrors(['Please log in as an admin.']);
        setIsLoading(false);
        router.push('/');
        return;
      }

      const response = await fetch('/api/data/add_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ usersName, email, password, company, status, rulesId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors([data.error || 'Failed to create user.']);
        setIsLoading(false);
        return;
      }

      router.push('/admin/user'); // Redirect to user list page
    } catch (error) {
      setErrors(['An error occurred. Try again later.']);
      setIsLoading(false);
    }
  };

  return (
    
    <div className="create-user-page flex items-center justify-center min-h-screen bg-gray-100 px-4">
       
      <div className="create-user-box w-full max-w-md sm:max-w-2xl">
         <HeaderWithSidebar/>
        <div className="card bg-white rounded-2xl shadow-lg">
          <div className="card-header bg-gray-500 text-white text-center flex flex-col items-center py-4 rounded-t-2xl">
            {/* <Image
              src="/img/logo_Station2.png"
              alt="PTT Cambodia Logo"
              width={50}
              height={50}
              className="mb-2 sm:w-20 sm:h-20"
            /> */}
            <h4 className="text-base sm:text-xl">PTT (CAMBODIA) Limited</h4>
          </div>
          <div className="card-body p-4 sm:p-8">
            <p className="create-user-box-msg text-center mb-4 text-sm sm:text-base">Add a New User</p>
            {errors.length > 0 && (
              <div className="alert alert-danger text-center mb-4 text-red-600 text-sm sm:text-base">
                {errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-3">
                <div className="input-group flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">Username</label>
                  <input
                    type="text"
                    value={usersName}
                    onChange={(e) => setUsersName(e.target.value)}
                    className="form-control w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="Username"
                    required
                  />
                </div>
                <div className="input-group flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="Email Address"
                    required
                  />
                </div>
                <div className="input-group flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="Password"
                    required
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-3">
                <div className="input-group flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="form-control w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="Company"
                    required
                  />
                </div>
                <div className="input-group flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(Number(e.target.value))}
                    className="form-control w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
                <div className="input-group flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">User Roles</label>
                  <select
                    value={rulesId}
                    onChange={(e) => setRulesId(e.target.value)}
                    className="form-control w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    required
                  >
                   
                    {roles.map((role) => (
                      <option key={role.rules_id} value={role.rules_id}>
                        {role.rules_name.charAt(0).toUpperCase() + role.rules_name.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* User Image */}
              <div className="col-span-1 sm:col-span-2 mt-4">
                <div className="input-group flex items-center">
                  <input
                    type="file"
                    onChange={(e) => console.log(e.target.files)}
                    className="form-control flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                  {/* <span className="input-group-text p-2 bg-gray-200 rounded-md">
                    <i className="fas fa-image animate-pulse"></i>
                  </span> */}
                </div>
              </div>

              {/* Add User Button */}
              <div className="col-span-1 sm:col-span-2 flex justify-center mt-6">
                <button
                  type="submit"
                  className="btn btn-primary w-full sm:w-1/3 bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 disabled:bg-blue-300 text-sm sm:text-base"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}