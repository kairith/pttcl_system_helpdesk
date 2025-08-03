"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Plus, Save, Trash2, Edit } from 'lucide-react';
import { toast } from 'react-toastify';
import HeaderResponsive from '@/app/frontend/components/common/Header/headerResponsive';
import LoadingScreen from '@/app/frontend/components/ui/loadingScreen';

// Interfaces
interface TelegramInputs {
  botName: string;
  users_id: string;
  username: string;
  chatId: string;
  status: string;
  assigner: string;
  stationId: string;
  stationName: string;
  ticketId: string;
  issueDescription: string;
}

interface GmailInputs {
  email: string;
  gmailMessage: string;
}

interface AddBotInputs {
  botName: string;
  botToken: string;
}

interface AddGroupInputs {
  chatId: string;
  groupName: string;
}

interface UserGroup {
  users_id: string;
  username: string;
  chatId: string;
  groupName: string;
}

interface UserGroupInputs {
  users_id: string;
  chatId: string;
}

interface EditUserGroupInputs {
  users_id: string;
  chatId: string;
}

interface User {
  users_id: string;
  users_name: string;
}

interface TelegramGroup {
  id: number;
  chatId: string;
  groupName: string;
}

interface EditGroupInputs {
  id: number;
  chatId: string;
  groupName: string;
}

interface FiltersData {
  statuses: string[];
  users: User[];
}

// Function to generate HTML-formatted message for preview
const constructTelegramMessage = (telegramInputs: {
  username: string;
  status: string;
  assigner?: string;
  stationId: string;
  stationName: string;
  ticketId: string;
  issueDescription: string;
}) => {
  const {
    username = "Unknown",
    status = "New",
    assigner = "",
    stationId = "N/A",
    stationName = "N/A",
    ticketId = "N/A",
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
        <p class="text-sm sm:text-base text-gray-700">Issue Description: ${issueDescription}</p>
        <div class="border-t border-gray-200 my-3"></div>
        <p class="text-sm sm:text-base text-gray-600 italic">Please log in to your helpdesk to review. Thank you!</p>
        <p class="text-sm sm:text-sm text-gray-400">===================================================================</p>
      </div>
    `;
  } else {
    return `
      <div class="w-full max-w-full min-w-0 p-4 bg-white rounded-lg shadow-md font-sans sm:p-6">
        <p class="text-base sm:text-lg font-semibold text-gray-800 mb-2">Dear Mr @${username}</p>
        <p class="text-lg sm:text-xl font-bold text-blue-600 mb-2">Status: New Ticket</p>
        <div class="border-t border-gray-200 my-4"></div>
        <p class="text-sm sm:text-base text-gray-700">Station ID: ${stationId}</p>
        <p class="text-sm sm:text-base text-gray-700">Station Name: ${stationName}</p>
        <p class="text-sm sm:text-base text-gray-700">Ticket ID: ${ticketId}</p>
        <p class="text-sm sm:text-base text-gray-700">Issue Description: ${issueDescription}</p>
        <div class="border-t border-gray-200 my-3"></div>
        <p class="text-sm sm:text-base text-gray-600 italic">Please log in to your helpdesk to review. Thank you!</p>
        <p class="text-sm text-gray-400">===================================================================</p>
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
  issueDescription: string;
}) => {
  const {
    username,
    status,
    assigner = "",
    stationId,
    stationName,
    ticketId,
    issueDescription,
  } = telegramInputs;

  if (
    !username?.trim() ||
    !status?.trim() ||
    !stationId?.trim() ||
    !stationName?.trim() ||
    !ticketId?.trim() ||
    !issueDescription?.trim()
  ) {
    throw new Error(
      "All required fields (Username, Status, Station ID, Station Name, Ticket ID, Issue Description) must be non-empty"
    );
  }
  if (status === "Assigned" && !assigner?.trim()) {
    throw new Error("Assigner is required for Assigned status");
  }

  const escapeMarkdown = (text: string) => text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");

  if (status === "Assigned") {
    return `========================================================
Dear Mr @${escapeMarkdown(username)}
Receive Ticket
Status: Assign from Mr/Ms: @${escapeMarkdown(assigner)}

Station ID: ${escapeMarkdown(stationId)}
Station Name: ${escapeMarkdown(stationName)}
Ticket ID: ${escapeMarkdown(ticketId)}
Issue Description: ${escapeMarkdown(issueDescription)}

Please log in to your helpdesk to review. Thank you!
========================================================`;
  } else {
    return `========================================================
Dear Mr @${escapeMarkdown(username)}
Status: New Ticket

Station ID: ${escapeMarkdown(stationId)}
Station Name: ${escapeMarkdown(stationName)}
Ticket ID: ${escapeMarkdown(ticketId)}
Issue Description: ${escapeMarkdown(issueDescription)}

Please log in to your helpdesk to review. Thank you!
========================================================`;
  }
};

