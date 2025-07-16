
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HeaderResponsive from "@/app/frontend/components/common/Header/headerResponsive";
import { jwtDecode } from "jwt-decode";
import toast, { Toaster } from "react-hot-toast";
import LoadingScreen from "@/app/frontend/components/ui/loadingScreen";

interface Station {
  id?: number;
  station_id: string;
  station_name: string;
  station_type: string;
  province: string;
}

export default function AddTicket() {
  const [stationId, setStationId] = useState("");
  const [stationOptions, setStationOptions] = useState<Station[]>([]);
  const [stationName, setStationName] = useState("");
  const [stationType, setStationType] = useState("");
  const [province, setProvince] = useState("");
  const [issueOn, setIssueOn] = useState<"PTT_Digital" | "Third_Party">("PTT_Digital");
  const [issueType, setIssueType] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

 

  useEffect(() => {
    async function fetchStations() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/data/stations");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch stations");
        }
        const data = await response.json();
        if (!data.stations || !Array.isArray(data.stations)) {
          throw new Error("Invalid station data format");
        }
        setStationOptions(data.stations);
      } catch (err) {
        setErrors([err instanceof Error ? err.message : "Unknown error"]);
        setStationOptions([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStations();
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setErrors(["Please log in to create a ticket."]);
      setTimeout(() => router.push("/"), 2000);
      return;
    }
    try {
      const decoded: any = jwtDecode(token);
      const userId =
        decoded.users_id ?? decoded.userId ?? decoded.id ?? decoded.sub;
      if (!userId) {
        setErrors([
          "Invalid token: userId missing (tried users_id, userId, id, sub). Please log in again.",
        ]);
        sessionStorage.removeItem("token");
        setTimeout(() => router.push("/"), 2000);
        return;
      }
      if (decoded.exp * 1000 < Date.now()) {
        setErrors(["Your session has expired. Please log in again."]);
        sessionStorage.removeItem("token");
        setTimeout(() => router.push("/"), 2000);
      }
    } catch (error) {
      setErrors(["Invalid token. Please log in again."]);
      sessionStorage.removeItem("token");
      setTimeout(() => router.push("/"), 2000);
    }
  }, [router]);

  useEffect(() => {
    const selectedStation = stationOptions.find(
      (s) => s.station_id === stationId
    );
    if (selectedStation) {
      setStationName(selectedStation.station_name || "");
      setStationType(selectedStation.station_type || "");
      setProvince(selectedStation.province || "");
    } else {
      setStationName("");
      setStationType("");
      setProvince("");
    }
  }, [stationId, stationOptions]);

  const issueTypeOptions: Record<"PTT_Digital" | "Third_Party", string[]> = {
    PTT_Digital: ["Software", "Hardware"],
    Third_Party: ["ATG", "ABA", "Fleetcard", "Network", "Dispenser"],
  };

  const filteredStations = () =>
    stationOptions.filter((station) =>
      station.station_id.toLowerCase().includes(stationId.toLowerCase())
    );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setImage(null);
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setErrors(["Invalid file type. Only JPEG, PNG, or GIF allowed."]);
      setImage(null);
      return;
    }
    const maxSize = 15 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrors(["File size exceeds 5MB limit."]);
      setImage(null);
      return;
    }
    setErrors([]);
    setImage(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);
    if (!stationId || !issueType || !issueDescription) {
      setErrors([
        "Station ID, Issue Type, and Issue Description are required.",
      ]);
      toast.error("Station ID, Issue Type, and Issue Description are required.");
      setIsLoading(false);
      return;
    }
    const token = sessionStorage.getItem("token");
    if (!token) {
      setErrors(["Please log in to create a ticket."]);
      toast.error("Please log in to create a ticket.");
      setIsLoading(false);
      setTimeout(() => router.push("/"), 2000);
      return;
    }
    try {
      let imagePath = "";
      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        const uploadResponse = await fetch("/api/data/upload_image", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) {
          if (uploadResponse.status === 413) {
            setErrors([
              "Image size exceeds server limit (5MB). Please upload a smaller image.",
            ]);
            toast.error("Image size exceeds server limit (5MB).");
          } else {
            setErrors([uploadData.error || "Failed to upload image."]);
            toast.error(uploadData.error || "Failed to upload image.");
          }
          setIsLoading(false);
          return;
        }
        imagePath = uploadData.imagePath;
      }
      const formData = new FormData();
      formData.append("station_id", stationId);
      formData.append("station_name", stationName);
      formData.append("station_type", stationType);
      formData.append("province", province);
      formData.append("issue_on", issueOn);
      formData.append("issue_type", issueType);
      formData.append("issue_description", issueDescription);
      if (imagePath) formData.append("image", imagePath);
      const response = await fetch("/api/data/tickets", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.error.includes("expired")) {
          setErrors(["Your session has expired. Please log in again."]);
          toast.error("Your session has expired. Please log in again.");
          sessionStorage.removeItem("token");
          setTimeout(() => router.push("/"), 2000);
        } else {
          setErrors([data.error || "Failed to create ticket."]);
          toast.error(data.error || "Failed to create ticket.");
        }
        setIsLoading(false);
        return;
      }
      toast.success("Ticket created successfully!", {
        duration: 2000,
        position: "top-right",
      });
      setTimeout(() => {
        router.push("/pages/admin/ticket");
      }, 2000);
    } catch (error: any) {
      const errorMsg = error.message || "Unknown error";
      setErrors([`Error: ${errorMsg}`]);
      toast.error(`Error: ${errorMsg}`);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <HeaderResponsive>
        <LoadingScreen></LoadingScreen>
     </HeaderResponsive>
    );
  }

  if (errors.length > 0 && errors.some((error) => error.includes("log in") || error.includes("token"))) {
    return (
      <HeaderResponsive>
        <div className="flex w-full">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
            <Toaster position="top-right" />
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
     </HeaderResponsive>
    );
  }

  return (
    <HeaderResponsive>
      <div className="flex w-full">
        <main className="flex-1 mt-12 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
          <Toaster position="top-right" />
          <div className="flex justify-center items-center min-h-[calc(100vh-128px)]">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-md sm:max-w-2xl border border-gray-200">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
                Add Ticket
              </h1>
              {errors.length > 0 && (
                <div className="mb-4 p-3 rounded text-sm sm:text-base bg-red-100 text-red-800 w-full max-w-full">
                  {errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-full min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Station ID
                    </label>
                    <input
                      type="text"
                      id="stationId"
                      value={stationId}
                      onChange={(e) => setStationId(e.target.value)}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter or select station ID"
                      aria-label="Station ID"
                    />
                    {showDropdown && filteredStations().length > 0 && (
                      <ul className="absolute z-20 w-full max-w-full min-w-0 bg-white border border-gray-300 rounded-md max-h-60 overflow-y-auto shadow-md mt-1">
                        {filteredStations().map((s) => (
                          <li
                            key={s.station_id}
                            onMouseDown={() => {
                              setStationId(s.station_id);
                              setShowDropdown(false);
                            }}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 cursor-pointer"
                          >
                            {s.station_name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Station Name:</strong> {stationName || "Not selected"}
                    </p>
                    <p>
                      <strong>Station Type:</strong> {stationType || "Not selected"}
                    </p>
                    <p>
                      <strong>Province:</strong> {province || "Not selected"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue On
                    </label>
                    <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-4 mt-2">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="radio"
                          id="issueOnPTTDigital"
                          value="PTT_Digital"
                          checked={issueOn === "PTT_Digital"}
                          onChange={() => setIssueOn("PTT_Digital")}
                          className="form-radio text-blue-500 h-4 w-4 focus:ring-blue-500"
                          aria-label="PTT Digital"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          PTT Digital
                        </span>
                      </label>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="radio"
                          id="issueOnThirdParty"
                          value="Third_Party"
                          checked={issueOn === "Third_Party"}
                          onChange={() => setIssueOn("Third_Party")}
                          className="form-radio text-blue-500 h-4 w-4 focus:ring-blue-500"
                          aria-label="Third Party"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Third Party
                        </span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Type
                    </label>
                    <select
                      id="issueType"
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      aria-label="Issue Type"
                    >
                      <option value="">Select an issue type</option>
                      {issueTypeOptions[issueOn].map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Description
                    </label>
                    <textarea
                      id="issueDescription"
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      placeholder="Describe the issue..."
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md text-sm sm:text-base h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      aria-label="Issue Description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Image (Optional)
                    </label>
                    <div className="flex flex-col sm:flex-row items-center sm:space-x-4">
                      <input
                        type="file"
                        id="issueImage"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={handleImageChange}
                        className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md text-sm sm:text-base file:bg-gray-100 file:text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0"
                        aria-label="Issue Image Upload"
                      />
                      <span className="text-sm text-gray-500 mt-2 sm:mt-0">
                         (JPEG, PNG, GIF)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center mt-4 sm:mt-6">
                  <button
                    type="submit"
                    className="w-full sm:w-40 max-w-full min-w-0 bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 disabled:bg-blue-300 text-sm sm:text-base"
                    disabled={isLoading}
                    aria-label={isLoading ? "Creating Ticket" : "Create Ticket"}
                  >
                    {isLoading ? "Creating..." : "Create Ticket"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </HeaderResponsive>
  );
}
