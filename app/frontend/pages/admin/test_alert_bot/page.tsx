"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Plus } from "lucide-react";
import HeaderWithSidebar from "@/app/frontend/components/common/Header/Headerwithsidebar";

// Function to generate HTML-formatted message for preview
const constructTelegramMessage = (telegramInputs: {
  username: string;
  status: string;
  assigner?: string;
  stationId: string;
  stationName: string;
  ticketId: string;
  issueType: string;
  issueDescription: string;
}) => {
  const {
    username = "Unknown",
    status = "New",
    assigner = "",
    stationId = "N/A",
    stationName = "N/A",
    ticketId = "N/A",
    issueType = "N/A",
    issueDescription = "No description provided",
  } = telegramInputs;

  if (status === "Assigned") {
    return `
      <div class="w-full max-w-full min-w-0 p-4 bg-white rounded-lg shadow-md font-sans sm:p-6">
        <p class="text-base sm:text-lg font-semibold text-gray-800 mb-2">Dear Mr @${username}</p>
        <p class="text-lg sm:text-xl font-bold text-blue-600 mb-2">Receive Ticket</p>
        <p class="text-sm sm:text-base text-gray-700 mb-2">Status: Assign from Mr/Ms: @${assigner}</p>
        <div class="border-t border-gray-200 my-3 sm:my-4"></div>
        <p class="text-sm sm:text-base text-gray-700">Station ID: ${stationId}</p>
        <p class="text-sm sm:text-base text-gray-700">Station Name: ${stationName}</p>
        <p class="text-sm sm:text-base text-gray-700">Ticket ID: ${ticketId}</p>
        <p class="text-sm sm:text-base text-gray-700">Issue Type: ${issueType}</p>
        <p class="text-sm sm:text-base text-gray-700">Issue Description: ${issueDescription}</p>
        <div class="border-t border-gray-200 my-3 sm:my-4"></div>
        <p class="text-sm sm:text-base text-gray-600 italic">at your earliest convenience. Thank you so much for your attention!</p>
        <p class="text-sm sm:text-base text-gray-400">===================================================================</p>
      </div>
    `;
  } else {
    return `
      <div class="w-full max-w-full min-w-0 p-4 bg-white rounded-lg shadow-md font-sans sm:p-6">
        <p class="text-base sm:text-lg font-semibold text-gray-800 mb-2">Dear Mr @${username}</p>
        <p class="text-lg sm:text-xl font-bold text-blue-600 mb-2">Status: New Ticket</p>
        <div class="border-t border-gray-200 my-3 sm:my-4"></div>
        <p class="text-sm sm:text-base text-gray-700">Station ID: ${stationId}</p>
        <p class="text-sm sm:text-base text-gray-700">Station Name: ${stationName}</p>
        <p class="text-sm sm:text-base text-gray-700">Ticket ID: ${ticketId}</p>
        <p class="text-sm sm:text-base text-gray-700">Issue Type: ${issueType}</p>
        <p class="text-sm sm:text-base text-gray-700">Issue Description: ${issueDescription}</p>
        <div class="border-t border-gray-200 my-3 sm:my-4"></div>
        <p class="text-sm sm:text-base text-gray-600 italic">at your earliest convenience. Thank you so much for your attention!</p>
        <p class="text-sm sm:text-base text-gray-400">===================================================================</p>
      </div>
    `;
  }
};

// Function to generate plain text message for Telegram API
const constructPlainTextTelegramMessage = (telegramInputs: {
  username: string;
  status: string;
  assigner?: string;
  stationId: string;
  stationName: string;
  ticketId: string;
  issueType: string;
  issueDescription: string;
}) => {
  const {
    username,
    status,
    assigner = "", // Fix TypeScript error
    stationId,
    stationName,
    ticketId,
    issueType,
    issueDescription,
  } = telegramInputs;

  if (
    !username?.trim() ||
    !status?.trim() ||
    !stationId?.trim() ||
    !stationName?.trim() ||
    !ticketId?.trim() ||
    !issueType?.trim() ||
    !issueDescription?.trim()
  ) {
    throw new Error(
      "All required fields (Username, Status, Station ID, Station Name, Ticket ID, Issue Type, Issue Description) must be non-empty"
    );
  }
  if (status === "Assigned" && !assigner.trim()) {
    throw new Error("Assigner is required for Assigned status");
  }

  // Escape special characters for Telegram Markdown
  const escapeMarkdown = (text: string) => text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");

  if (status === "Assigned") {
    return `Dear Mr @${escapeMarkdown(username)}
Receive Ticket
Status: Assign from Mr/Ms: @${escapeMarkdown(assigner)}

Station ID: ${escapeMarkdown(stationId)}
Station Name: ${escapeMarkdown(stationName)}
Ticket ID: ${escapeMarkdown(ticketId)}
Issue Type: ${escapeMarkdown(issueType)}
Issue Description: ${escapeMarkdown(issueDescription)}

at your earliest convenience. Thank you so much for your attention!
===================================================================`;
  } else {
    return `Dear Mr @${escapeMarkdown(username)}

Status: New Ticket

Station ID: ${escapeMarkdown(stationId)}
Station Name: ${escapeMarkdown(stationName)}
Ticket ID: ${escapeMarkdown(ticketId)}
Issue Type: ${escapeMarkdown(issueType)}
Issue Description: ${escapeMarkdown(issueDescription)}

at your earliest convenience. Thank you so much for your attention!
===================================================================`;
  }
};

