"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { useSearchParams } from "next/navigation";

interface User {
  users_id: number;
  users_name: string;
  email: string;
  password: string; // Hashed password from DB
  company: string;
}

export default function EditUserProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const users_id = searchParams.get("users_id");
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    users_name: "",
    email: "",
    newPassword: "",
    confirmPassword: "",
    company: "",
  });
  const [oldPassword, setOldPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOldPasswordModal, setShowOldPasswordModal] = useState(false);

  // Get token from sessionStorage
  const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

  useEffect(() => {
    const fetchUser = async () => {
      if (!users_id) {
        setError("User ID not provided");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/data/edit_user_profile/${users_id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch user");
        }
        const data = await response.json();
        setUser(data);
        setFormData({
          users_name: data.users_name,
          email: data.email,
          newPassword: "",
          confirmPassword: "",
          company: data.company,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [users_id, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOldPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOldPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!users_id) {
      setError("User ID not provided");
      return;
    }

    // Validate new password and confirm password match
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    // Show modal for old password
    setShowOldPasswordModal(true);
  };

  const handleVerifyAndSave = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!oldPassword) {
        throw new Error("Please enter your current password");
      }

      // Verify old password
      const verifyResponse = await fetch(`/api/data/edit_user_profile/${users_id}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ password: oldPassword }),
      });
      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || "Invalid old password");
      }

      const response = await fetch(`/api/data/edit_user_profile/${users_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          users_name: formData.users_name,
          email: formData.email,
          password: formData.newPassword || undefined, // Only update if new password is provided
          company: formData.company,
          currentPassword: oldPassword, // Ensure currentPassword is sent
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user");
      }
      toast.success("Profile updated successfully!");
      setTimeout(() => router.push("/"), 2000); // Redirect after toast
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      setShowOldPasswordModal(false);
      setOldPassword(""); // Clear old password after attempt
    }
  };

  const handleModalClose = () => {
    setShowOldPasswordModal(false);
    setOldPassword("");
    setError(null);
  };
// ... (rest of the page.tsx code remains the same until the modal)

if (loading) return <div className="text-center p-4">Loading...</div>;
if (error) return <div className="text-red-600 p-4">{error}</div>;
if (!user) return <div className="text-center p-4">User not found</div>;

return (
  <div className="min-h-screen bg-gray-100 p-4">
    <Toaster position="top-right" />
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="users_name"
            value={formData.users_name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Leave blank to keep current password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Confirm new password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Company</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {showOldPasswordModal && (
        <>
          <style jsx>{`
            @keyframes modalOpen {
              from {
                transform: scale(0.95);
                opacity: 0;
              }
              to {
                transform: scale(1);
                opacity: 1;
              }
            }
            .animate-modal-open {
              animation: modalOpen 0.3s ease-in-out forwards;
            }
          `}</style>
       <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-200/50 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white rounded-lg p-6 w-full max-w-md transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modal-open">
              <h2 className="text-xl font-semibold mb-4">Verify Your Identity</h2>
              <p className="text-gray-600 mb-4">Please enter your current password to save changes.</p>
              <input
                type="password"
                value={oldPassword}
                onChange={handleOldPasswordChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 mb-4"
                placeholder="Enter your current password"
                autoFocus
              />
              {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleModalClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyAndSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={loading || !oldPassword}
                >
                  {loading ? "Verifying..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  </div>
 );
}