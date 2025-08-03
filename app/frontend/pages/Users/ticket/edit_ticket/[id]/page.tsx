
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Ticket } from "@/app/backend/types/ticket";
import HeaderResponsive from "@/app/frontend/components/common/Header/headerResponsive";
import { Toaster, toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  name: string;
}

interface DbUser {
  users_id: string;
  users_name: string;
  email: string;
  status: number;
  code: number;
  rules_id?: number;
  company?: string;
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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";

const constructGmailMessage = (ticketData: {
  stationId: string;
  stationName: string;
  issueType: string;
  issueDescription: string;
  ticketId: string;
  assignedFrom: string;
}) => {
  const { stationId, stationName, issueType, issueDescription, ticketId, assignedFrom } = ticketData;
  const issueTypeString = numberToIssueType[issueType] || issueType;

  return `=======================================\n\n
  Ticket Assign\n\n
  Assign From ${assignedFrom || "Unknown"}\n
  Station ID: ${stationId}\n
  Station Name: ${stationName}\n
  Issue Type: ${issueTypeString}\n
  Issue Description: ${issueDescription}\n
  Ticket ID: ${ticketId || "Not Available"}\n
  Assigned From: ${assignedFrom || "Unknown"}\n\n
  Please log in to your helpdesk for further details.\n\n
  ==================================================`;
};

const constructPlainTextTelegramMessage = (ticketData: {
  username: string;
  stationId: string;
  stationName: string;
  ticketId: string;
  issueDescription: string;
  assignedFrom: string;
}) => {
  const { username, stationId, stationName, ticketId, issueDescription, assignedFrom } = ticketData;

  if (
    !username?.trim() ||
    !stationId?.trim() ||
    !stationName?.trim() ||
    !ticketId?.trim() ||
    !issueDescription?.trim()
  ) {
    throw new Error("Required fields (username, stationId, stationName, ticketId, issueDescription) must be non-empty for Telegram message");
  }

  const escapeMarkdown = (text: string) => text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");

  return `============================================\nDear ${escapeMarkdown(username)}\nTicket Assign\nAssign From ${assignedFrom || "Unknown"}\nStation ID: ${escapeMarkdown(stationId)}\nStation Name: ${escapeMarkdown(stationName)}\nTicket ID: ${escapeMarkdown(ticketId || "Not Available")}\nIssue Description: ${escapeMarkdown(issueDescription)}\n\nPlease log in to your helpdesk to review.\n=============================================`;
};

const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 60000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw error;
  }
};

