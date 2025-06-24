
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image";

interface User {
  users_id: number;
  users_name: string;
  email: string;
  password?: string;
  company?: string | null;
  user_image?: string | null;
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOldPasswordModal, setShowOldPasswordModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

  useEffect(() => {
    const fetchUser = async () => {
      if (!users_id) {
        setError("User ID not provided");
        toast.error("User ID not provided");
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
        sessionStorage.setItem("user", JSON.stringify(data));
        setFormData({
          users_name: data.users_name || "",
          email: data.email || "",
          newPassword: "",
          confirmPassword: "",
          company: data.company || "",
        });
        const imagePath = data.user_image || "/Uploads/user_image/Default-avatar.jpg";
        setImagePreview(imagePath);
        sessionStorage.setItem("userImage", imagePath);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [users_id, token]);

  useEffect(() => {
    if (selectedImage) {
      console.log("Selected image:", selectedImage.name, selectedImage.size);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        console.log("Base64 preview:", result.substring(0, 50) + "...");
        if (result.startsWith("data:image/")) {
          setImagePreview(result);
        } else {
          setError("Invalid image data");
          toast.error("Invalid image data");
          console.error("Invalid base64 data:", result);
        }
      };
      reader.onerror = () => {
        setError("Failed to read image file");
        toast.error("Failed to read image file");
        console.error("FileReader error:", reader.error);
      };
      reader.readAsDataURL(selectedImage);
    } else if (removeImage) {
      setImagePreview("/Uploads/user_image/Default-avatar.jpg");
      sessionStorage.setItem("userImage", "/Uploads/user_image/Default-avatar.jpg");
    } else if (!selectedImage && !removeImage && user?.user_image) {
      setImagePreview(user.user_image);
      sessionStorage.setItem("userImage", user.user_image);
    } else {
      setImagePreview("/Uploads/user_image/Default-avatar.jpg");
      sessionStorage.setItem("userImage", "/Uploads/user_image/Default-avatar.jpg");
    }
    console.log("Current imagePreview:", imagePreview);
  }, [selectedImage, removeImage, user?.user_image]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOldPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOldPassword(e.target.value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        if (!file.type.startsWith("image/")) {
          throw new Error("Please select an image file (e.g., PNG, JPEG)");
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("Image size must be less than 5MB");
        }
        setSelectedImage(file);
        setRemoveImage(false);
        console.log("Image selected:", file.name, file.size);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to process image";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Image upload error:", err);
      }
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setRemoveImage(true);
    sessionStorage.setItem("userImage", "/Uploads/user_image/Default-avatar.jpg");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!users_id) {
      setError("User ID not provided");
      toast.error("User ID not provided");
      return;
    }

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirm password do not match");
      toast.error("New password and confirm password do not match");
      return;
    }

    if (!formData.users_name.trim()) {
      setError("Name is required");
      toast.error("Name is required");
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Valid email is required");
      toast.error("Valid email is required");
      return;
    }

    setShowOldPasswordModal(true);
  };

  const handleVerifyAndSave = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!oldPassword) {
        throw new Error("Please enter your current password");
      }

      const verifyResponse = await fetch(`/api/data/edit_user_profile/${users_id}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ password: oldPassword }),
      });
      const verifyData = await verifyResponse.json();
      if (!verifyResponse.ok || !verifyData.success) {
        throw new Error(verifyData.error || "Invalid current password");
      }

      const formDataToSend = new FormData();
      formDataToSend.append("users_name", formData.users_name.trim());
      formDataToSend.append("email", formData.email.trim());
      if (formData.newPassword) {
        formDataToSend.append("password", formData.newPassword);
      }
      if (formData.company) {
        formDataToSend.append("company", formData.company);
      }
      if (selectedImage) {
        formDataToSend.append("user_image", selectedImage);
      }
      if (removeImage) {
        formDataToSend.append("remove_image", "true");
      }

      const response = await fetch(`/api/data/edit_user_profile/${users_id}`, {
        method: "PUT",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formDataToSend,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update user: ${response.statusText}`);
      }
      const updatedUser: User = await response.json();
      setUser(updatedUser);
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      const newImage = updatedUser.user_image || "/Uploads/user_image/Default-avatar.jpg";
      sessionStorage.setItem("userImage", newImage);
      setImagePreview(newImage);
      toast.success("Profile updated successfully!");
      setTimeout(() => router.push("/"), 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error during update";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("PUT request error:", err);
    } finally {
      setLoading(false);
      setShowOldPasswordModal(false);
      setOldPassword("");
    }
  };

  const handleModalClose = () => {
    setShowOldPasswordModal(false);
    setOldPassword("");
    setError(null);
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!user) return <div className="text-center p-4">User not found</div>;

  const isBase64 = imagePreview && imagePreview.startsWith("data:image/");

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Toaster position="top-right" />
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Profile</h1>
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-20 h-20 mb-2 aspect-square">
            {isBase64 ? (
              <img
                src={imagePreview}
                alt={`Profile picture of ${formData.users_name || "user"}`}
                className="rounded-full object-cover w-full h-full"
                onError={() => {
                  console.error("Failed to load base64 profile image:", imagePreview);
                  setImagePreview("/Uploads/user_image/Default-avatar.jpg");
                }}
              />
            ) : (
              <Image
                src={imagePreview || "/Uploads/user_image/Default-avatar.jpg"}
                alt={`Profile picture of ${formData.users_name || "user"}`}
                fill
                className="rounded-full object-cover"
                sizes="80px"
                priority
                onError={() => {
                  console.error("Failed to load profile image:", imagePreview);
                  setImagePreview("/Uploads/user_image/Default-avatar.jpg");
                }}
              />
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow"
              aria-label="Change profile picture"
            >
              <Image
                src="/img/camera-icon.png"
                alt=""
                width={16}
                height={16}
                aria-hidden="true"
                onError={() => console.error("Failed to load camera icon")}
              />
            </button>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            ref={fileInputRef}
            id="user_image"
            aria-label="Upload profile picture"
          />
          {imagePreview && imagePreview !== "/Uploads/user_image/Default-avatar.jpg" && (
            <button
              onClick={handleRemoveImage}
              className="text-sm text-red-600 hover:underline"
              aria-label="Remove profile picture"
            >
              Remove Image
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="users_name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="users_name"
              name="users_name"
              value={formData.users_name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Leave blank to keep current password"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm new password"
            />
          </div>
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
              Company
            </label>
            <input
              type="text"
              id="company"
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
            aria-busy={loading}
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
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-gray-200/50 backdrop-blur-sm transition-opacity duration-300"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <div className="bg-white rounded-lg p-6 w-full max-w-md transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modal-open">
                <h2 id="modal-title" className="text-xl font-semibold mb-4">
                  Verify Your Identity
                </h2>
                <p className="text-gray-600 mb-4">Please enter your current password to save changes.</p>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={handleOldPasswordChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 mb-4"
                  placeholder="Enter your current password"
                  autoFocus
                  id="oldPassword"
                  aria-describedby={error ? "password-error" : undefined}
                />
                {error && (
                  <p id="password-error" className="text-red-600 text-sm mb-4">
                    {error}
                  </p>
                )}
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={handleModalClose}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    aria-label="Cancel"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerifyAndSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={loading || !oldPassword}
                    aria-busy={loading}
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
