
"use client";
import React, { useState, useEffect, Suspense } from "react";
import { tbl_users_rules } from "@/app/backend/types/rules";
import { fetchUserRules } from "./action";
import Link from "next/link";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import HeaderWithSidebar from "@/app/frontend/components/common/Header/Headerwithsidebar";

interface UserRulesProps {
  isSidebarOpen: boolean;
}

interface Permissions {
  users: { add: boolean; edit: boolean; delete: boolean; list: boolean };
  tickets: { add: boolean; edit: boolean; delete: boolean; list: boolean; listAssign: boolean };
  stations: { add: boolean; edit: boolean; delete: boolean; list: boolean };
  userRules: { add: boolean; edit: boolean; delete: boolean; list: boolean };
}

export default function UserRules({ isSidebarOpen }: UserRulesProps) {
  const router = useRouter();
  const [rules, setRules] = useState<tbl_users_rules[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<tbl_users_rules | null>(null);
  const [editRuleName, setEditRuleName] = useState("");
  const [editPermissions, setEditPermissions] = useState<Permissions>({
    users: { add: false, edit: false, delete: false, list: false },
    tickets: { add: false, edit: false, delete: false, list: false, listAssign: false },
    stations: { add: false, edit: false, delete: false, list: false },
    userRules: { add: false, edit: false, delete: false, list: false },
  });
  const [filterId, setFilterId] = useState("");
  const [filterName, setFilterName] = useState("");
  const [showFilterInput, setShowFilterInput] = useState(false);
  const [filterIdError, setFilterIdError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState<Permissions | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          toast.error("Please log in to access this page.");
          router.push("/");
          return;
        }
        console.log("AdminUserRulesPage: Fetching with token:", token.substring(0, 10) + "...");

        const response = await fetch("/api/data/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const data = await response.json();
          if (data.error?.includes("Invalid token")) {
            toast.error("Session expired. Please log in again.");
            router.push("/");
            return;
          }
          throw new Error(data.error || "Failed to fetch permissions");
        }
        const { rules: rulesRaw } = await response.json();
        const userPermissions: Permissions = {
          users: {
            add: !!rulesRaw.add_user_status,
            edit: !!rulesRaw.edit_user_status,
            delete: !!rulesRaw.delete_user_status,
            list: !!rulesRaw.list_user_status,
          },
          tickets: {
            add: !!rulesRaw.add_ticket_status,
            edit: !!rulesRaw.edit_ticket_status,
            delete: !!rulesRaw.delete_ticket_status,
            list: !!rulesRaw.list_ticket_status,
            listAssign: !!rulesRaw.list_ticket_assign,
          },
          stations: {
            add: !!rulesRaw.add_station,
            edit: !!rulesRaw.edit_station,
            delete: !!rulesRaw.delete_station,
            list: !!rulesRaw.list_station,
          },
          userRules: {
            add: !!rulesRaw.add_user_rules,
            edit: !!rulesRaw.edit_user_rules,
            delete: !!rulesRaw.delete_user_rules,
            list: !!rulesRaw.list_user_rules,
          },
        };
        setPermissions(userPermissions);
        console.log("AdminUserRulesPage: Permissions:", JSON.stringify(userPermissions, null, 2));

        if (!userPermissions.userRules.list) {
          toast.error("You do not have permission to view user rules.");
          router.push("/");
          return;
        }

        const { rules, error } = await fetchUserRules();
        console.log("AdminUserRulesPage: Fetched rules:", JSON.stringify(rules, null, 2));
        setRules(rules || []);
        setError(error);
        if (error) toast.error(error);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router]);

  const mapRuleToPermissions = (rule: tbl_users_rules): Permissions => ({
    users: {
      add: !!rule.add_user_status,
      edit: !!rule.edit_user_status,
      delete: !!rule.delete_user_status,
      list: !!rule.list_user_status,
    },
    tickets: {
      add: !!rule.add_ticket_status,
      edit: !!rule.edit_ticket_status,
      delete: !!rule.delete_ticket_status,
      list: !!rule.list_ticket_status,
      listAssign: !!rule.list_ticket_assign,
    },
    stations: {
      add: !!rule.add_station,
      edit: !!rule.edit_station,
      delete: !!rule.delete_station,
      list: !!rule.list_station,
    },
    userRules: {
      add: !!rule.add_user_rules,
      edit: !!rule.edit_user_rules,
      delete: !!rule.delete_user_rules,
      list: !!rule.list_user_rules,
    },
  });

  const handleEdit = (rule: tbl_users_rules) => {
    if (!permissions?.userRules.edit) {
      toast.error("You do not have permission to edit user rules.");
      return;
    }
    try {
      setSelectedRule(rule);
      setEditRuleName(rule.rules_name);
      setEditPermissions(mapRuleToPermissions(rule));
      setIsEditModalOpen(true);
    } catch (err) {
      setError("Failed to open edit modal.");
      toast.error("Failed to open edit modal.");
    }
  };

  type PermissionKey =
    | keyof Permissions["users"]
    | keyof Permissions["tickets"]
    | keyof Permissions["stations"]
    | keyof Permissions["userRules"];

  const handlePermissionChange = (
    category: keyof Permissions,
    permission: PermissionKey
  ) => {
    setEditPermissions((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [permission]: !prev[category][permission as keyof (typeof prev)[typeof category]],
      },
    }));
  };

  const handleEditSubmit = async () => {
    if (!selectedRule || !permissions?.userRules.edit) {
      toast.error("You do not have permission to edit user rules.");
      return;
    }
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to access this page.");
        router.push("/");
        return;
      }
      const response = await fetch(`/api/data/roles/${selectedRule.rules_id}/edit`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rules_name: editRuleName,
          permissions: editPermissions,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setRules(
          rules.map((r) =>
            r.rules_id === selectedRule.rules_id
              ? {
                  ...r,
                  rules_name: editRuleName,
                  add_user_status: editPermissions.users.add ? 1 : 0,
                  edit_user_status: editPermissions.users.edit ? 1 : 0,
                  delete_user_status: editPermissions.users.delete ? 1 : 0,
                  list_user_status: editPermissions.users.list ? 1 : 0,
                  add_ticket_status: editPermissions.tickets.add ? 1 : 0,
                  edit_ticket_status: editPermissions.tickets.edit ? 1 : 0,
                  delete_ticket_status: editPermissions.tickets.delete ? 1 : 0,
                  list_ticket_status: editPermissions.tickets.list ? 1 : 0,
                  list_ticket_assign: editPermissions.tickets.listAssign ? 1 : 0,
                  add_user_rules: editPermissions.userRules.add ? 1 : 0,
                  edit_user_rules: editPermissions.userRules.edit ? 1 : 0,
                  delete_user_rules: editPermissions.userRules.delete ? 1 : 0,
                  list_user_rules: editPermissions.userRules.list ? 1 : 0,
                  add_station: editPermissions.stations.add ? 1 : 0,
                  edit_station: editPermissions.stations.edit ? 1 : 0,
                  delete_station: editPermissions.stations.delete ? 1 : 0,
                  list_station: editPermissions.stations.list ? 1 : 0,
                }
              : r
          )
        );
        setIsEditModalOpen(false);
        toast.success(`Rule ${editRuleName} updated successfully`);
      } else {
        setError(data.error || "Failed to update rule");
        toast.error(data.error || "Failed to update rule");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleDelete = async () => {
    if (!selectedRule || !permissions?.userRules.delete) {
      toast.error("You do not have permission to delete user rules.");
      return;
    }
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to access this page.");
        router.push("/");
        return;
      }
      const response = await fetch(`/api/data/roles/${selectedRule.rules_id}/delete`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setRules(rules.filter((r) => r.rules_id !== selectedRule.rules_id));
        setIsDeleteModalOpen(false);
        toast.success(`Rule ${selectedRule.rules_name} deleted successfully`);
      } else {
        setError(data.error || "Failed to delete rule");
        toast.error(data.error || "Failed to delete rule");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value && !/^\d+$/.test(value)) {
      setFilterIdError("Rule ID must be numeric");
    } else {
      setFilterIdError(null);
      setFilterId(value);
    }
    console.log("AdminUserRulesPage: Filter ID updated:", value);
  };

  const handleFilterNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterName(value);
    console.log("AdminUserRulesPage: Filter Name updated:", value);
  };

  const handleFilterToggle = () => {
    setShowFilterInput((prev) => !prev);
    if (showFilterInput) {
      setFilterId("");
      setFilterName("");
      setFilterIdError(null);
    }
    console.log("AdminUserRulesPage: Filter input toggled:", !showFilterInput);
  };

  const handleClearFilter = () => {
    setFilterId("");
    setFilterName("");
    setFilterIdError(null);
    setShowFilterInput(false);
    console.log("AdminUserRulesPage: Filters cleared");
  };

  const filteredRules = rules.filter((rule) => {
    const matchesId = filterId
      ? rule.rules_id.toString().includes(filterId)
      : true;
    const matchesName = filterName
      ? rule.rules_name.toLowerCase().includes(filterName.toLowerCase())
      : true;
    return matchesId && matchesName;
  });

  console.log("AdminUserRulesPage: Filtered rules:", JSON.stringify(filteredRules, null, 2));

  const MainContent = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gray-100">
      <HeaderWithSidebar />
      <div className="flex">
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 min-h-screen transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "sm:ml-64" : "sm:ml-0"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <MainContent>
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
            <span className="text-lg font-medium text-gray-600">
              Loading rules...
            </span>
          </div>
        </div>
      </MainContent>
    );
  }

  if (error) {
    return (
      <MainContent>
        <div className="flex items-center justify-center h-full">
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
            <p className="mt-4 text-lg font-semibold text-red-600">{error}</p>
          </div>
        </div>
      </MainContent>
    );
  }

  if (!permissions?.userRules.list) {
    return null; // Redirect handles this
  }

  return (
    <MainContent>
      <div className="container mx-auto max-w-5xl">
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="mb-4 sm:mb-6 flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Rules
            </h1>
            {permissions.userRules.add && (
              <Link href="/pages/admin/user_rules/add_rules">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  aria-label="Add new rule"
                >
                  Add Rules
                </button>
              </Link>
            )}
          </div>
          {permissions.userRules.list && (
            <>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1 sm:flex-none">
                  <button
                    onClick={handleFilterToggle}
                    className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 flex-1 sm:w-32 text-sm sm:text-base flex items-center justify-center"
                    aria-label="Toggle filter input"
                  >
                    <span className="mr-2">🔍</span> Filter
                  </button>
                  {showFilterInput && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div>
                        <input
                          type="text"
                          value={filterId}
                          onChange={handleFilterChange}
                          placeholder="Enter Rule ID"
                          className="w-full sm:w-40 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          aria-label="Filter by Rule ID"
                        />
                        {filterIdError && (
                          <p className="text-red-600 text-xs mt-1">
                            {filterIdError}
                          </p>
                        )}
                      </div>
                      <input
                        type="text"
                        value={filterName}
                        onChange={handleFilterNameChange}
                        placeholder="Enter Rule Name"
                        className="w-full sm:w-40 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        aria-label="Filter by Rule Name"
                      />
                      <button
                        onClick={handleClearFilter}
                        className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
                        aria-label="Reset filter"
                      >
                        Reset Filter
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <Suspense
                fallback={
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
                      <span className="text-lg font-medium text-gray-600">
                        Loading rules...
                      </span>
                    </div>
                  </div>
                }
              >
                {filteredRules.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md w-full">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="mt-4 text-lg font-semibold text-gray-600">
                        No Rules found.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table
                      className="w-full text-sm border-collapse"
                      role="table"
                      aria-label="User Rules"
                    >
                      <thead>
                        <tr className="bg-gray-200 text-gray-800 font-semibold rounded-t-lg sticky top-0">
                          <th
                            scope="col"
                            className="text-left p-3 sm:p-4 first:rounded-tl-lg"
                          >
                            Rule ID
                          </th>
                          <th scope="col" className="text-left p-3 sm:p-4">
                            Rule Name
                          </th>
                          {(permissions.userRules.edit || permissions.userRules.delete) && (
                            <th
                              scope="col"
                              className="text-left p-3 sm:p-4 last:rounded-tr-lg"
                            >
                              Actions
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRules.map((row, index) => (
                          <tr
                            key={row.rules_id}
                            className={`border-b border-gray-200 hover:bg-blue-50 transition-all duration-150 ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }`}
                          >
                            <td className="p-3 sm:p-4 text-gray-700">
                              {row.rules_id}
                            </td>
                            <td className="p-3 sm:p-4 text-gray-700">
                              {row.rules_name}
                            </td>
                            {(permissions.userRules.edit || permissions.userRules.delete) && (
                              <td className="p-3 sm:p-4 text-gray-700">
                                {permissions.userRules.edit && (
                                  <button
                                    onClick={() => handleEdit(row)}
                                    className="text-blue-600 hover:text-blue-800 mr-4"
                                    aria-label={`Edit rule ${row.rules_name}`}
                                  >
                                    <svg
                                      className="w-8 h-8 p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                      />
                                    </svg>
                                  </button>
                                )}
                                {permissions.userRules.delete && (
                                  <button
                                    onClick={() => {
                                      setSelectedRule(row);
                                      setIsDeleteModalOpen(true);
                                    }}
                                    className="text-red-600 hover:text-red-800"
                                    aria-label={`Delete rule ${row.rules_name}`}
                                  >
                                    <svg
                                      className="w-8 h-8 p-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </button>
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Suspense>
            </>
          )}
        </div>
      </div>

      {/* Edit Rule Modal */}
      {permissions?.userRules.edit && (
        <Transition show={isEditModalOpen} as={React.Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-50 overflow-y-auto"
            onClose={() => setIsEditModalOpen(false)}
          >
            <div className="fixed inset-0 bg-white-100 bg-opacity-50 backdrop-blur-sm" />
            <div className="flex items-center justify-center min-h-screen px-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-500"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full relative z-50">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold text-gray-900"
                  >
                    Edit Rule
                  </Dialog.Title>
                  <div className="mt-4">
                    <label
                      htmlFor="ruleName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Rule Name
                    </label>
                    <input
                      id="ruleName"
                      type="text"
                      value={editRuleName}
                      onChange={(e) => setEditRuleName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter rule name"
                    />
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700">
                      Permissions
                    </h4>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      {/* Users Permissions */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-600">
                          Users
                        </h5>
                        {(["add", "edit", "delete", "list"] as Array<keyof Permissions["users"]>).map(
                          (perm) => (
                            <div key={`users-${perm}`} className="flex items-center mt-1">
                              <input
                                type="checkbox"
                                id={`users-${perm}`}
                                checked={editPermissions.users[perm]}
                                onChange={() => handlePermissionChange("users", perm)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label
                                htmlFor={`users-${perm}`}
                                className="ml-2 text-sm text-gray-600 capitalize"
                              >
                                {perm}
                              </label>
                            </div>
                          )
                        )}
                      </div>
                      {/* Tickets Permissions */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-600">
                          Tickets
                        </h5>
                        {(["add", "edit", "delete", "list", "listAssign"] as Array<
                          keyof Permissions["tickets"]
                        >).map((perm) => (
                          <div key={`tickets-${perm}`} className="flex items-center mt-1">
                            <input
                              type="checkbox"
                              id={`tickets-${perm}`}
                              checked={editPermissions.tickets[perm]}
                              onChange={() => handlePermissionChange("tickets", perm)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label
                                htmlFor={`tickets-${perm}`}
                                className="ml-2 text-sm text-gray-600 capitalize"
                              >
                                {perm === "listAssign" ? "List Assign" : perm}
                              </label>
                            </div>
                          ))}
                        </div>
                        {/* Stations Permissions */}
                        <div>
                          <h5 className="text-sm font-semibold text-gray-600">
                            Stations
                          </h5>
                          {(["add", "edit", "delete", "list"] as Array<keyof Permissions["stations"]>).map(
                            (perm) => (
                              <div key={`stations-${perm}`} className="flex items-center mt-1">
                                <input
                                  type="checkbox"
                                  id={`stations-${perm}`}
                                  checked={editPermissions.stations[perm]}
                                  onChange={() => handlePermissionChange("stations", perm)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                  htmlFor={`stations-${perm}`}
                                  className="ml-2 text-sm text-gray-600 capitalize"
                                >
                                  {perm}
                                </label>
                              </div>
                            )
                          )}
                        </div>
                        {/* UserRules Permissions */}
                        <div>
                          <h5 className="text-sm font-semibold text-gray-600">
                            User Rules
                          </h5>
                          {(["add", "edit", "delete", "list"] as Array<keyof Permissions["userRules"]>).map(
                            (perm) => (
                              <div key={`userRules-${perm}`} className="flex items-center mt-1">
                                <input
                                  type="checkbox"
                                  id={`userRules-${perm}`}
                                  checked={editPermissions.userRules[perm]}
                                  onChange={() => handlePermissionChange("userRules", perm)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                  htmlFor={`userRules-${perm}`}
                                  className="ml-2 text-sm text-gray-600 capitalize"
                                >
                                  {perm}
                                </label>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleEditSubmit}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        disabled={!editRuleName.trim()}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </Transition.Child>
              </div>
            </Dialog>
          </Transition>
        )}

        {/* Delete Confirmation Modal */}
        {permissions?.userRules.delete && (
          <Transition show={isDeleteModalOpen} as={React.Fragment}>
            <Dialog
              as="div"
              className="fixed inset-0 z-50 overflow-y-auto"
              onClose={() => setIsDeleteModalOpen(false)}
            >
              <div className="fixed inset-0 bg-white-100 bg-opacity-50 backdrop-blur-sm" />
              <div className="flex items-center justify-center min-h-screen px-4">
                <Transition.Child
                  as={React.Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative z-50">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold text-gray-900"
                    >
                      Delete Rule
                    </Dialog.Title>
                    <p className="mt-2 text-sm text-gray-600">
                      Are you sure you want to delete the rule "
                      <span className="font-medium">{selectedRule?.rules_name}</span>"? This action cannot be undone.
                    </p>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDelete}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </Transition.Child>
              </div>
            </Dialog>
          </Transition>
        )}
      </MainContent>
    );
  }
