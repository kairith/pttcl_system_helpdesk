"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import HeaderResponsive from "@/app/frontend/components/common/Header/headerResponsive";
import LoadingScreen from "@/app/frontend/components/ui/loadingScreen";
import toast, { Toaster } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

interface Station {
  station_id: string;
  station_name: string;
  station_type: string;
  province: string;
}

interface User {
  users_id: string;
  users_name: string;
  email: string;
}

interface UserGroup {
  users_id: string;
  username: string;
  chatId: string;
  groupName: string;
}

const threadIdMap: Record<string, number> = {
  Hardware: 1,
  Software: 2,
  Dispenser: 3,
  ABA: 4,
  Network: 5,
  ATG: 6,
  Fleetcard: 7,
};

const numberToIssueType: Record<string, string> = Object.fromEntries(
  Object.entries(threadIdMap).map(([key, value]) => [value.toString(), key])
);

const BASE_URL = "https://yourdomain.com";

const constructGmailMessage = (ticketData: {
  stationId: string;
  stationName: string;
  stationType: string;
  province: string;
  issueOn: string;
  issueType: string;
  issueDescription: string;
  ticketId: string;
  ticketOpen: string;
  imagePath?: string;
}) => {
  const {
    stationId,
    stationName,
    stationType,
    province,
    issueOn,
    issueType,
    issueDescription,
    ticketId,
    ticketOpen,
  } = ticketData;

  const issueTypeString = numberToIssueType[issueType] || issueType;

  return `New Ticket Created


Station ID: ${stationId}
Station Name: ${stationName}
Station Type: ${stationType}
Province: ${province}
Issue On: ${issueOn}
Issue Type: ${issueTypeString}
Issue Description: ${issueDescription}
Ticket ID: ${ticketId}

Please log in to your helpdesk for further details.`;
};

const constructTelegramMessage = (ticketData: {
  username: string;
  stationId: string;
  stationName: string;
  issueOn: string;
  issueType: string;
  ticketId: string;
  issueDescription: string;
  ticketOpen: string;
}) => {
  const {
    username = "Unknown",
    stationId = "N/A",
    stationName = "N/A",
    issueOn = "N/A",
    issueType = "N/A",
    ticketId = "N/A",
    issueDescription = "No description provided",
    ticketOpen = "N/A",
  } = ticketData;

  return `
    <div class="w-full p-4 background rounded-lg shadow-sm font-sans sm:p-6">
      <p class="text-base sm:text-sm font-semibold text-gray-800 mb-1">Dear @${username}</p>
      <p class="text-base sm:text-sm font-bold text-blue-800 mb-1">New Ticket Created</p>
      <div class="border-t border-gray-200 my-2"></div>

      <p class="text-sm text-gray-600">Station ID: ${stationId}</p>
      <p class="text-sm text-gray-600">Station Name: ${stationName}</p>
      <p class="text-sm text-gray-600">Issue On: ${issueOn}</p>
      <p class="text-sm text-gray-600">Issue Type: ${issueType}</p>
      <p class="text-sm text-gray-600">Ticket ID: ${ticketId}</p>
      <p class="text-sm text-gray-600">Issue Description: ${issueDescription}</p>
      <div class="border-t border-gray-200 my-2"></div>
      <p class="text-sm text-gray-500 italic">Please log in to your helpdesk to review.</p>
    </div>
  `;
};

