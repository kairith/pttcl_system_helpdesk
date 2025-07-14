
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HeaderWithSidebar from "@/app/frontend/components/common/Header/Headerwithsidebar";
import { tbl_users_rules } from "@/app/backend/types/rules";

export default function CreateUserPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [usersName, setUsersName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState(1);
  const [rulesId, setRulesId] = useState("");
  const [roles, setRoles] = useState<tbl_users_rules[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePath, setImagePath] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    async function initialize() {
      setIsLoading(true);
      const token = sessionStorage.getItem("token");
      if (!token) {
        setErrors(["Please log in to access this page."]);
        router.push("/");
        return;
      }
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/data/roles`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok) {
          setErrors([data.error || "Failed to load roles."]);
          setRoles([]);
          return;
        }
        const fetchedRoles = Array.isArray(data.rules) ? data.rules : [];
        setRoles(fetchedRoles);
        setRulesId(fetchedRoles[0]?.rules_id?.toString() || "");
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setErrors([`Failed to load roles: ${errorMsg}`]);
        setRoles([]);
      } finally {
        setIsLoading(false);
      }
    }
    initialize();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setErrors(["Invalid file type. Only JPEG, PNG, or GIF allowed."]);
      setImageFile(null);
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrors(["File size exceeds 5MB limit."]);
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
      setErrors(["All fields (except image) are required."]);
      setIsLoading(false);
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrors(["Invalid email format."]);
      setIsLoading(false);
      return;
    }
    if (password.length < 8) {
      setErrors(["Password must be at least 8 characters."]);
      setIsLoading(false);
      return;
    }
    if (![0, 1].includes(Number(status))) {
      setErrors(["Status must be Active or Inactive."]);
      setIsLoading(false);
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setErrors(["Please log in to access this page."]);
        setIsLoading(false);
        router.push("/");
        return;
      }

      let uploadedImagePath = "";
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        const uploadResponse = await fetch("/api/data/upload_user_image", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) {
          setErrors([uploadData.error || "Failed to upload image."]);
          setIsLoading(false);
          return;
        }
        uploadedImagePath = uploadData.imagePath;
        setImagePath(uploadedImagePath);
      }

      const response = await fetch("/api/data/add_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ usersName, email, password, company, status, rulesId: Number(rulesId), imagePath: uploadedImagePath }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrors([data.error || "Failed to create user."]);
        setIsLoading(false);
        return;
      }

      router.push("/pages/admin/user");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setErrors([`An error occurred: ${errorMsg}`]);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isSidebarOpen ? "sm:ml-64" : ""} transition-all duration-300 overflow-x-hidden box-border`}>
        <HeaderWithSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex w-full">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-3">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                  />
                </svg>
                <span className="text-lg font-medium text-gray-600">Loading...</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (errors.length > 0 && errors.some((error) => error.includes("log in"))) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isSidebarOpen ? "sm:ml-64" : ""} transition-all duration-300 overflow-x-hidden box-border`}>
        <HeaderWithSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex w-full">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
            <div className="flex items-center justify-center py-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md w-full border border-gray-200">
                <svg
                  className="mx-auto h-12 w-12 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="mt-4 text-lg font-semibold text-red-600">
                  {errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isSidebarOpen ? "sm:ml-64" : ""} transition-all duration-300 overflow-x-hidden box-border`}>
      <HeaderWithSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex w-full">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
          <div className="flex justify-center items-center min-h-[calc(100vh-128px)]">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-md sm:max-w-2xl border border-gray-200">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
                Add a New User
              </h1>
              {errors.length > 0 && (
                <div className="mb-4 p-3 rounded text-sm sm:text-base bg-red-100 text-red-800 w-full max-w-full">
                  {errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-full min-w-0">
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label htmlFor="username" className="text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={usersName}
                      onChange={(e) => setUsersName(e.target.value)}
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      placeholder="Telegram Username"
                      aria-label="Username"
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      placeholder="Email Address"
                      aria-label="Email"
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      placeholder="Password"
                      aria-label="Password"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label htmlFor="company" className="text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <input
                      id="company"
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      placeholder="Company"
                      aria-label="Company"
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="status" className="text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(Number(e.target.value))}
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      aria-label="Status"
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="roles" className="text-sm font-medium text-gray-700 mb-1">
                      User Roles
                    </label>
                    <select
                      id="roles"
                      value={rulesId}
                      onChange={(e) => setRulesId(e.target.value)}
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      aria-label="User Roles"
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
                <div className="col-span-1 sm:col-span-2">
                  <div className="flex flex-col">
                    <label htmlFor="image" className="text-sm font-medium text-gray-700 mb-1">
                      User Image (Optional)
                    </label>
                    <input
                      id="image"
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleImageChange}
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      aria-label="User Image"
                    />
                  </div>
                </div>
                <div className="col-span-1 sm:col-span-2 flex justify-center mt-4 sm:mt-6">
                  <button
                    type="submit"
                    className="w-full sm:w-1/3 max-w-full min-w-0 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300 text-sm sm:text-base font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? "Adding..." : "Add User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