export default function EditTicketPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [formData, setFormData] = useState({
    station_id: "",
    station_name: "",
    users_name: "",
    issue_type: "",
    issue_description: "",
    comment: "",
    status: "",
  });
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [dbUsers, setDbUsers] = useState<DbUser[]>([]);
  const [availableIssueTypes, setAvailableIssueTypes] = useState<{ id: string; name: string }[]>([]);
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [botNames, setBotNames] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserName, setCurrentUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in.");
        toast.error("No authentication token found. Please log in.");
        setLoading(false);
        setTimeout(() => router.push("/"), 1000);
        return;
      }

      if (!id) {
        setError("Invalid ticket ID in URL.");
        toast.error("Invalid ticket ID in URL.");
        setLoading(false);
        setTimeout(() => router.push("/pages/Users/ticket"), 1000);
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
        setCurrentUserId(userId);
        setCurrentUserName(decoded.users_name || "Unknown");

        const [ticketResponse, userGroupsResponse, botsResponse, usersResponse] = await Promise.all([
          fetchWithTimeout(`/api/data/tickets/${id}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetchWithTimeout("/api/data/user_groups", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetchWithTimeout("/api/data/fetchbot", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetchWithTimeout("/api/data/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!ticketResponse.ok) {
          const errorData = await ticketResponse.json();
          console.error("Ticket Response Error:", errorData);
          throw new Error(errorData.error || "Failed to fetch ticket");
        }
        const data = await ticketResponse.json();
        // console.log("Ticket Data:", data);
        // console.log("Ticket ID from URL:", id);
        // console.log("Ticket ID from Response:", data.ticket?.ticket_id);
        setTicket(data.ticket);
        setFormData({
          station_id: data.ticket.station_id || "",
          station_name: data.ticket.station_name || "",
          users_name: data.ticket.users_name || "",
          issue_type: data.ticket.issue_type || "",
          issue_description: data.ticket.issue_description || "",
          comment: data.ticket.comment || "",
          status: data.ticket.status || "",
        });
        setAvailableIssueTypes(data.availableIssueTypes || []);

        if (!usersResponse.ok) {
          const errorData = await usersResponse.json();
          console.error("Users Response Error:", { status: usersResponse.status, error: errorData });
          throw new Error(errorData.error || `Failed to fetch users: ${usersResponse.status}`);
        }
        const usersData = await usersResponse.json();
        // console.log("Users Data from /api/data/users:", usersData);
        const formattedUsers: DbUser[] = Array.isArray(usersData)
          ? usersData
              .filter((user: any) => user.status === 1 && user.code === 0)
              .map((user: any) => ({
                users_id: String(user.users_id),
                users_name: String(user.users_name),
                email: String(user.email),
                status: Number(user.status || 1),
                code: Number(user.code || 0),
                rules_id: user.rules_id !== undefined ? Number(user.rules_id) : undefined,
                company: user.company || undefined,
              }))
          : [];
        // console.log("Formatted Users (dbUsers):", formattedUsers);
        setDbUsers(formattedUsers);
        setAvailableUsers(
          formattedUsers.map((u: DbUser) => ({
            id: u.users_id,
            name: u.users_name,
          }))
        );
        // console.log("Available Users:", formattedUsers.map((u: DbUser) => ({ id: u.users_id, name: u.users_name })));

        if (!userGroupsResponse.ok) {
          const errorData = await userGroupsResponse.json();
          console.error("User Groups Response Error:", { status: userGroupsResponse.status, error: errorData });
          setUserGroups([]);
        } else {
          const userGroupsData = await userGroupsResponse.json();
          const formattedUserGroups = Array.isArray(userGroupsData)
            ? userGroupsData.map((group: any) => ({
                users_id: String(group.users_id),
                username: String(group.username || group.users_name || "-"),
                chatId: String(group.chatId || ""),
                groupName: String(group.groupName || "-"),
              }))
            : [];
          // console.log("User Groups:", formattedUserGroups);
          setUserGroups(formattedUserGroups);
        }

        if (!botsResponse.ok) {
          const errorData = await botsResponse.json();
          console.error("Bots Response Error:", { status: botsResponse.status, error: errorData });
          setBotNames([]);
        } else {
          const botsData = await botsResponse.json();
          // console.log("Bot Names:", botsData);
          setBotNames(Array.isArray(botsData) ? botsData : []);
        }
      } catch (err: any) {
        const errorMsg = err.message || "Unknown error occurred while fetching data";
        console.error("Error in fetchTicket:", err);
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!formData.station_id.trim()) errors.push("Station ID is required.");
    if (!formData.station_name.trim()) errors.push("Station Name is required.");
    if (!formData.users_name.trim()) errors.push("Assigned user is required.");
    if (!formData.issue_type.trim()) errors.push("Issue type is required.");
    if (!formData.status.trim()) errors.push("Status is required.");
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);
    setLoading(true);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(" "));
      toast.error(validationErrors.join(" "));
      setLoading(false);
      return;
    }

    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in.");
      toast.error("No authentication token found. Please log in.");
      setLoading(false);
      setTimeout(() => router.push("/"), 1000);
      return;
    }

    try {
      const response = await fetchWithTimeout(`/api/data/tickets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update ticket");
      }

      setFeedback("Ticket updated successfully!");
      toast.success("Ticket updated successfully!", {
        duration: 1000,
        position: "top-right",
      });

      const assignedUser = availableUsers.find((user) => user.name === formData.users_name);
      if (!assignedUser) {
        setError("Assigned user not found.");
        toast.error("Assigned user not found.");
        setLoading(false);
        return;
      }

      const dbUser = dbUsers.find((u) => u.users_id === assignedUser.id);
      if (!dbUser || !dbUser.email) {
        setError("Assigned user has no email address.");
        toast.error("Assigned user has no email address.");
        setLoading(false);
        return;
      }

      const ticketIdToUse = ticket?.ticket_id || id || "Not Available";
      // console.log("Ticket ID for Alerts:", ticketIdToUse);

      // Send Gmail alert
      const gmailMessageText = constructGmailMessage({
        stationId: formData.station_id,
        stationName: formData.station_name,
        issueType: formData.issue_type,
        issueDescription: formData.issue_description,
        ticketId: ticketIdToUse,
        assignedFrom: currentUserName,
      });
      const gmailPayload = {
        platform: "gmail",
        email: dbUser.email,
        message: gmailMessageText,
        subject: "Ticket Assignment Update",
      };
      // console.log("Gmail Payload:", gmailPayload);
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
        setError(errorData.error || `Failed to send Gmail alert to ${dbUser.email}.`);
        toast.error(errorData.error || `Failed to send Gmail alert to ${dbUser.email}.`);
        setLoading(false);
        return;
      }
      setFeedback((prev) => `${prev} Gmail alert sent to ${dbUser.email}.`);
      toast.success(`Gmail alert sent to ${dbUser.email}!`);

      // Check for Telegram group and send alert if exists
      const userGroup = userGroups.find((group) => group.users_id === assignedUser.id);
      // console.log("Selected User for Telegram:", assignedUser);
      // console.log("User Group for Telegram:", userGroup);
      if (userGroup && userGroup.chatId && botNames.length > 0) {
        const telegramMessage = constructPlainTextTelegramMessage({
          username: userGroup.username || formData.users_name,
          stationId: formData.station_id,
          stationName: formData.station_name,
          ticketId: ticketIdToUse,
          issueDescription: formData.issue_description,
          assignedFrom: currentUserName,
        });
        const telegramPayload = {
          platform: "telegram",
          botName: botNames[0],
          username: userGroup.username || formData.users_name,
          chatId: userGroup.chatId,
          message: telegramMessage,
        };
        // console.log("Telegram Payload:", telegramPayload);
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
          setFeedback((prev) => `${prev} Failed to send Telegram alert to ${userGroup.groupName}.`);
          toast.error(errorData.error || "Failed to send Telegram alert.");
        } else {
          setFeedback((prev) => `${prev} Telegram alert sent to ${userGroup.groupName} (${userGroup.chatId}).`);
          toast.success(`Telegram alert sent to ${userGroup.groupName}!`);
        }
      } else {
        const reason = !userGroup
          ? "no associated Telegram group found"
          : !userGroup.chatId
          ? "no valid chat ID for group"
          : "no Telegram bots available";
        setFeedback((prev) => `${prev} No Telegram alert sent (${reason}).`);
        toast(`No Telegram alert sent: ${reason}`);
      }

      setTimeout(() => router.push("/pages/Users/ticket"), 1000);
    } catch (err: any) {
      const errorMsg = err.message || "Unknown error occurred while updating ticket";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  const selectedUser = availableUsers.find((user) => user.name === formData.users_name);
  const selectedUserGroup = userGroups.find((group) => group.users_id === selectedUser?.id);
  // console.log("Selected User:", selectedUser);
  // console.log("Selected User Group:", selectedUserGroup);

  const ticketIdToUse = ticket?.ticket_id || id || "Not Available";
  let telegramPreview = "No Telegram message will be sent (no user selected or no group associated).";
  try {
    if (formData.users_name && formData.station_id && formData.station_name && formData.issue_description && selectedUserGroup?.chatId) {
      telegramPreview = constructPlainTextTelegramMessage({
        username: selectedUserGroup.username || formData.users_name,
        stationId: formData.station_id,
        stationName: formData.station_name,
        ticketId: ticketIdToUse,
        issueDescription: formData.issue_description,
        assignedFrom: currentUserName,
      }).replace(/\n/g, "<br />");
    }
  } catch (err) {
    telegramPreview = "Invalid Telegram message format.";
  }

  if (loading) {
    return (
      <HeaderResponsive>
        <div className="flex w-full">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
            <Toaster position="top-right" />
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-3">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                </svg>
                <span className="text-lg font-medium text-gray-600">Loading ticket data...</span>
              </div>
            </div>
          </main>
        </div>
      </HeaderResponsive>
    );
  }

  if (error) {
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
                <p className="mt-4 text-lg font-semibold text-red-600">{error}</p>
              </div>
            </div>
          </main>
        </div>
      </HeaderResponsive>
    );
  }

  if (!ticket) return null;

  return (
    <HeaderResponsive>
      <div className="flex w-full">
        <main className="flex-1 mt-17 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
          <Toaster position="top-right" />
          <div className="flex justify-center items-center min-h-[calc(100vh-128px)]">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-md sm:max-w-full border border-gray-200">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
                Edit Ticket
              </h1>
              <p className="text-sm text-gray-500 mb-4 sm:mb-6 text-center">
                Ticket ID: {ticket.ticket_id || "Not Available"}
              </p>
              {(error || feedback) && (
                <div
                  className={`mb-4 p-3 rounded text-sm sm:text-base ${
                    feedback ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  } w-full max-w-full`}
                >
                  {error || feedback}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-full min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Station ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="station_id"
                      value={formData.station_id}
                      onChange={handleChange}
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Station ID"
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Station Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="station_name"
                      value={formData.station_name}
                      onChange={handleChange}
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Station Name"
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assign <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="users_name"
                      value={formData.users_name}
                      onChange={handleChange}
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Assign User"
                      required
                    >
                      <option value="">Select User</option>
                      {availableUsers.map((user) => (
                        <option key={user.id} value={user.name}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                      Available Users: {availableUsers.length}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="issue_type"
                      value={formData.issue_type}
                      onChange={handleChange}
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Issue Type"
                      required
                    >
                      <option value="">Select Issue Type</option>
                      {availableIssueTypes.map((type) => (
                        <option key={type.id} value={type.name}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Status"
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="open">Open</option>
                      <option value="in progress">In Progress</option>
                      <option value="close">Close</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Description
                    </label>
                    <textarea
                      name="issue_description"
                      value={formData.issue_description}
                      onChange={handleChange}
                      disabled
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md text-sm sm:text-base bg-gray-100 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Issue Description"
                      aria-disabled="true"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comment
                    </label>
                    <input
                      type="text"
                      name="comment"
                      value={formData.comment}
                      onChange={handleChange}
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Comment"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Current Associations</h3>
                  {userGroups.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="text-left text-sm sm:text-base font-medium text-gray-700 px-4 py-2 border-b">Username</th>
                            <th className="text-left text-sm sm:text-base font-medium text-gray-700 px-4 py-2 border-b">In Group</th>
                            <th className="text-left text-sm sm:text-base font-medium text-gray-700 px-4 py-2 border-b">Chat ID</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userGroups.map((group, index) => (
                            <tr key={`group-${index}`} className="hover:bg-gray-50">
                              <td className="text-sm sm:text-base text-gray-600 px-4 py-2 border-b">{group.username}</td>
                              <td className="text-sm sm:text-base text-gray-600 px-4 py-2 border-b">{group.groupName}</td>
                              <td className="text-sm sm:text-base text-gray-600 px-4 py-2 border-b">{group.chatId}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm sm:text-base text-gray-600">No user-group associations found.</p>
                  )}
                </div>
                <div className="mt-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-700">
                    Telegram Preview (To Group : {selectedUserGroup?.groupName  || "No group associated"})
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Preview of the message to be sent to the assigned Telegram group.
                  </p>
                  <div
                    className="w-full p-4 bg-gray-50 rounded-md border border-gray-200 text-sm sm:text-base text-gray-600"
                    dangerouslySetInnerHTML={{ __html: telegramPreview }}
                  />
                </div>
                <div className="flex justify-center space-x-4 mt-4 sm:mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-40 max-w-full min-w-0 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 text-sm sm:text-base font-medium"
                    aria-label={loading ? "Updating Ticket" : "Update Ticket"}
                  >
                    {loading ? "Updating..." : "Update Ticket"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/pages/Users/ticket")}
                    className="w-full sm:w-40 max-w-full min-w-0 bg-gray-400 text-white px-6 py-2 rounded-md hover:bg-gray-500 text-sm sm:text-base font-medium"
                    aria-label="Cancel"
                  >
                    Cancel
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