const constructPlainTextTelegramMessage = (ticketData: {
  username: string;
  stationId: string;
  stationName: string;
  issueOn: string;
  issueType: string;
  ticketId: string;
  issueDescription: string;
  ticketOpen: string;
}) => {
  const { username, stationId, stationName, ticketId, issueDescription, issueOn, issueType, ticketOpen } = ticketData;

  if (
    !username?.trim() ||
    !stationId?.trim() ||
    !stationName?.trim() ||
    !ticketId?.trim() ||
    !issueDescription?.trim() ||
    !issueOn?.trim() ||
    !issueType?.trim() ||
    !ticketOpen?.trim()
  ) {
    throw new Error("All required fields must be non-empty for Telegram message");
  }

  const escapeMarkdown = (text: string) => text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");

  return `Dear @${escapeMarkdown(username)}
New Ticket Created


Station ID: ${escapeMarkdown(stationId)}
Station Name: ${escapeMarkdown(stationName)}
Issue On: ${escapeMarkdown(issueOn)}
Issue Type: ${escapeMarkdown(issueType)}
Ticket ID: ${escapeMarkdown(ticketId)}
Issue Description: ${escapeMarkdown(issueDescription)}

Please log in to your helpdesk to review.`;
};

const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 1000 * 600) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    if (!response) {
      throw new Error(`No response received from ${url}`);
    }
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Request to ${url} timed out`);
    }
    console.error(`Fetch error for ${url}:`, error);
    throw new Error(`Failed to fetch ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export default function AddTicketPage() {
  const [stationId, setStationId] = useState("");
  const [stationOptions, setStationOptions] = useState<Station[]>([]);
  const [stationName, setStationName] = useState("");
  const [stationType, setStationType] = useState("");
  const [province, setProvince] = useState("");
  const [issueOn, setIssueOn] = useState<"PTT_Digital" | "Third_Party">("PTT_Digital");
  const [issueType, setIssueType] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [botNames, setBotNames] = useState<string[]>([]);
  const [issueTypes, setIssueTypes] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const token = sessionStorage.getItem("token");
      if (!token) {
        setErrors(["Authentication required. Please log in."]);
        toast.error("Please log in to access this page.");
        router.push("/");
        setIsLoading(false);
        return;
      }

      try {
        const decoded: any = jwtDecode(token);
        const userId = decoded.users_id || decoded.userId || decoded.id || decoded.sub;
        if (!userId) {
          throw new Error("Invalid token: user ID missing.");
        }
        if (decoded.exp * 1000 < Date.now()) {
          throw new Error("Session expired. Please log in again.");
        }
        setUserId(userId);
        setUserEmail(decoded.email || "default@example.com");
        setUserName(decoded.users_name || "Unknown");

        const [stationsResponse, botsResponse, filtersResponse, userGroupsResponse] = await Promise.all([
          fetchWithTimeout("/api/data/stations", { headers: { Authorization: `Bearer ${token}` } }),
          fetchWithTimeout("/api/data/fetchbot", { headers: { Authorization: `Bearer ${token}` } }),
          fetchWithTimeout("/api/data/report-filters", { headers: { Authorization: `Bearer ${token}` } }),
          fetchWithTimeout("/api/data/user_groups", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!stationsResponse.ok) throw new Error(`Failed to fetch stations: ${stationsResponse.status}`);
        const stationsData = await stationsResponse.json();
        if (!stationsData.stations || !Array.isArray(stationsData.stations)) {
          throw new Error("Invalid station data format");
        }
        const validStations = stationsData.stations.filter(
          (station: Station) =>
            station.station_id &&
            station.station_name &&
            station.station_type &&
            station.province &&
            typeof station.station_id === "string"
        );
        if (validStations.length === 0) {
          throw new Error("No valid stations available.");
        }
        setStationOptions(validStations);

        if (!botsResponse.ok) throw new Error(`Failed to fetch bot names: ${botsResponse.status}`);
        const botsData = await botsResponse.json();
        setBotNames(Array.isArray(botsData) ? botsData : []);

        if (!filtersResponse.ok) {
          if (filtersResponse.status === 401) {
            setErrors(["Invalid or expired token. Please log in again."]);
            toast.error("Invalid or expired token. Please log in again.");
            router.push("/");
            setIsLoading(false);
            return;
          }
          throw new Error(`Failed to fetch issue types: ${filtersResponse.status}`);
        }
        const filtersData = await filtersResponse.json();
        setIssueTypes(
          Array.isArray(filtersData.issueTypes)
            ? filtersData.issueTypes.filter((type: string) => threadIdMap.hasOwnProperty(type))
            : []
        );

        if (!userGroupsResponse.ok) {
          throw new Error(`Failed to fetch user-group associations: ${userGroupsResponse.status}`);
        }
        const userGroupsData = await userGroupsResponse.json();
        const formattedUserGroups = Array.isArray(userGroupsData)
          ? userGroupsData.map((group: any) => ({
              users_id: String(group.users_id),
              username: String(group.username || "-"),
              chatId: String(group.chatId),
              groupName: String(group.groupName || "-"),
            }))
          : [];
        setUserGroups(formattedUserGroups);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load data.";
        console.error("FetchData Error:", err);
        setErrors([errorMessage]);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router]);

  useEffect(() => {
    const selectedStation = stationOptions.find((s) => s.station_id === stationId);
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

  const filteredStations = () => {
    return stationOptions.length === 0
      ? []
      : stationOptions.filter((station) =>
          station.station_id.toLowerCase().includes((stationId || "").toLowerCase())
        );
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setImage(null);
      setImagePreview(null);
      
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setErrors(["Invalid file type. Only JPEG, PNG, or GIF allowed."]);
      toast.error("Invalid file type. Only JPEG, PNG, or GIF allowed.");
      setImage(null);
      setImagePreview(null);
     
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }
    const maxSize = 25 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrors(["Image size exceeds 5MB limit."]);
      toast.error("Image size exceeds 5MB limit.");
      setImage(null);
      setImagePreview(null);
     
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }
    setErrors([]);
    setImage(file);
    setImagePreview(URL.createObjectURL(file));

    try {
      const imageFormData = new FormData();
      imageFormData.append("image", file);
      const token = sessionStorage.getItem("token");
      
    
   
    } catch (err) {
      console.error("Image Prediction Error:", err);
      toast.error("Failed to predict image.");
     
    }
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setFeedback(null);
    setIsLoading(true);

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setErrors(["Authentication required. Please log in."]);
        toast.error("Please log in to create a ticket.");
        router.push("/");
        setIsLoading(false);
        return;
      }

      if (!stationId) {
        setErrors(["Station ID is required."]);
        toast.error("Station ID is required.");
        setIsLoading(false);
        return;
      }
      if (!stationName) {
        setErrors(["Station Name is required."]);
        toast.error("Station Name is required.");
        setIsLoading(false);
        return;
      }
      if (!stationType) {
        setErrors(["Station Type is required."]);
        toast.error("Station Type is required.");
        setIsLoading(false);
        return;
      }
      if (!province) {
        setErrors(["Province is required."]);
        toast.error("Province is required.");
        setIsLoading(false);
        return;
      }
      if (!issueType) {
        setErrors(["Issue Type is required."]);
        toast.error("Issue Type is required.");
        setIsLoading(false);
        return;
      }
      if (!numberToIssueType[issueType]) {
        setErrors(["Invalid Issue Type selected."]);
        toast.error("Invalid Issue Type selected.");
        setIsLoading(false);
        return;
      }
      const issueTypeName = numberToIssueType[issueType];
      if (!issueTypeOptions[issueOn].includes(issueTypeName)) {
        setErrors([`Invalid Issue Type: Must be one of ${issueTypeOptions[issueOn].join(", ")} for ${issueOn}`]);
        toast.error(`Invalid Issue Type: Must be one of ${issueTypeOptions[issueOn].join(", ")}`);
        setIsLoading(false);
        return;
      }
      if (!issueDescription.trim()) {
        setErrors(["Issue Description is required."]);
        toast.error("Issue Description is required.");
        setIsLoading(false);
        return;
      }
      if (issueDescription.length > 1000) {
        setErrors(["Issue Description must not exceed 1000 characters."]);
        toast.error("Issue Description must not exceed 1000 characters.");
        setIsLoading(false);
        return;
      }
      if (!userName) {
        setErrors(["Username is required."]);
        toast.error("Username is required.");
        setIsLoading(false);
        return;
      }

      let imagePath = "";
    
      if (image) {
        const imageFormData = new FormData();
        imageFormData.append("image", image);
        const uploadResponse = await fetchWithTimeout("/api/data/upload_image", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: imageFormData,
        });
        const uploadData = await uploadResponse.json().catch(() => {
          throw new Error("Failed to parse image upload response");
        });
        if (!uploadResponse.ok) {
          if (uploadResponse.status === 413) {
            setErrors(["Image size exceeds server limit (5MB)."]);
            toast.error("Image size exceeds server limit (5MB).");
          } else {
            setErrors([uploadData.error || "Failed to upload image."]);
            toast.error(uploadData.error || "Failed to upload image.");
          }
          setIsLoading(false);
          return;
        }
        const fileName = uploadData.imagePath?.split("/")?.pop();
        if (!fileName) {
          setErrors(["Invalid image path returned from server."]);
          toast.error("Invalid image path returned from server.");
          setIsLoading(false);
          return;
        }
        imagePath = `/uploads/ticket_image/${fileName}`;
      }

      const ticketOpen = new Date().toISOString(); // Capture exact submission time in UTC
      const formData = new FormData();
      formData.append("created_by_name", userName); // Send username instead of user_id
      formData.append("users_id", userId); // For assignment
      formData.append("station_id", stationId);
      formData.append("station_name", stationName);
      formData.append("station_type", stationType);
      formData.append("province", province);
      formData.append("issue_on", issueOn);
      formData.append("issue_type", issueTypeName);
      formData.append("issue_description", issueDescription);
      formData.append("ticket_open", ticketOpen);
      if (imagePath) formData.append("image", imagePath);
  

      console.log("FormData:", Object.fromEntries(formData));

      const ticketResponse = await fetchWithTimeout("/api/data/tickets", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!ticketResponse.ok) {
        const text = await ticketResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          throw new Error(`Failed to parse ticket response: ${text}`);
        }
        if (errorData.error?.includes("expired") || errorData.error?.includes("Invalid token")) {
          setErrors(["Session expired. Please log in again."]);
          toast.error("Session expired. Please log in again.");
          router.push("/");
        } else {
          setErrors([errorData.error || "Failed to create ticket."]);
          toast.error(errorData.error || "Failed to create ticket.");
        }
        setIsLoading(false);
        return;
      }

      const ticketData = await ticketResponse.json();
      const ticketId = ticketData.ticketId;
      if (!ticketId || !/^POS\d{2}\d{2}\d{6}$/.test(ticketId)) {
        throw new Error(`Invalid ticket ID returned from server: ${ticketId}`);
      }
      console.log("Ticket Response:", ticketData);

      setFeedback("Ticket created successfully.");
      toast.success("Ticket created successfully!");

      const gmailMessageText = constructGmailMessage({
        stationId,
        stationName,
        stationType,
        province,
        issueOn,
        issueType,
        issueDescription,
        ticketId,
        ticketOpen,
        imagePath,
      });
      const gmailPayload = {
        platform: "gmail",
        email: userEmail,
        message: gmailMessageText,
        subject: "New Ticket Alert",
        imagePath: imagePath || undefined,
      };
      const gmailResponse = await fetchWithTimeout("/api/data/alert_bot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(gmailPayload),
      });
      if (!gmailResponse.ok) {
        const errorData = await gmailResponse.json().catch(() => ({}));
        setErrors([errorData.error || "Failed to send Gmail alert."]);
        toast.error(errorData.error || "Failed to send Gmail alert.");
        setIsLoading(false);
        return;
      }
      setFeedback((prev) => `${prev} Gmail alert sent to ${userEmail}.`);
      toast.success("Gmail alert sent successfully!");

      const userGroup = userGroups.find((group) => group.users_id === userId);
      if (userGroup && userGroup.chatId && botNames.length > 0) {
        const telegramMessage = constructPlainTextTelegramMessage({
          username: userName,
          stationId,
          stationName,
          ticketId,
          issueDescription,
          issueOn,
          issueType: issueTypeName,
          ticketOpen,
        });
        const telegramPayload = {
          platform: "telegram",
          botName: botNames[0],
          username: userName,
          chatId: userGroup.chatId,
          message: telegramMessage,
        };
        const telegramResponse = await fetchWithTimeout("/api/data/alert_bot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(telegramPayload),
        });
        if (!telegramResponse.ok) {
          const errorData = await telegramResponse.json().catch(() => ({}));
          setErrors([errorData.error || `Failed to send Telegram alert to ${userGroup.groupName}.`]);
          toast.error(errorData.error || "Failed to send Telegram alert.");
          setIsLoading(false);
          return;
        }
        setFeedback((prev) => `${prev} Telegram alert sent to ${userGroup.groupName} (${userGroup.chatId}).`);
        toast.success(`Telegram alert sent to ${userGroup.groupName}!`);
      } else {
        const reason = !userGroup
          ? "no associated Telegram group found"
          : !userGroup.chatId
          ? "no valid chat ID for group"
          : "no Telegram bots available";
        setFeedback((prev) => `${prev} No Telegram alert sent (${reason}).`);
        toast(`No Telegram alert sent: ${reason}`);
      }

      setStationId("");
      setIssueType("");
      setIssueDescription("");
      setIssueOn("PTT_Digital");
      setImage(null);
      setImagePreview(null);
    
      if (imageInputRef.current) imageInputRef.current.value = "";
      router.push("/pages/admin/ticket");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      console.error("Ticket Submit Error:", error);
      setErrors([errorMessage]);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <HeaderResponsive>
        <LoadingScreen />
      </HeaderResponsive>
    );
  }

  if (errors.length > 0) {
    return (
      <HeaderResponsive>
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-100">
          <main className="p-4 w-full max-w-md">
            <Toaster position="top-right" />
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <svg
                className="mx-auto h-12 w-12 text-red-500 mb-4"
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
              <p className="text-lg font-semibold text-red-600">
                {errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </p>
            </div>
          </main>
        </div>
      </HeaderResponsive>
    );
  }

  const userGroup = userGroups.find((group) => group.users_id === userId);
  const now = new Date(new Date().toISOString());
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const placeholderTicketId = `POS${year}${month}000081`;

  return (
    <HeaderResponsive>
      <div className="flex flex-col min-h-screen w-full bg-gray-100">
        <main className="flex-1 w-full overflow-y-auto">
          <Toaster position="top-right" />
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
                Create Helpdesk Ticket
              </h1>

              {(feedback || errors.length > 0) && (
                <div
                  className={`mb-6 p-4 rounded-lg text-sm sm:text-base ${
                    feedback && feedback.includes("successfully")
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {feedback && <p>{feedback}</p>}
                  {errors.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-700">
                  Ticket Details
                </h2>
                <form onSubmit={handleTicketSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="relative">
                      <label htmlFor="stationId" className="block text-sm font-medium text-gray-700 mb-1">
                        Station ID
                      </label>
                      <input
                        type="text"
                        id="stationId"
                        value={stationId}
                        onChange={(e) => setStationId(e.target.value)}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                        className="w-full p-3 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter or select station ID"
                        aria-label="Station ID"
                        required
                      />
                      {showDropdown && filteredStations().length > 0 && (
                        <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-md max-h-60 overflow-y-auto shadow-lg mt-1">
                          {filteredStations().map((s) => (
                            <li
                              key={s.station_id}
                              onMouseDown={() => {
                                setStationId(s.station_id);
                                setShowDropdown(false);
                              }}
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 cursor-pointer"
                            >
                              {s.station_name} ({s.station_id})
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Station Name:</strong> {stationName || "Not selected"}</p>
                      <p><strong>Station Type:</strong> {stationType || "Not selected"}</p>
                      <p><strong>Province:</strong> {province || "Not selected"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Issue Category
                      </label>
                      <div className="flex flex-col sm:flex-row sm:space-x-6 mt-2">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            id="issueOnPTTDigital"
                            value="PTT_Digital"
                            checked={issueOn === "PTT_Digital"}
                            onChange={() => setIssueOn("PTT_Digital")}
                            className="form-radio text-blue-500 h-5 w-5 focus:ring-blue-500"
                            aria-label="PTT Digital"
                          />
                          <span className="ml-2 text-sm text-gray-700">PTT Digital</span>
                        </label>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            id="issueOnThirdParty"
                            value="Third_Party"
                            checked={issueOn === "Third_Party"}
                            onChange={() => setIssueOn("Third_Party")}
                            className="form-radio text-blue-500 h-5 w-5 focus:ring-blue-500"
                            aria-label="Third Party"
                          />
                          <span className="ml-2 text-sm text-gray-700">Third Party</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-1">
                        Issue Type
                      </label>
                      <select
                        id="issueType"
                        value={issueType}
                        onChange={(e) => setIssueType(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        aria-label="Issue Type"
                      >
                        <option value="">Select an issue type</option>
                        {issueTypeOptions[issueOn].map((type) => (
                          <option key={type} value={threadIdMap[type].toString()}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="issueDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Description
                    </label>
                    <textarea
                      id="issueDescription"
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      placeholder="Describe the issue (max 1000 characters)"
                      className="w-full p-3 border border-gray-300 rounded-md text-sm sm:text-base h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={1000}
                      required
                      aria-label="Issue Description"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {issueDescription.length}/1000 characters
                    </p>
                  </div>
                  <div>
                    <label htmlFor="issueImage" className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Image (Optional)
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4">
                      <input
                        type="file"
                        id="issueImage"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={handleImageChange}
                        ref={imageInputRef}
                        className="w-full p-3 border border-gray-300 rounded-md text-sm sm:text-base file:bg-gray-100 file:text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0"
                        aria-label="Issue Image Upload"
                      />
                      <span className="text-sm text-gray-500 mt-2 sm:mt-0">
                        (JPEG, PNG, GIF, max 25MB)
                      </span>
                    </div>
                    {imagePreview && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700">Image Preview:</p>
                        <img
                          src={imagePreview}
                          alt="Selected issue image"
                          className="mt-2 max-w-full h-auto rounded-md shadow-sm w-full sm:w-64"
                        />
                       
                      </div>
                    )}
                  </div>
                  <div className="mt-6">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-700">
                      Telegram Preview (To: {userGroup?.groupName || "No group associated"})
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      Note: Ticket ID shown below is a placeholder. Actual ID will be generated upon submission.
                    </p>
                    <div
                      className="w-full p-4 bg-gray-50 rounded-md border border-gray-200"
                      dangerouslySetInnerHTML={{
                        __html: constructTelegramMessage({
                          username: userName,
                          stationId,
                          stationName,
                          issueOn,
                          issueType: numberToIssueType[issueType] || issueType,
                          ticketId: placeholderTicketId,
                          issueDescription,
                          ticketOpen: now.toISOString(),
                        }),
                      }}
                    />
                  </div>
                  <div className="flex justify-center mt-8">
                    <button
                      type="submit"
                      className="w-full sm:w-80 bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 disabled:bg-blue-300 text-base sm:text-lg"
                      disabled={isLoading}
                      aria-label={isLoading ? "Processing..." : "Submit Ticket"}
                    >
                      {isLoading ? "Processing..." : "Submit Ticket"}
                    </button>
                  </div>
                </form>
              </section>
            </div>
          </div>
        </main>
      </div>
    </HeaderResponsive>
  );
}
