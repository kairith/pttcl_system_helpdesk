'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeaderWithSidebar from '@/app/components/common/Header/Headerwithsidebar';
import { tbl_users_rules } from '@/app/types/rules';

export default function CreateUserPage() {
  const [usersName, setUsersName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState(1);
  const [rulesId, setRulesId] = useState('');
  const [roles, setRoles] = useState<tbl_users_rules[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePath, setImagePath] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function initialize() {
      // Fetch roles
      const token = sessionStorage.getItem('token');
      console.log('Fetching roles with token:', token ? '[token present]' : '[no token]');
      if (!token) {
        setErrors(['Please log in.']);
        router.push('/');
        return;
      }
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/api/data/roles`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        });
        console.log('Fetch roles response status:', response.status, response.statusText);
        const data = await response.json();
        console.log('Fetch roles response data:', data);
        if (!response.ok) {
          setErrors([data.error || 'Failed to load roles.']);
          setRoles([]);
          return;
        }
        const fetchedRoles = Array.isArray(data.rules) ? data.rules : [];
        console.log('Roles fetched successfully:', fetchedRoles.length, 'items');
        setRoles(fetchedRoles);
        setRulesId(fetchedRoles[0]?.rules_id?.toString() || '');
      } catch (err) {
        if (err instanceof Error) {
          console.error('Unexpected error fetching roles:', err.message, err.stack);
          setErrors([`Failed to load roles: ${err.message}`]);
        } else {
          console.error('Unexpected error fetching roles:', err);
          setErrors(['Failed to load roles: Unknown error']);
        }
        setRoles([]);
      }
    }
    initialize();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(['Invalid file type. Only JPEG, PNG, or GIF allowed.']);
      setImageFile(null);
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrors(['File size exceeds 5MB limit.']);
      setImageFile(null);
      return;
    }

    setErrors([]);
    setImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);

    if (!usersName || !email || !password || !company || !rulesId) {
      setErrors(['All fields (except image) are required.']);
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
      const token = sessionStorage.getItem('token');
      if (!token) {
        setErrors(['Please log in.']);
        setIsLoading(false);
        router.push('/');
        return;
      }

      let uploadedImagePath = '';
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadResponse = await fetch('/api/data/upload_user_image', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        console.log('Image upload response:', uploadData);
        if (!uploadResponse.ok) {
          setErrors([uploadData.error || 'Failed to upload image.']);
          setIsLoading(false);
          return;
        }
        uploadedImagePath = uploadData.imagePath;
        setImagePath(uploadedImagePath);
      }

      const response = await fetch('/api/data/add_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ usersName, email, password, company, status, rulesId: Number(rulesId), imagePath: uploadedImagePath }),
      });

      const data = await response.json();
      console.log('Create user response:', data);
      if (!response.ok) {
        setErrors([data.error || 'Failed to create user.']);
        setIsLoading(false);
        return;
      }

      router.push('/pages/admin/user');
    } catch (error: any) {
      console.error('Error creating user:', error.message, error.stack);
      setErrors([`An error occurred: ${error.message || 'Unknown error'}`]);
      setIsLoading(false);
    }
  };

  return (
    <div className="create-user-page flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="create-user-box w-full max-w-md sm:max-w-2xl">
        <HeaderWithSidebar />
        <div className="card bg-white rounded-2xl shadow-lg">
          <div className="card-header bg-gray-500 text-white text-center flex flex-col items-center py-4 rounded-t-2xl">
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
              <div className="space-y-3">
                <div className="input-group flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">Username</label>
                  <input
                    type="text"
                    value={usersName}
                    onChange={(e) => setUsersName(e.target.value)}
                    className="form-control w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="Telegram Username"
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
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.rules_id} value={role.rules_id}>
                        {role.rules_name.charAt(0).toUpperCase() + role.rules_name.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-span-1 sm:col-span-2 mt-4">
                <div className="input-group flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">User Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleImageChange}
                    className="form-control w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
              </div>
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