// Function to generate Gmail message preview
const constructGmailMessage = ({ email, gmailMessage }: { email: string; gmailMessage: string }) => `
  <div class="w-full max-w-full min-w-0 p-4 bg-white rounded-lg shadow-md font-sans sm:p-6">
    <p class="text-sm sm:text-base text-gray-700">To: ${email}</p>
    <p class="text-sm sm:text-base text-gray-700">From: PTT Helpdesk System <pttpos.system@gmail.com></p>
    <p class="text-sm sm:text-base text-gray-700">Subject: New Ticket Alert</p>
    <div class="border-t border-gray-200 my-3 sm:my-4"></div>
    <p class="text-sm sm:text-base text-gray-700">${gmailMessage}</p>
  </div>
`;

const AlertBotPage: React.FC = () => {
  const [telegramInputs, setTelegramInputs] = useState<TelegramInputs>({
    botName: "",
    users_id: "",
    username: "",
    chatId: "",
    status: "",
    assigner: "",
    stationId: "",
    stationName: "",
    ticketId: "",
    issueDescription: "",
  });
  const [gmailInputs, setGmailInputs] = useState<GmailInputs>({
    email: "",
    gmailMessage: "",
  });
  const [addBotInputs, setAddBotInputs] = useState<AddBotInputs>({
    botName: "",
    botToken: "",
  });
  const [addGroupInputs, setAddGroupInputs] = useState<AddGroupInputs>({
    chatId: "",
    groupName: "",
  });
  const [editGroupInputs, setEditGroupInputs] = useState<EditGroupInputs>({
    id: 0,
    chatId: "",
    groupName: "",
  });
  const [userGroupInputs, setUserGroupInputs] = useState<UserGroupInputs>({
    users_id: "",
    chatId: "",
  });
  const [editUserGroupInputs, setEditUserGroupInputs] = useState<EditUserGroupInputs>({
    users_id: "",
    chatId: "",
  });
  const [botNames, setBotNames] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [telegramGroups, setTelegramGroups] = useState<TelegramGroup[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isAddBotModalOpen, setIsAddBotModalOpen] = useState(false);
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [isEditUserGroupModalOpen, setIsEditUserGroupModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const token = sessionStorage.getItem("token");
      if (!token) {
        setFeedback("Please log in to access this page.");
        toast.error("Please log in to access this page.");
        router.push("/");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch bot names
        const botsResponse = await fetch("/api/data/fetchbot", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!botsResponse.ok) {
          const errorText = await botsResponse.text();
          throw new Error(`Failed to fetch bot names: ${errorText}`);
        }
        const botsData = await botsResponse.json();
        const uniqueBotNames = Array.isArray(botsData)
          ? [...new Set(botsData.filter((name: unknown) => typeof name === 'string' && name.trim()))]
          : [];
        setBotNames(uniqueBotNames);

        // Fetch Telegram groups
        const telegramGroupsResponse = await fetch("/api/data/telegram_groups", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!telegramGroupsResponse.ok) {
          const errorText = await telegramGroupsResponse.text();
          throw new Error(`Failed to fetch Telegram groups: ${errorText}`);
        }
        const telegramGroupsData = await telegramGroupsResponse.json();
        const formattedTelegramGroups = Array.isArray(telegramGroupsData)
          ? telegramGroupsData
              .map((group: any) => ({
                id: Number(group.id),
                chatId: String(group.chatId),
                groupName: String(group.groupName || "Unnamed"),
              }))
              .sort((a, b) => a.groupName.localeCompare(b.groupName))
          : [];
        setTelegramGroups(formattedTelegramGroups);

        // Fetch users and statuses from report-filters
        const filtersResponse = await fetch("/api/data/report-filters", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!filtersResponse.ok) {
          const errorText = await filtersResponse.text();
          if (filtersResponse.status === 401) {
            setFeedback("Invalid or expired token. Please log in again.");
            toast.error("Invalid or expired token. Please log in again.");
            router.push("/");
            setIsLoading(false);
            return;
          }
          throw new Error(`Failed to fetch filter data: ${errorText}`);
        }
        const filtersData: FiltersData | { error: string } = await filtersResponse.json();

        if ('error' in filtersData) {
          setFeedback(`Failed to load filters: ${filtersData.error}`);
          setUsers([]);
          setStatuses([]);
          toast.error(`Failed to load filters: ${filtersData.error}`);
          return;
        }

        // Handle users
        const fetchedUsers = Array.isArray(filtersData.users)
          ? filtersData.users
              .filter(
                (user): user is User =>
                  user &&
                  typeof user === 'object' &&
                  'users_id' in user &&
                  'users_name' in user &&
                  typeof user.users_id === 'string' &&
                  typeof user.users_name === 'string'
              )
              .map((user) => ({
                users_id: user.users_id,
                users_name: user.users_name,
              }))
          : [];
        const uniqueUsers = fetchedUsers.filter(
          (user, index, self) =>
            user.users_id && self.findIndex((u) => u.users_id === user.users_id) === index
        );
        setUsers(uniqueUsers);

        if (uniqueUsers.length === 0) {
          setFeedback("No users available. Please check the user API or database.");
          toast.warn("No users available. Please check the user API or database.");
        }

        // Handle statuses
        const fetchedStatuses = Array.isArray(filtersData.statuses)
          ? filtersData.statuses.filter((s): s is string => typeof s === 'string' && s.trim() !== '')
          : [];
        setStatuses([...new Set(fetchedStatuses)]);

        if (uniqueUsers.length > 0) {
          setTelegramInputs((prev) => ({
            ...prev,
            users_id: String(uniqueUsers[0].users_id) || "",
            username: uniqueUsers[0].users_name || "",
            assigner: uniqueUsers[0].users_name || "",
          }));
          setUserGroupInputs((prev) => ({
            ...prev,
            users_id: String(uniqueUsers[0].users_id) || "",
          }));
        }

        // Fetch user-group associations
        const userGroupsResponse = await fetch("/api/data/user_groups", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!userGroupsResponse.ok) {
          const errorText = await userGroupsResponse.text();
          throw new Error(`Failed to fetch user-group associations: ${errorText}`);
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
      } catch (error) {
        console.error("AlertBotPage: Error fetching data:", error);
        setFeedback(
          error instanceof Error ? error.message : "Failed to load data. Please try again."
        );
        toast.error(
          error instanceof Error ? error.message : "Failed to load data. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Update chatId and username based on selected user
  useEffect(() => {
    const selectedUser = users.find((user) => user.users_id === telegramInputs.users_id);
    const selectedGroup = userGroups.find((group) => group.users_id === telegramInputs.users_id);
    setTelegramInputs((prev) => ({
      ...prev,
      username: selectedUser ? selectedUser.users_name : "",
      chatId: selectedGroup ? selectedGroup.chatId : "",
    }));
  }, [telegramInputs.users_id, users, userGroups]);

  const handleTelegramInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTelegramInputs((prev) => ({
      ...prev,
      [name]: value || "",
    }));
  };

  const handleGmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGmailInputs((prev) => ({
      ...prev,
      [name]: value || "",
    }));
  };

  const handleAddBotInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddBotInputs((prev) => ({
      ...prev,
      [name]: value || "",
    }));
  };

  const handleAddGroupInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddGroupInputs((prev) => ({
      ...prev,
      [name]: value || "",
    }));
  };

  const handleEditGroupInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditGroupInputs((prev) => ({
      ...prev,
      [name]: value || "",
    }));
  };

  const handleUserGroupInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUserGroupInputs((prev) => ({
      ...prev,
      [name]: value || "",
    }));
  };

  const handleEditUserGroupInputChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditUserGroupInputs((prev) => ({
      ...prev,
      [name]: value || "",
    }));
  };

  const handleCreateTicket = async () => {
    setFeedback(null);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to create a ticket.");
      }
      if (!telegramInputs.users_id.trim()) {
        throw new Error("User is required.");
      }
      if (!telegramInputs.status.trim()) {
        throw new Error("Status is required.");
      }
      if (!telegramInputs.stationId.trim()) {
        throw new Error("Station ID is required.");
      }
      if (!telegramInputs.stationName.trim()) {
        throw new Error("Station Name is required.");
      }
      if (!telegramInputs.ticketId.trim()) {
        throw new Error("Ticket ID is required.");
      }
      if (!telegramInputs.issueDescription.trim()) {
        throw new Error("Issue Description is required.");
      }
      if (telegramInputs.status === "Assigned" && !telegramInputs.assigner.trim()) {
        throw new Error("Assigner is required for Assigned status.");
      }

      const ticketPayload = {
        users_id: telegramInputs.users_id,
        status: telegramInputs.status,
        stationId: telegramInputs.stationId,
        stationName: telegramInputs.stationName,
        ticketId: telegramInputs.ticketId,
        issueDescription: telegramInputs.issueDescription,
        assigner: telegramInputs.assigner || null,
      };

      // Save ticket to database
      const ticketResponse = await fetch("/api/data/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ticketPayload),
      });
      const ticketData = await ticketResponse.json();
      if (!ticketResponse.ok) {
        throw new Error(ticketData.error || "Failed to create ticket");
      }

      // If chatId is provided, send Telegram alert
      if (telegramInputs.chatId.trim() && telegramInputs.botName.trim()) {
        const message = constructPlainTextTelegramMessage(telegramInputs);
        const alertPayload = {
          platform: "telegram",
          botName: telegramInputs.botName,
          username: telegramInputs.username,
          chatId: telegramInputs.chatId,
          message,
          assigner: telegramInputs.assigner,
        };
        const alertResponse = await fetch("/api/data/alert_bot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(alertPayload),
        });
        const alertData = await alertResponse.json();
        if (!alertResponse.ok) {
          throw new Error(alertData.error || "Failed to send Telegram alert");
        }
        setFeedback("Ticket created and Telegram alert sent successfully");
        toast.success("Ticket created and Telegram alert sent successfully");
      } else {
        setFeedback("Ticket created successfully (no Telegram alert sent due to missing group association)");
        toast.success("Ticket created successfully (no alert sent)");
      }

      // Reset form
      setTelegramInputs({
        botName: "",
        users_id: users.length > 0 ? String(users[0].users_id) : "",
        username: users.length > 0 ? users[0].users_name : "",
        chatId: "",
        status: "",
        assigner: users.length > 0 ? users[0].users_name : "",
        stationId: "",
        stationName: "",
        ticketId: "",
        issueDescription: "",
      });
    } catch (error) {
      console.error("Ticket creation error:", error);
      setFeedback(
        error instanceof Error ? error.message : "An error occurred while creating ticket"
      );
      toast.error(
        error instanceof Error ? error.message : "An error occurred while creating ticket"
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
        throw new Error("Email and Message are required for Gmail.");
      }
      const payload = {
        platform: "email",
        email: gmailInputs.email,
        message: gmailInputs.gmailMessage,
        subject: "New Ticket Alert",
      };
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
        throw new Error(data.error || "Failed to send email alert");
      }
      setFeedback(data.message || "Gmail alert sent successfully");
      toast.success(data.message || "Gmail alert sent successfully");
      setGmailInputs({ email: "", gmailMessage: "" });
    } catch (error) {
      console.error("Gmail submit error:", error);
      setFeedback(
        error instanceof Error ? error.message : "An error occurred while sending Gmail alert"
      );
      toast.error(
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
        throw new Error("Bot Name and Bot Token are required.");
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
      toast.success(data.message || "Bot added successfully");
      const botsResponse = await fetch("/api/data/fetchbot", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (botsResponse.ok) {
        const botsData = await botsResponse.json();
        setBotNames(
          Array.isArray(botsData)
            ? [...new Set(botsData.filter((name: unknown) => typeof name === 'string' && name.trim()))]
            : []
        );
      }
      setAddBotInputs({ botName: "", botToken: "" });
      setIsAddBotModalOpen(false);
    } catch (error) {
      console.error("Add bot error:", error);
      setFeedback(
        error instanceof Error ? error.message : "An error occurred while adding bot"
      );
      toast.error(
        error instanceof Error ? error.message : "An error occurred while adding bot"
      );
    }
  };

  const handleAddGroupSubmit = async () => {
    setFeedback(null);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to add a group.");
      }
      if (!addGroupInputs.chatId.trim() || !addGroupInputs.groupName.trim()) {
        throw new Error("Chat ID and Group Name are required.");
      }
      if (!/^-\d+$/.test(addGroupInputs.chatId)) {
        throw new Error("Invalid Telegram Chat ID format (e.g., -123456789 or -1002819438719).");
      }
      const response = await fetch("/api/data/telegram_groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId: addGroupInputs.chatId,
          groupName: addGroupInputs.groupName,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to add group");
      }
      setFeedback(data.message || "Group added successfully");
      toast.success(data.message || "Group added successfully");
      // Refresh groups
      const groupsResponse = await fetch("/api/data/telegram_groups", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();
        const formattedGroups = Array.isArray(groupsData)
          ? groupsData
              .map((group: any) => ({
                id: Number(group.id),
                chatId: String(group.chatId),
                groupName: String(group.groupName || "-"),
              }))
              .sort((a, b) => a.groupName.localeCompare(b.groupName))
          : [];
        setTelegramGroups(formattedGroups);
      }
      setAddGroupInputs({ chatId: "", groupName: "" });
      setIsAddGroupModalOpen(false);
    } catch (error) {
      console.error("Add group error:", error);
      setFeedback(
        error instanceof Error ? error.message : "An error occurred while adding group"
      );
      toast.error(
        error instanceof Error ? error.message : "An error occurred while adding group"
      );
    }
  };

  const handleEditGroupSubmit = async () => {
    setFeedback(null);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to edit a group.");
      }
      if (!editGroupInputs.chatId.trim() || !editGroupInputs.groupName.trim()) {
        throw new Error("Chat ID and Group Name are required.");
      }
      if (!/^-\d+$/.test(editGroupInputs.chatId)) {
        throw new Error("Invalid Telegram Chat ID format (e.g., -123456789 or -1002819438719).");
      }
      const response = await fetch("/api/data/telegram_groups", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editGroupInputs.id,
          chatId: editGroupInputs.chatId,
          groupName: editGroupInputs.groupName,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update group");
      }
      setFeedback(data.message || "Group updated successfully");
      toast.success(data.message || "Group updated successfully");
      // Refresh groups
      const groupsResponse = await fetch("/api/data/telegram_groups", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();
        const formattedGroups = Array.isArray(groupsData)
          ? groupsData
              .map((group: any) => ({
                id: Number(group.id),
                chatId: String(group.chatId),
                groupName: String(group.groupName || "-"),
              }))
              .sort((a, b) => a.groupName.localeCompare(b.groupName))
          : [];
        setTelegramGroups(formattedGroups);
      }
      setEditGroupInputs({ id: 0, chatId: "", groupName: "" });
      setIsEditGroupModalOpen(false);
    } catch (error) {
      console.error("Edit group error:", error);
      setFeedback(
        error instanceof Error ? error.message : "An error occurred while updating group"
      );
      toast.error(
        error instanceof Error ? error.message : "An error occurred while updating group"
      );
    }
  };

  const handleUserGroupSubmit = async () => {
    setFeedback(null);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to save user-group association.");
      }
      if (!userGroupInputs.users_id.trim() || !userGroupInputs.chatId.trim()) {
        throw new Error("User and Group are required.");
      }
      const selectedGroup = telegramGroups.find(
        (group) => group.chatId === userGroupInputs.chatId
      );
      if (!selectedGroup) {
        throw new Error("Invalid Telegram group selected.");
      }
      const payload = {
        users_id: userGroupInputs.users_id,
        chatId: userGroupInputs.chatId,
      };
      const response = await fetch("/api/data/user_groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save user-group association");
      }
      setFeedback(data.message || "User-group association saved successfully");
      toast.success(data.message || "User-group association saved successfully");
      // Refresh user groups
      const userGroupsResponse = await fetch("/api/data/user_groups", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (userGroupsResponse.ok) {
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
      }
      setUserGroupInputs({
        users_id: users.length > 0 ? String(users[0].users_id) : "",
        chatId: "",
      });
    } catch (error) {
      console.error("User group submit error:", error);
      setFeedback(
        error instanceof Error ? error.message : "An error occurred while saving user-group association"
      );
      toast.error(
        error instanceof Error ? error.message : "An error occurred while saving user-group association"
      );
    }
  };

  const handleDeleteGroup = async (chatId: string) => {
    if (!confirm(`Are you sure you want to delete the group with Chat ID ${chatId}?`)) {
      return;
    }
    setFeedback(null);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to delete a group.");
      }
      const response = await fetch("/api/data/telegram_groups", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chatId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete group");
      }
      setFeedback(data.message || "Group deleted successfully");
      toast.success(data.message || "Group deleted successfully");
      // Refresh groups
      const groupsResponse = await fetch("/api/data/telegram_groups", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();
        const formattedGroups = Array.isArray(groupsData)
          ? groupsData
              .map((group: any) => ({
                id: Number(group.id),
                chatId: String(group.chatId),
                groupName: String(group.groupName || "-"),
              }))
              .sort((a, b) => a.groupName.localeCompare(b.groupName))
          : [];
        setTelegramGroups(formattedGroups);
      }
    } catch (error) {
      console.error("Delete group error:", error);
      setFeedback(
        error instanceof Error ? error.message : "An error occurred while deleting group"
      );
      toast.error(
        error instanceof Error ? error.message : "An error occurred while deleting group"
      );
    }
  };

  const handleEditGroup = (group: TelegramGroup) => {
    setEditGroupInputs({
      id: group.id,
      chatId: group.chatId,
      groupName: group.groupName,
    });
    setIsEditGroupModalOpen(true);
  };

  const handleDeleteUserGroup = async (users_id: string, chatId: string) => {
    if (!confirm(`Are you sure you want to delete the association for user ID ${users_id} and Chat ID ${chatId}?`)) {
      return;
    }
    setFeedback(null);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to delete a user-group association.");
      }
      const response = await fetch("/api/data/user_groups", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ users_id, chatId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user-group association");
      }
      setFeedback(data.message || "User-group association deleted successfully");
      toast.success(data.message || "User-group association deleted successfully");
      // Refresh user groups
      const userGroupsResponse = await fetch("/api/data/user_groups", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (userGroupsResponse.ok) {
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
      }
    } catch (error) {
      console.error("Delete user-group error:", error);
      setFeedback(
        error instanceof Error ? error.message : "An error occurred while deleting user-group association"
      );
      toast.error(
        error instanceof Error ? error.message : "An error occurred while deleting user-group association"
      );
    }
  };

  const handleEditUserGroup = (group: UserGroup) => {
    setEditUserGroupInputs({
      users_id: group.users_id,
      chatId: group.chatId,
    });
    setIsEditUserGroupModalOpen(true);
  };

  const handleEditUserGroupSubmit = async () => {
    setFeedback(null);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to edit a user-group association.");
      }
      if (!editUserGroupInputs.users_id.trim() || !editUserGroupInputs.chatId.trim()) {
        throw new Error("User and Group are required.");
      }
      const selectedGroup = telegramGroups.find(
        (group) => group.chatId === editUserGroupInputs.chatId
      );
      if (!selectedGroup) {
        throw new Error("Invalid Telegram group selected.");
      }
      const payload = {
        users_id: editUserGroupInputs.users_id,
        chatId: editUserGroupInputs.chatId,
      };
      const response = await fetch("/api/data/user_groups", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update user-group association");
      }
      setFeedback(data.message || "User-group association updated successfully");
      toast.success(data.message || "User-group association updated successfully");
      // Refresh user groups
      const userGroupsResponse = await fetch("/api/data/user_groups", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (userGroupsResponse.ok) {
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
      }
      setEditUserGroupInputs({ users_id: "", chatId: "" });
      setIsEditUserGroupModalOpen(false);
    } catch (error) {
      console.error("Edit user-group error:", error);
      setFeedback(
        error instanceof Error ? error.message : "An error occurred while updating user-group association"
      );
      toast.error(
        error instanceof Error ? error.message : "An error occurred while updating user-group association"
      );
    }
  };

  const isCreateTicketDisabled = (
    !telegramInputs.users_id.trim() ||
    !telegramInputs.status.trim() ||
    !telegramInputs.stationId.trim() ||
    !telegramInputs.stationName.trim() ||
    !telegramInputs.ticketId.trim() ||
    !telegramInputs.issueDescription.trim() ||
    (telegramInputs.status === "Assigned" && !telegramInputs.assigner.trim()) ||
    users.length === 0
  );

  if (isLoading) {
    return (
      <HeaderResponsive>
        <LoadingScreen />
      </HeaderResponsive>
    );
  }

  if (feedback && feedback.includes("log in")) {
    return (
      <HeaderResponsive>
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
                <p className="mt-4 text-sm sm:text-lg font-semibold text-red-600">{feedback}</p>
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
          <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md border border-gray-200 w-full max-w-full">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Helpdesk Management</h1>
            {feedback && (
              <div
                className={`mb-4 p-3 rounded text-sm sm:text-base w-full max-w-full ${
                  feedback.includes("successfully") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {feedback}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8 w-full max-w-full">
              <button
                onClick={handleCreateTicket}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 w-full sm:w-auto text-sm sm:text-base"
                disabled={isCreateTicketDisabled}
                aria-label="Create Ticket"
              >
                <Bell size={16} />
                Create Ticket
              </button>
              <button
                onClick={() => setIsAddBotModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full sm:w-auto text-sm sm:text-base"
                aria-label="Add New Bot"
              >
                <Plus size={16} />
                Add Bot
              </button>
              <button
                onClick={() => setIsAddGroupModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full sm:w-auto text-sm sm:text-base"
                aria-label="Add New Group"
              >
                <Plus size={16} />
                Add Group
              </button>
            </div>

            <section className="mb-8 sm:mb-10">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">User-Group Association</h2>
              {users.length === 0 ? (
                <p className="text-sm sm:text-base text-red-600">
                  No users available. Please ensure users are added to the database.
                </p>
              ) : telegramGroups.length === 0 ? (
                <p className="text-sm sm:text-base text-red-600">
                  No Telegram groups available. Please add groups using the 'Add Group' button.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-full">
                    <div className="flex-1 min-w-0">
                      <select
                        name="users_id"
                        value={userGroupInputs.users_id || ""}
                        onChange={handleUserGroupInputChange}
                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Select User"
                      >
                        <option value="">Select User</option>
                        {users.map((user) => (
                          <option key={`usergroup-${user.users_id}`} value={user.users_id}>
                            {user.users_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 min-w-0">
                      <select
                        name="chatId"
                        value={userGroupInputs.chatId || ""}
                        onChange={handleUserGroupInputChange}
                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Select Group"
                      >
                        <option value="">Select Group</option>
                        {telegramGroups.map((group) => (
                          <option key={`group-${group.chatId}`} value={group.chatId}>
                            {group.groupName} ({group.chatId})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={handleUserGroupSubmit}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 w-full text-sm sm:text-base"
                        disabled={!userGroupInputs.users_id.trim() || !userGroupInputs.chatId.trim()}
                        aria-label="Save User-Group Association"
                      >
                        <Save size={16} />
                        Save Association
                      </button>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Associations</h3>
                    {userGroups.length > 0 ? (
                      <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
                        <table className="min-w-full text-sm sm:text-base text-gray-700">
                          <thead className="bg-gray-100 text-left">
                            <tr>
                              <th className="px-6 py-3 font-medium border-b border-gray-200">Username</th>
                              <th className="px-6 py-3 font-medium border-b border-gray-200">Group</th>
                              <th className="px-6 py-3 font-medium border-b border-gray-200">Chat ID</th>
                              <th className="px-6 py-3 font-medium border-b border-gray-200">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userGroups.map((group, index) => (
                              <tr
                                key={`group-${group.users_id}-${group.chatId}-${index}`}
                                className="transition-colors duration-200 hover:bg-blue-50 odd:bg-white even:bg-gray-50"
                              >
                                <td className="px-6 py-3 border-b border-gray-200">{group.username}</td>
                                <td className="px-6 py-3 border-b border-gray-200">{group.groupName}</td>
                                <td className="px-6 py-3 border-b border-gray-200">{group.chatId}</td>
                                <td className="px-6 py-3 border-b border-gray-200">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEditUserGroup(group)}
                                      className="text-blue-500 hover:text-blue-700"
                                      aria-label={`Edit association for ${group.username}`}
                                    >
                                      <Edit size={20} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUserGroup(group.users_id, group.chatId)}
                                      className="text-red-500 hover:text-red-700"
                                      aria-label={`Delete association for ${group.username}`}
                                    >
                                      <Trash2 size={20} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm sm:text-base">No user-group associations found.</p>
                    )}
                  </div>
                </>
              )}
            </section>

            <section className="mb-8 sm:mb-10">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Telegram Groups</h2>
              {telegramGroups.length === 0 ? (
                <p className="text-sm sm:text-base text-red-600">
                  No Telegram groups available. Please add groups using the 'Add Group' button.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
                  <table className="min-w-full text-sm sm:text-base text-gray-700">
                    <thead className="bg-gray-100 text-left">
                      <tr>
                        <th className="px-6 py-3 font-medium border-b border-gray-200">Group Name</th>
                        <th className="px-6 py-3 font-medium border-b border-gray-200">Chat ID</th>
                        <th className="px-6 py-3 font-medium border-b border-gray-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {telegramGroups.map((group, index) => (
                        <tr
                          key={`group-${group.chatId}-${index}`}
                          className="transition-colors duration-200 hover:bg-blue-50 odd:bg-white even:bg-gray-50"
                        >
                          <td className="px-6 py-3 border-b border-gray-200">{group.groupName}</td>
                          <td className="px-6 py-3 border-b border-gray-200">{group.chatId}</td>
                          <td className="px-6 py-3 border-b border-gray-200">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditGroup(group)}
                                className="text-blue-500 hover:text-blue-700"
                                aria-label={`Edit group ${group.groupName}`}
                              >
                                <Edit size={20} />
                              </button>
                              <button
                                onClick={() => handleDeleteGroup(group.chatId)}
                                className="text-red-500 hover:text-red-700"
                                aria-label={`Delete group ${group.groupName}`}
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="mb-8 sm:mb-10">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Create Ticket</h2>
              {users.length === 0 ? (
                <p className="text-sm sm:text-base text-red-600">
                  No users available. Cannot create tickets.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-full">
                  <div className="flex-1 min-w-0">
                    <select
                      name="botName"
                      value={telegramInputs.botName || ""}
                      onChange={handleTelegramInputChange}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Select Bot"
                    >
                      <option value="">Select Bot (optional for alert)</option>
                      {botNames.length > 0 ? (
                        botNames.map((botName, index) => (
                          <option key={`bot-${botName}-${index}`} value={botName}>
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
                      name="users_id"
                      value={telegramInputs.users_id || ""}
                      onChange={handleTelegramInputChange}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Select User for Ticket"
                    >
                      <option value="">Select User</option>
                      {users.map((user) => (
                        <option key={`ticket-user-${user.users_id}`} value={user.users_id}>
                          {user.users_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      name="stationId"
                      placeholder="Station ID"
                      value={telegramInputs.stationId || ""}
                      onChange={handleTelegramInputChange}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Station ID"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      name="stationName"
                      placeholder="Station Name"
                      value={telegramInputs.stationName || ""}
                      onChange={handleTelegramInputChange}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Station Name"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      name="ticketId"
                      placeholder="Ticket ID"
                      value={telegramInputs.ticketId || ""}
                      onChange={handleTelegramInputChange}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Ticket ID"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <select
                      name="status"
                      value={telegramInputs.status || ""}
                      onChange={handleTelegramInputChange}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Select Status"
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
                        value={telegramInputs.assigner || ""}
                        onChange={handleTelegramInputChange}
                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Select Assigner"
                      >
                        <option value="">Select Assigner</option>
                        {users.map((user) => (
                          <option key={`assigner-${user.users_id}`} value={user.users_name}>
                            {user.users_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="flex-1 min-w-0 col-span-1 sm:col-span-2 lg:col-span-4">
                    <input
                      type="text"
                      name="issueDescription"
                      placeholder="Issue Description"
                      value={telegramInputs.issueDescription || ""}
                      onChange={handleTelegramInputChange}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Issue Description"
                    />
                  </div>
                </div>
              )}
              <div className="mt-6">
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  Telegram Message Preview (To: Group {telegramGroups.find(g => g.chatId === telegramInputs.chatId)?.groupName || "No group associated"})
                </h3>
                <div
                  className="w-full max-w-full min-w-0"
                  dangerouslySetInnerHTML={{ __html: constructTelegramMessage(telegramInputs) }}
                />
              </div>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Gmail</h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-full">
                <div className="flex-1 min-w-0">
                  <input
                    type="email"
                    name="email"
                    placeholder="e.g., user@gmail.com"
                    value={gmailInputs.email || ""}
                    onChange={handleGmailInputChange}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Email Address"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    name="gmailMessage"
                    placeholder="Message"
                    value={gmailInputs.gmailMessage || ""}
                    onChange={handleGmailInputChange}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Gmail Message"
                  />
                </div>
                <button
                  onClick={handleGmailSubmit}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 w-full sm:w-auto text-sm sm:text-base"
                  disabled={!gmailInputs.email.trim() || !gmailInputs.gmailMessage.trim()}
                  aria-label="Send Gmail Alert"
                >
                  Send Immediately
                </button>
              </div>
              <div className="mt-6">
                <h3 className="text-base sm:text-lg font-semibold mb-2">Gmail Email Preview</h3>
                <div
                  className="w-full max-w-full min-w-0"
                  dangerouslySetInnerHTML={{ __html: constructGmailMessage(gmailInputs) }}
                />
              </div>
            </section>

            {isAddBotModalOpen && (
              <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-lg mx-4">
                  <h2 className="text-lg sm:text-xl font-semibold mb-6">Add New Telegram Bot</h2>
                  <div className="flex flex-col gap-4">
                    <input
                      type="text"
                      name="botName"
                      placeholder="Bot Name"
                      value={addBotInputs.botName || ''}
                      onChange={handleAddBotInputChange}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Bot Name"
                    />
                    <input
                      type="text"
                      name="botToken"
                      placeholder="Bot Token"
                      value={addBotInputs.botToken || ''}
                      onChange={handleAddBotInputChange}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Bot Token"
                    />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleAddBotSubmit}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-800 disabled:bg-gray-400 w-full sm:w-auto text-sm sm:text-base"
                        disabled={!(addBotInputs.botName.trim() && addBotInputs.botToken.trim())}
                        aria-label="Add Bot"
                      >
                        Add Bot
                      </button>
                      <button
                        onClick={() => setIsAddBotModalOpen(false)}
                        className="border border-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 w-full sm:w-auto text-sm sm:text-base"
                        aria-label="Cancel Add Bot"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isAddGroupModalOpen && (
              <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-lg mx-4">
                  <h2 className="text-lg sm:text-xl font-semibold mb-6">Add New Telegram Group</h2>
                  <div className="flex flex-col gap-4">
                    <input
                      type="text"
                      name="chatId"
                      placeholder="Chat ID (e.g., -123456789 or -1002819438719)"
                      value={addGroupInputs.chatId || ""}
                      onChange={handleAddGroupInputChange}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Chat ID"
                    />
                    <input
                      type="text"
                      name="groupName"
                      placeholder="Group Name"
                      value={addGroupInputs.groupName || ""}
                      onChange={handleAddGroupInputChange}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Group Name"
                    />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleAddGroupSubmit}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 w-full sm:w-auto text-sm sm:text-base"
                        disabled={!addGroupInputs.chatId.trim() || !addGroupInputs.groupName.trim()}
                        aria-label="Add Group"
                      >
                        Add Group
                      </button>
                      <button
                        onClick={() => setIsAddGroupModalOpen(false)}
                        className="border border-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 w-full sm:w-auto text-sm sm:text-base"
                        aria-label="Cancel Add Group"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isEditGroupModalOpen && (
              <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-lg mx-4">
                  <h2 className="text-lg sm:text-xl font-semibold mb-6">Edit Telegram Group</h2>
                  <div className="flex flex-col gap-4">
                    <input
                      type="text"
                      name="chatId"
                      placeholder="Chat ID (e.g., -123456789 or -1002819438719)"
                      value={editGroupInputs.chatId || ""}
                      onChange={handleEditGroupInputChange}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Chat ID"
                    />
                    <input
                      type="text"
                      name="groupName"
                      placeholder="Group Name"
                      value={editGroupInputs.groupName || ""}
                      onChange={handleEditGroupInputChange}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Group Name"
                    />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleEditGroupSubmit}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 w-full sm:w-auto text-sm sm:text-base"
                        disabled={!editGroupInputs.chatId.trim() || !editGroupInputs.groupName.trim()}
                        aria-label="Save Changes"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditGroupModalOpen(false)}
                        className="border border-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 w-full sm:w-auto text-sm sm:text-base"
                        aria-label="Cancel Edit Group"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isEditUserGroupModalOpen && (
              <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-lg mx-4">
                  <h2 className="text-lg sm:text-xl font-semibold mb-6">Edit User-Group Association</h2>
                  <div className="flex flex-col gap-4">
                    <select
                      name="users_id"
                      value={editUserGroupInputs.users_id || ""}
                      onChange={handleEditUserGroupInputChange}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Select User"
                    >
                      <option value="">Select User</option>
                      {users.map((user) => (
                        <option key={`edit-usergroup-${user.users_id}`} value={user.users_id}>
                          {user.users_name}
                        </option>
                      ))}
                    </select>
                    <select
                      name="chatId"
                      value={editUserGroupInputs.chatId || ""}
                      onChange={handleEditUserGroupInputChange}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Select Group"
                    >
                      <option value="">Select Group</option>
                      {telegramGroups.map((group) => (
                        <option key={`edit-group-${group.chatId}`} value={group.chatId}>
                          {group.groupName} ({group.chatId})
                        </option>
                      ))}
                    </select>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleEditUserGroupSubmit}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 w-full sm:w-auto text-sm sm:text-base"
                        disabled={!editUserGroupInputs.users_id.trim() || !editUserGroupInputs.chatId.trim()}
                        aria-label="Save Changes"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditUserGroupModalOpen(false)}
                        className="border border-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 w-full sm:w-auto text-sm sm:text-base"
                        aria-label="Cancel Edit User-Group"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </HeaderResponsive>
  );
};

export default AlertBotPage;