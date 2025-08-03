
"use client";

import React, { useState, useEffect, Fragment } from "react";
import { tbl_users_rules } from "@/app/backend/types/rules";
import { fetchUserRules } from "./action";
import Link from "next/link";
import { Dialog, Transition } from "@headlessui/react";
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import LoadingScreen from "@/app/frontend/components/ui/loadingScreen";
import HeaderWithSidebar from "@/app/frontend/components/common/Header/Headerwithsidebar";
import HeaderResponsive from "@/app/frontend/components/common/Header/headerResponsive";

interface Permissions {
  users: { add: boolean; edit: boolean; delete: boolean; list: boolean };
  tickets: {
    add: boolean;
    edit: boolean;
    delete: boolean;
    list: boolean;
    listAssign: boolean;
  };
  stations: { add: boolean; edit: boolean; delete: boolean; list: boolean };
  userRules: { add: boolean; edit: boolean; delete: boolean; list: boolean };
}

export default function UserRules() {
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
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
 



  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please log in.");
          toast.error("No authentication token found. Please log in.");
          setTimeout(() => router.push("/"), 2000);
          return;
        }
        console.log("UserRules: Fetching with token:", token.substring(0, 10) + "...");

        const response = await fetch("/api/data/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch permissions");
        }
        const { rules: rulesRaw } = await response.json();
        const userPermissions: Permissions = {
          users: {
            add: !!rulesRaw?.add_user_status,
            edit: !!rulesRaw?.edit_user_status,
            delete: !!rulesRaw?.delete_user_status,
            list: !!rulesRaw?.list_user_status,
          },
          tickets: {
            add: !!rulesRaw?.add_ticket_status,
            edit: !!rulesRaw?.edit_ticket_status,
            delete: !!rulesRaw?.delete_ticket_status,
            list: !!rulesRaw?.list_ticket_status,
            listAssign: !!rulesRaw?.list_ticket_assign,
          },
          stations: {
            add: !!rulesRaw?.add_station,
            edit: !!rulesRaw?.edit_station,
            delete: !!rulesRaw?.delete_station,
            list: !!rulesRaw?.list_station,
          },
          userRules: {
            add: !!rulesRaw?.add_user_rules,
            edit: !!rulesRaw?.edit_user_rules,
            delete: !!rulesRaw?.delete_user_rules,
            list: !!rulesRaw?.list_user_rules,
          },
        };
        setPermissions(userPermissions);
        console.log("UserRules: Permissions:", JSON.stringify(userPermissions, null, 2));

        if (!userPermissions.userRules.list) {
          setError("You do not have permission to view user rules.");
          toast.error("You do not have permission to view user rules.");
          return;
        }

        const { rules, error } = await fetchUserRules();
        console.log("UserRules: Fetched rules:", JSON.stringify(rules, null, 2));
        setRules(rules || []);
        if (error) {
          setError(error);
          toast.error(error);
        }
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
    if (!rule?.rules_id || !rule?.rules_name) {
      console.error("UserRules: Invalid rule data:", rule);
      toast.error("Invalid rule data. Please try again.");
      return;
    }
    setSelectedRule(rule);
    setEditRuleName(rule.rules_name || ""); // Ensure non-empty string
    setEditPermissions(mapRuleToPermissions(rule));
    setIsEditModalOpen(true);
    console.log("UserRules: Opening edit modal for rule:", rule.rules_id);
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
    if (!selectedRule.rules_id || !editRuleName.trim()) {
      toast.error("Rule ID or name is missing.");
      return;
    }
    setIsActionLoading(true);
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
      console.log("UserRules: Edit response:", JSON.stringify(data, null, 2));
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
        setSelectedRule(null);
        setEditRuleName("");
        setEditPermissions({
          users: { add: false, edit: false, delete: false, list: false },
          tickets: { add: false, edit: false, delete: false, list: false, listAssign: false },
          stations: { add: false, edit: false, delete: false, list: false },
          userRules: { add: false, edit: false, delete: false, list: false },
        });
        toast.success(`Rule ${editRuleName} updated successfully`, {
          duration: 2000,
          position: "top-right",
        });
      } else {
        throw new Error(data.error || "Failed to update rule");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("UserRules: Edit error:", errorMsg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRule || !permissions?.userRules.delete) {
      toast.error("You do not have permission to delete user rules.");
      return;
    }
    if (!selectedRule.rules_id) {
      toast.error("Invalid rule ID.");
      return;
    }
    setIsActionLoading(true);
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
      console.log("UserRules: Delete response:", JSON.stringify(data, null, 2));
      if (response.ok) {
        setRules(rules.filter((r) => r.rules_id !== selectedRule.rules_id));
        setIsDeleteModalOpen(false);
        setSelectedRule(null);
        toast.success(`Rule ${selectedRule.rules_name} deleted successfully`, {
          duration: 2000,
          position: "top-right",
        });
      } else {
        throw new Error(data.error || "Failed to delete rule");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("UserRules: Delete error:", errorMsg);
    } finally {
      setIsActionLoading(false);
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
    console.log("UserRules: Filter ID updated:", value);
  };

  const handleFilterNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterName(value);
    console.log("UserRules: Filter Name updated:", value);
  };

  const handleFilterToggle = () => {
    setShowFilterInput((prev) => !prev);
    if (showFilterInput) {
      setFilterId("");
      setFilterName("");
      setFilterIdError(null);
    }
    console.log("UserRules: Filter input toggled:", !showFilterInput);
  };

  const handleClearFilter = () => {
    setFilterId("");
    setFilterName("");
    setFilterIdError(null);
    setShowFilterInput(false);
    console.log("UserRules: Filters cleared");
  };

  const filteredRules = rules.filter((rule) => {
    const matchesId = filterId ? rule.rules_id.toString().includes(filterId) : true;
    const matchesName = filterName
      ? rule.rules_name.toLowerCase().includes(filterName.toLowerCase())
      : true;
    return matchesId && matchesName;
  });

  if (isLoading) {
    return (
      <HeaderResponsive>
        <LoadingScreen></LoadingScreen>
      </HeaderResponsive>
    );
  }

  if (!permissions?.userRules.list || error) {
    return (
      <HeaderResponsive>
        <div className="flex w-full">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
            <Toaster position="top-right" />
            <div className="flex items-center justify-center py-8">
              <div className="bg-white p-6 rounded-md shadow-md text-center max-w-md w-full border border-gray-200">
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
                <p className="mt-4 text-lg font-semibold text-red-600">
                  {error || "You do not have permission to view user rules."}
                </p>
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
          <Toaster position="top-right" />
          <div className="flex justify-center items-center min-h-[calc(100vh-128px)]">
            <div className="bg-white p-4 sm:p-6 rounded-md shadow-md w-full max-w-md sm:max-w-full border border-gray-200">
              <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
                  Rules
                </h1>
                {permissions.userRules.add && (
                  <Link href="/pages/admin/user_rules/add_rules">
                    <button
                      className="w-full sm:w-32 max-w-full min-w-0 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm sm:text-base pointer-events-auto"
                      aria-label="Add new rule"
                    >
                      Add Rules
                    </button>
                  </Link>
                )}
              </div>
              {permissions.userRules.list && (
                <div className="flex flex-col gap-4 mb-4 sm:mb-6 w-full max-w-full">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* <button
                      onClick={handleFilterToggle}
                      className="w-full sm:w-32 max-w-full min-w-0 bg-white border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 text-sm sm:text-base flex items-center justify-center pointer-events-auto"
                      aria-label="Toggle filter input"
                    >
                      <span className="mr-2">🔍</span> Filter
                    </button> */}
                    {showFilterInput && (
                      <div className="flex flex-col sm:flex-row gap-2 w-full max-w-full min-w-0">
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={filterId}
                            onChange={handleFilterChange}
                            placeholder="Enter Rule ID"
                            className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Filter by Rule ID"
                          />
                          {filterIdError && (
                            <p className="text-red-600 text-xs mt-1">{filterIdError}</p>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={filterName}
                            onChange={handleFilterNameChange}
                            placeholder="Enter Rule Name"
                            className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Filter by Rule Name"
                          />
                        </div>
                        <button
                          onClick={handleClearFilter}
                          className="w-full sm:w-32 max-w-full min-w-0 bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 text-sm sm:text-base pointer-events-auto"
                          aria-label="Reset filter"
                        >
                          Reset Filter
                        </button>
                      </div>
                    )}
                  </div>
                  {filteredRules.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="bg-white p-6 rounded-md shadow-md text-center max-w-md w-full border border-gray-200">
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
                        <p className="mt-4 text-lg font-semibold text-gray-600">No Rules found.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto w-full max-w-full min-w-0">
                      <table
                        className="w-full max-w-full min-w-0 text-sm table-auto border-collapse"
                        role="table"
                        aria-label="User Rules"
                      >
                        <thead>
                          <tr className="bg-gray-100 text-gray-800 font-semibold rounded-md">
                            <th scope="col" className="text-left p-2 sm:p-3 min-w-[60px]">
                              No
                            </th>
                            <th scope="col" className="text-left p-2 sm:p-3 min-w-[120px]">
                              Rule Name
                            </th>
                            {(permissions?.userRules?.edit || permissions?.userRules?.delete) && (
                              <th scope="col" className="text-left p-2 sm:p-3 min-w-[80px]">
                                Actions
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRules.map((row, index) => (
                            <tr
                              key={row.rules_id}
                              className={`border-b border-gray-200 hover:bg-gray-50 transition-all duration-150 ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }`}
                            >
                              <td className="p-2 sm:p-3 text-gray-700 min-w-0" scope="row">
                                {index + 1}
                              </td>
                              <td className="p-2 sm:p-3 text-gray-700 min-w-0">{row.rules_name}</td>
                              {(permissions?.userRules?.edit || permissions?.userRules?.delete) && (
                                <td className="p-2 sm:p-3 text-gray-700 min-w-0 flex gap-2">
                                  {permissions?.userRules?.edit && (
                                    <button
                                      onClick={() => {
                                        handleEdit(row);
                                        console.log("UserRules: Edit button clicked for rule:", row.rules_id);
                                      }}
                                      className="w-8 h-8 p-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors pointer-events-auto"
                                      aria-label={`Edit rule ${row.rules_name}`}
                                      disabled={isActionLoading}
                                    >
                                      <svg
                                        className="w-6 h-6"
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
                                  {permissions?.userRules?.delete && (
                                    <button
                                      onClick={() => {
                                        setSelectedRule(row);
                                        setIsDeleteModalOpen(true);
                                        console.log("UserRules: Delete button clicked for rule:", row.rules_id);
                                      }}
                                      className="w-8 h-8 p-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors pointer-events-auto"
                                      aria-label={`Delete rule ${row.rules_name}`}
                                      disabled={isActionLoading}
                                    >
                                      <svg
                                        className="w-6 h-6"
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
                </div>
              )}
            </div>
          </div>
          {/* Edit Rule Modal */}
          {permissions?.userRules.edit && (
            <Transition show={isEditModalOpen} as={Fragment}>
              <Dialog
                as="div"
                className="fixed inset-0 z-10 overflow-y-auto"
                onClose={() => {
                  setIsEditModalOpen(false);
                  setSelectedRule(null);
                  setEditRuleName("");
                  setEditPermissions({
                    users: { add: false, edit: false, delete: false, list: false },
                    tickets: { add: false, edit: false, delete: false, list: false, listAssign: false },
                    stations: { add: false, edit: false, delete: false, list: false },
                    userRules: { add: false, edit: false, delete: false, list: false },
                  });
                  console.log("UserRules: Edit modal closed");
                }}
              >
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10" />
                </Transition.Child>
                <div className="flex items-center justify-center min-h-screen p-4">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="bg-white rounded-md shadow-md p-6 max-w-md w-full border border-gray-200 z-20 relative">
                      <Dialog.Title as="h3" className="text-lg font-semibold text-gray-800">
                        Edit Rule
                      </Dialog.Title>
                      <div className="mt-4">
                        <label htmlFor="ruleName" className="block text-sm font-medium text-gray-700">
                          Rule Name
                        </label>
                        <input
                          id="ruleName"
                          type="text"
                          value={editRuleName}
                          onChange={(e) => setEditRuleName(e.target.value)}
                          className="mt-1 block w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter rule name"
                          aria-label="Rule Name"
                        />
                      </div>
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-700">Permissions</h4>
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {/* Users Permissions */}
                          <div>
                            <h5 className="text-sm font-semibold text-gray-600">Users</h5>
                            {(["add", "edit", "delete", "list"] as Array<keyof Permissions["users"]>).map(
                              (perm) => (
                                <div key={`users-${perm}`} className="flex items-center mt-1">
                                  <input
                                    type="checkbox"
                                    id={`users-${perm}`}
                                    checked={editPermissions.users[perm]}
                                    onChange={() => handlePermissionChange("users", perm)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    aria-label={`Users ${perm} permission`}
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
                            <h5 className="text-sm font-semibold text-gray-600">Tickets</h5>
                            {(
                              ["add", "edit", "delete", "list", "listAssign"] as Array<
                                keyof Permissions["tickets"]
                              >
                            ).map((perm) => (
                              <div key={`tickets-${perm}`} className="flex items-center mt-1">
                                <input
                                  type="checkbox"
                                  id={`tickets-${perm}`}
                                  checked={editPermissions.tickets[perm]}
                                  onChange={() => handlePermissionChange("tickets", perm)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  aria-label={`Tickets ${perm === "listAssign" ? "List Assign" : perm} permission`}
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
                            <h5 className="text-sm font-semibold text-gray-600">Stations</h5>
                            {(["add", "edit", "delete", "list"] as Array<keyof Permissions["stations"]>).map(
                              (perm) => (
                                <div key={`stations-${perm}`} className="flex items-center mt-1">
                                  <input
                                    type="checkbox"
                                    id={`stations-${perm}`}
                                    checked={editPermissions.stations[perm]}
                                    onChange={() => handlePermissionChange("stations", perm)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    aria-label={`Stations ${perm} permission`}
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
                            <h5 className="text-sm font-semibold text-gray-600">User Rules</h5>
                            {(["add", "edit", "delete", "list"] as Array<keyof Permissions["userRules"]>).map(
                              (perm) => (
                                <div key={`userRules-${perm}`} className="flex items-center mt-1">
                                  <input
                                    type="checkbox"
                                    id={`userRules-${perm}`}
                                    checked={editPermissions.userRules[perm]}
                                    onChange={() => handlePermissionChange("userRules", perm)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    aria-label={`User Rules ${perm} permission`}
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
                          onClick={() => {
                            setIsEditModalOpen(false);
                            setSelectedRule(null);
                            setEditRuleName("");
                            setEditPermissions({
                              users: { add: false, edit: false, delete: false, list: false },
                              tickets: { add: false, edit: false, delete: false, list: false, listAssign: false },
                              stations: { add: false, edit: false, delete: false, list: false },
                              userRules: { add: false, edit: false, delete: false, list: false },
                            });
                            console.log("UserRules: Edit modal Cancel clicked");
                          }}
                          className="w-full sm:w-32 max-w-full min-w-0 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:bg-gray-100 pointer-events-auto"
                          aria-label="Cancel edit"
                          disabled={isActionLoading}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            console.log("UserRules: Edit modal Save clicked");
                            handleEditSubmit();
                          }}
                          className="w-full sm:w-32 max-w-full min-w-0 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 pointer-events-auto"
                          aria-label="Save rule"
                          disabled={isActionLoading || !editRuleName.trim()}
                        >
                          {isActionLoading ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </Dialog>
            </Transition>
          )}
          {/* Delete Confirmation Modal */}
          {permissions?.userRules.delete && (
            <Transition show={isDeleteModalOpen} as={Fragment}>
              <Dialog
                as="div"
                className="fixed inset-0 z-10 overflow-y-auto"
                onClose={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedRule(null);
                  console.log("UserRules: Delete modal closed");
                }}
              >
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10" />
                </Transition.Child>
                <div className="flex items-center justify-center min-h-screen p-4">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="bg-white rounded-md shadow-md p-6 max-w-md w-full border border-gray-200 z-20 relative">
                      <Dialog.Title as="h3" className="text-lg font-semibold text-gray-800">
                        Delete Rule
                      </Dialog.Title>
                      <p className="mt-2 text-sm text-gray-600">
                        Are you sure you want to delete the rule "
                        <span className="font-medium">{selectedRule?.rules_name}</span>"? This action
                        cannot be undone.
                      </p>
                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            setIsDeleteModalOpen(false);
                            setSelectedRule(null);
                            console.log("UserRules: Delete modal Cancel clicked");
                          }}
                          className="w-full sm:w-32 max-w-full min-w-0 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:bg-gray-100 pointer-events-auto"
                          aria-label="Cancel deletion"
                          disabled={isActionLoading}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            console.log("UserRules: Delete modal Delete clicked");
                            handleDelete();
                          }}
                          className="w-full sm:w-32 max-w-full min-w-0 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-300 pointer-events-auto"
                          aria-label="Delete rule"
                          disabled={isActionLoading}
                        >
                          {isActionLoading ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </Dialog>
            </Transition>
          )}
        </main>
      </div>
    </HeaderResponsive>
  );
}