// Function to generate Gmail message preview
const constructGmailMessage = ({ email, gmailMessage }: { email: string; gmailMessage: string }) => `
  <div class="w-full max-w-full min-w-0 p-4 bg-white rounded-lg shadow-md font-sans sm:p-6">
    <p class="text-sm sm:text-base text-gray-700">To: ${email}</p>
    <p class="text-sm sm:text-base text-gray-700">From: PTT POS System <pttpos.system@gmail.com></p>
    <p class="text-sm sm:text-base text-gray-700">Subject: New Ticket Alert</p>
    <div class="border-t border-gray-200 my-3 sm:my-4"></div>
    <p class="text-sm sm:text-base text-gray-700">${gmailMessage}</p>
  </div>
`;

const AlertBotPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [telegramInputs, setTelegramInputs] = useState({
    botName: "",
    username: "",
    chatId: "",
    threadId: "",
    status: "",
    assigner: "",
    stationId: "",
    stationName: "",
    ticketId: "",
    issueType: "",
    issueDescription: "",
  });
  const [gmailInputs, setGmailInputs] = useState({
    email: "",
    gmailMessage: "",
  });
  const [addBotInputs, setAddBotInputs] = useState({
    botName: "",
    botToken: "",
  });
  const [botNames, setBotNames] = useState<string[]>([]);
  const [usernames, setUsernames] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [issueTypes, setIssueTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isAddBotModalOpen, setIsAddBotModalOpen] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const token = sessionStorage.getItem("token");
      if (!token) {
        setFeedback("Please log in to access this page.");
        router.push("/");
        return;
      }

      try {
        const botsResponse = await fetch("/api/data/fetchbot", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Add token
          },
        });
        if (!botsResponse.ok) {
          throw new Error("Failed to fetch bot names");
        }
        const botsData = await botsResponse.json();
        setBotNames(Array.isArray(botsData) ? botsData : []);

        const filtersResponse = await fetch("/api/data/report-filters", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!filtersResponse.ok) {
          if (filtersResponse.status === 401) {
            setFeedback("Invalid or expired token. Please log in again.");
            router.push("/");
            return;
          }
          throw new Error("Failed to fetch filter data");
        }
        const filtersData = await filtersResponse.json();
        const users = Array.isArray(filtersData.users) ? filtersData.users : [];
        const usernames = users.map(
          (user: { id: string; users_name: string }) => user.users_name
        );
        console.log("Fetched usernames:", usernames); // Debug
        setUsernames(usernames);
        setStatuses(Array.isArray(filtersData.statuses) ? filtersData.statuses : []);
        setIssueTypes(Array.isArray(filtersData.issueTypes) ? filtersData.issueTypes : []);
        if (usernames.length > 0) {
          setTelegramInputs((prev) => ({
            ...prev,
            username: usernames[0], // Set default username
            assigner: usernames[0], // Set default assigner
          }));
        } else {
          setFeedback("No usernames available. Please check the report-filters API or database.");
        }
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "Failed to load data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleTelegramInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTelegramInputs((prev) => ({ ...prev, [name]: value }));
    console.log(`Input changed: ${name} = ${value}`); // Debug
  };

  const handleGmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGmailInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddBotInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddBotInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleTelegramSubmit = async () => {
    setFeedback(null);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to send alerts.");
      }
      if (!telegramInputs.username.trim()) {
        throw new Error("Username is required");
      }
      const message = constructPlainTextTelegramMessage(telegramInputs);
      const payload = {
        platform: "telegram",
        botName: telegramInputs.botName,
        username: telegramInputs.username,
        chatId: telegramInputs.chatId,
        threadId: telegramInputs.threadId,
        message,
        assigner: telegramInputs.assigner,
      };
      console.log("Sending Telegram alert with payload:", payload); // Debug
      const response = await fetch("/api/data/alert_bot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send Telegram alert");
      }
      setFeedback(data.message || "Telegram alert sent successfully");
      setTelegramInputs({
        botName: "",
        username: usernames.length > 0 ? usernames[0] : "",
        chatId: "",
        threadId: "",
        status: "",
        assigner: usernames.length > 0 ? usernames[0] : "",
        stationId: "",
        stationName: "",
        ticketId: "",
        issueType: "",
        issueDescription: "",
      });
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "An error occurred while sending Telegram alert"
      );
    }
  };

  const handleGmailSubmit = async () => {
    setFeedback(null);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to send alerts.");
      }
      if (!gmailInputs.email.trim() || !gmailInputs.gmailMessage.trim()) {
        throw new Error("Email and Message are required for Gmail");
      }
      const response = await fetch("/api/data/alert_bot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          platform: "gmail",
          email: gmailInputs.email,
          message: gmailInputs.gmailMessage,
          subject: "New Ticket Alert",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send Gmail alert");
      }
      setFeedback(data.message || "Gmail alert sent successfully");
      setGmailInputs({ email: "", gmailMessage: "" });
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "An error occurred while sending Gmail alert"
      );
    }
  };

  const handleAddBotSubmit = async () => {
    setFeedback(null);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to add a bot.");
      }
      if (!addBotInputs.botName.trim() || !addBotInputs.botToken.trim()) {
        throw new Error("Bot Name and Bot Token are required");
      }
      const response = await fetch("/api/data/alert_bot/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          botName: addBotInputs.botName,
          botToken: addBotInputs.botToken,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to add bot");
      }
      setFeedback(data.message || "Bot added successfully");
      const botsResponse = await fetch("/api/data/fetchbot", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (botsResponse.ok) {
        const botsData = await botsResponse.json();
        setBotNames(Array.isArray(botsData) ? botsData : []);
      }
      setAddBotInputs({ botName: "", botToken: "" });
      setIsAddBotModalOpen(false);
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "An error occurred while adding bot"
      );
    }
  };

  const isTelegramSubmitDisabled =
    !telegramInputs.botName.trim() ||
    !telegramInputs.username.trim() ||
    telegramInputs.username === "Select Username" ||
    !telegramInputs.chatId.trim() ||
    !telegramInputs.status.trim() ||
    !telegramInputs.stationId.trim() ||
    !telegramInputs.stationName.trim() ||
    !telegramInputs.ticketId.trim() ||
    !telegramInputs.issueType.trim() ||
    !telegramInputs.issueDescription.trim() ||
    (telegramInputs.status === "Assigned" && !telegramInputs.assigner.trim()) ||
    usernames.length === 0; // Disable if no usernames available

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
                <span className="text-lg font-medium text-gray-600">Loading data...</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (feedback && feedback.includes("log in")) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isSidebarOpen ? "sm:ml-64" : ""} transition-all duration-300 overflow-x-hidden box-border`}>
        <HeaderWithSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex w-full">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
            <div className="flex items-center justify-center py-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md w-full">
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
                <p className="mt-4 text-lg font-semibold text-red-600">{feedback}</p>
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
        <main className="flex-1 mt-17 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
          <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md border border-gray-200 w-full max-w-full">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Alert Bot</h1>

            {feedback && (
              <div
                className={`mb-4 p-3 rounded text-sm sm:text-base w-full max-w-full ${
                  feedback.includes("successfully") || feedback.includes("Message ID")
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {feedback}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8 w-full max-w-full">
              <button
                onClick={handleTelegramSubmit}
                className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 w-full sm:w-auto text-sm sm:text-base"
                disabled={isTelegramSubmitDisabled}
              >
                <Bell size={16} />
                Send Alert
              </button>
              <button
                onClick={() => setIsAddBotModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full sm:w-auto text-sm sm:text-base"
              >
                <Plus size={16} />
                Add Bot
              </button>
            </div>

            {isAddBotModalOpen && (
              <div className="fixed inset-0 bg-gray bg-opacity-50 backdrop-blur-md animate-fade flex items-center justify-center z-50">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-lg mx-4">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4">Add New Telegram Bot</h2>
                  <div className="flex flex-col gap-4">
                    <input
                      type="text"
                      name="botName"
                      placeholder="Bot Name"
                      value={addBotInputs.botName}
                      onChange={handleAddBotInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                    />
                    <input
                      type="text"
                      name="botToken"
                      placeholder="Bot Token"
                      value={addBotInputs.botToken}
                      onChange={handleAddBotInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                    />
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-wrap">
                      <button
                        onClick={handleAddBotSubmit}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 w-full sm:w-auto text-sm sm:text-base"
                        disabled={!addBotInputs.botName.trim() || !addBotInputs.botToken.trim()}
                      >
                        Add Bot
                      </button>
                      <button
                        onClick={() => setIsAddBotModalOpen(false)}
                        className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 w-full sm:w-auto text-sm sm:text-base"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <section className="mb-8 sm:mb-10">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Telegram</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-full">
                <div className="flex-1 min-w-0">
                  <select
                    name="botName"
                    value={telegramInputs.botName}
                    onChange={handleTelegramInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                  >
                    <option value="">Select Bot</option>
                    {botNames.length > 0 ? (
                      botNames.map((botName) => (
                        <option key={botName} value={botName}>
                          {botName}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No bots available
                      </option>
                    )}
                  </select>
                </div>
                <div className="flex-1 min-w-0">
                  <select
                    name="username"
                    value={telegramInputs.username}
                    onChange={handleTelegramInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                  >
                    <option value="">Select Username</option>
                    {usernames.length > 0 ? (
                      usernames.map((username) => (
                        <option key={username} value={username}>
                          {username}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No usernames available
                      </option>
                    )}
                  </select>
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    name="chatId"
                    placeholder="Chat ID (Group)"
                    value={telegramInputs.chatId}
                    onChange={handleTelegramInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    name="threadId"
                    placeholder="Thread_message_ID (Topic)"
                    value={telegramInputs.threadId}
                    onChange={handleTelegramInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <select
                    name="status"
                    value={telegramInputs.status}
                    onChange={handleTelegramInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                  >
                    <option value="">Select Status</option>
                    <option value="New">New</option>
                    <option value="Assigned">Assigned</option>
                  </select>
                </div>
                {telegramInputs.status === "Assigned" && (
                  <div className="flex-1 min-w-0">
                    <select
                      name="assigner"
                      value={telegramInputs.assigner}
                      onChange={handleTelegramInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                    >
                      <option value="">Select Assigner</option>
                      {usernames.length > 0 ? (
                        usernames.map((username) => (
                          <option key={username} value={username}>
                            {username}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No users available
                        </option>
                      )}
                    </select>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    name="stationId"
                    placeholder="Station ID"
                    value={telegramInputs.stationId}
                    onChange={handleTelegramInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    name="stationName"
                    placeholder="Station Name"
                    value={telegramInputs.stationName}
                    onChange={handleTelegramInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    name="ticketId"
                    placeholder="Ticket ID"
                    value={telegramInputs.ticketId}
                    onChange={handleTelegramInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <select
                    name="issueType"
                    value={telegramInputs.issueType}
                    onChange={handleTelegramInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                  >
                    <option value="">Select Issue Type</option>
                    {issueTypes.length > 0 ? (
                      issueTypes.map((issueType) => (
                        <option key={issueType} value={issueType}>
                          {issueType}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No issue types available
                      </option>
                    )}
                  </select>
                </div>
                <div className="flex-1 min-w-0 col-span-1 sm:col-span-2 lg:col-span-4">
                  <input
                    type="text"
                    name="issueDescription"
                    placeholder="Issue Description"
                    value={telegramInputs.issueDescription}
                    onChange={handleTelegramInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-base sm:text-lg font-semibold mb-2">Message Preview</h3>
                <div
                  className="w-full max-w-full min-w-0"
                  dangerouslySetInnerHTML={{ __html: constructTelegramMessage(telegramInputs) }}
                />
              </div>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Gmail</h2>
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-full">
                <div className="flex-1 min-w-0">
                  <input
                    type="email"
                    name="email"
                    placeholder="UserGmail.com"
                    value={gmailInputs.email}
                    onChange={handleGmailInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    name="gmailMessage"
                    placeholder="Message"
                    value={gmailInputs.gmailMessage}
                    onChange={handleGmailInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                  />
                </div>
                <button
                  onClick={handleGmailSubmit}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 w-full sm:w-auto text-sm sm:text-base"
                  disabled={!gmailInputs.email.trim() || !gmailInputs.gmailMessage.trim()}
                >
                  Send
                </button>
              </div>
              <div className="mt-6">
                <h3 className="text-base sm:text-lg font-semibold mb-2">Gmail Message Preview</h3>
                <div
                  className="w-full max-w-full min-w-0"
                  dangerouslySetInnerHTML={{ __html: constructGmailMessage(gmailInputs) }}
                />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AlertBotPage;