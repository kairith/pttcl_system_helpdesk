
// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { toast } from "react-toastify";
// import { User } from "@/app/backend/types/user";
// import { fetchUsers } from "./action";
// import HeaderWithSidebar from "@/app/frontend/components/common/Header/Headerwithsidebar";
// import UsersHeader from "@/app/frontend/components/Admin/AllUser_components/UserHeader";
// import FilterControls from "@/app/frontend/components/Admin/AllUser_components/FilterControls";
// import ExportOptions from "@/app/frontend/components/Admin/AllUser_components/ExportOptions";
// import UsersTable from "@/app/frontend/components/Admin/AllUser_components/UsersTables";
// import DeleteModal from "@/app/frontend/components/Admin/AllUser_components/DeleteModel";

// interface Permissions {
//   users: {
//     add: boolean;
//     edit: boolean;
//     delete: boolean;
//     list: boolean;
//   };
// }

// export default function UsersPage() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [users, setUsers] = useState<(User & { rules_name: string })[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [filterId, setFilterId] = useState("");
//   const [filterName, setFilterName] = useState("");
//   const [showFilterInput, setShowFilterInput] = useState(false);
//   const [showExportOptions, setShowExportOptions] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
//   const [filterIdError, setFilterIdError] = useState<string | null>(null);
//   const [permissions, setPermissions] = useState<Permissions | null>(null);
//   const router = useRouter();

//   const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

//   useEffect(() => {
//     async function loadData() {
//       try {
//         setIsLoading(true);
//         const token = sessionStorage.getItem("token");
//         if (!token) {
//           setError("Please log in to access this page.");
//           toast.error("Please log in to access this page.");
//           router.push("/");
//           return;
//         }
//         console.log("UsersPage: Fetching with token:", token.substring(0, 10) + "...");

//         const response = await fetch("/api/data/user", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (!response.ok) {
//           const data = await response.json();
//           if (data.error?.includes("Invalid token")) {
//             setError("Session expired. Please log in again.");
//             toast.error("Session expired. Please log in again.");
//             router.push("/");
//             return;
//           }
//           throw new Error(data.error || "Failed to fetch permissions");
//         }
//         const { rules } = await response.json();
//         const userPermissions: Permissions = {
//           users: {
//             add: !!rules.add_user_status,
//             edit: !!rules.edit_user_status,
//             delete: !!rules.delete_user_status,
//             list: !!rules.list_user_status,
//           },
//         };
//         setPermissions(userPermissions);
//         console.log("UsersPage: Permissions:", JSON.stringify(userPermissions, null, 2));

//         if (!userPermissions.users.list) {
//           setError("You do not have permission to view users. Contact Admin for access.");
//           toast.error("You do not have permission to view users.");
//           return;
//         }

//         const { users, error } = await fetchUsers();
//         console.log("UsersPage: Fetched users:", JSON.stringify(users, null, 2));
//         setUsers(users || []);
//         setError(error);
//         if (error) toast.error(error);
//       } catch (err) {
//         const errorMsg = err instanceof Error ? err.message : "An unknown error occurred.";
//         setError(errorMsg);
//         toast.error(errorMsg);
//       } finally {
//         setIsLoading(false);
//       }
//     }
//     loadData();
//   }, [router]);

//   const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value.trim();
//     if (value && !/^\d+$/.test(value)) {
//       setFilterIdError("User ID must be numeric");
//     } else {
//       setFilterIdError(null);
//       setFilterId(value);
//     }
//     console.log("UsersPage: Filter ID updated:", value);
//   };

//   const handleFilterNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setFilterName(value);
//     console.log("UsersPage: Filter Name updated:", value);
//   };

//   const handleFilterToggle = () => {
//     setShowFilterInput((prev) => !prev);
//     if (showFilterInput) {
//       setFilterId("");
//       setFilterName("");
//       setFilterIdError(null);
//     }
//     console.log("UsersPage: Filter input toggled:", !showFilterInput);
//   };

//   const handleClearFilter = () => {
//     setFilterId("");
//     setFilterName("");
//     setFilterIdError(null);
//     setShowFilterInput(false);
//     console.log("UsersPage: Filters cleared");
//   };

//   const handleExport = async (format: "excel" | "pdf" | "csv") => {
//     if (!permissions?.users.list) {
//       toast.error("You do not have permission to export users.");
//       return;
//     }
//     setIsLoading(true);
//     try {
//       const token = sessionStorage.getItem("token");
//       if (!token) {
//         setError("Please log in to access this page.");
//         toast.error("Please log in to access this page.");
//         router.push("/");
//         return;
//       }

//       const response = await fetch(`/api/data/export-users?format=${format}`, {
//         method: "GET",
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!response.ok) {
//         const data = await response.json();
//         if (data.error?.includes("expired") || data.error?.includes("Invalid token")) {
//           setError("Session expired. Please log in again.");
//           toast.error("Session expired. Please log in again.");
//           router.push("/");
//         } else {
//           throw new Error(data.error || `Export to ${format} failed`);
//         }
//       }

//       const extension = format === "excel" ? "xlsx" : format;
//       const fileName = `users_export.${extension}`;
//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = fileName;
//       a.click();
//       window.URL.revokeObjectURL(url);
//       setShowExportOptions(false);
//       toast.success(`Users exported as ${format.toUpperCase()}`);
//     } catch (error) {
//       const errorMsg = error instanceof Error ? error.message : "Unknown error";
//       setError(`Failed to export users: ${errorMsg}`);
//       toast.error(`Failed to export users: ${errorMsg}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleEditUser = (id: string) => {
//     if (!permissions?.users.edit) {
//       toast.error("You do not have permission to edit users.");
//       return;
//     }
//     const token = sessionStorage.getItem("token");
//     if (!token) {
//       setError("Please log in to access this page.");
//       toast.error("Please log in to access this page.");
//       router.push("/");
//       return;
//     }
//     router.push(`/pages/admin/user/edit_user/${id}`);
//   };

//   const handleDeleteUser = async () => {
//     if (!deleteUserId || !permissions?.users.delete) {
//       toast.error("You do not have permission to delete users.");
//       return;
//     }
//     setIsLoading(true);
//     try {
//       const token = sessionStorage.getItem("token");
//       if (!token) {
//         setError("Please log in to access this page.");
//         toast.error("Please log in to access this page.");
//         router.push("/");
//         return;
//       }
//       const response = await fetch(`/api/data/delete_user/${deleteUserId}`, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!response.ok) {
//         const data = await response.json();
//         if (data.error?.includes("expired") || data.error?.includes("Invalid token")) {
//           setError("Session expired. Please log in again.");
//           toast.error("Session expired. Please log in again.");
//           router.push("/");
//         } else {
//           throw new Error(data.error || "Failed to delete user");
//         }
//       }
//       const { users, error } = await fetchUsers();
//       setUsers(users || []);
//       setError(error);
//       if (error) toast.error(error);
//       else toast.success(`User ${deleteUserId} deleted successfully`);
//       closeDeleteModal();
//     } catch (error) {
//       const errorMsg = error instanceof Error ? error.message : "Unknown error";
//       setError(`Failed to delete user: ${errorMsg}`);
//       toast.error(`Failed to delete user: ${errorMsg}`);
//       closeDeleteModal();
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const openDeleteModal = (id: string) => {
//     setDeleteUserId(id);
//   };

//   const closeDeleteModal = () => {
//     setDeleteUserId(null);
//   };

//   const filteredUsers = users.filter((user) => {
//     const matchesId = filterId
//       ? user.users_id.toString().includes(filterId)
//       : true;
//     const matchesName = filterName
//       ? user.users_name.toLowerCase().includes(filterName.toLowerCase()) ||
//         user.email.toLowerCase().includes(filterName.toLowerCase())
//       : true;
//     return matchesId && matchesName;
//   });

//   if (isLoading) {
//     return (
//       <div className={`min-h-screen bg-gray-50 ${isSidebarOpen ? "sm:ml-64" : ""} transition-all duration-300 overflow-x-hidden box-border`}>
//         <HeaderWithSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
//         <div className="flex w-full">
//           <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
//             <div className="flex items-center justify-center py-8">
//               <div className="flex items-center space-x-3">
//                 <svg
//                   className="animate-spin h-8 w-8 text-blue-600"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   />
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
//                   />
//                 </svg>
//                 <span className="text-lg font-medium text-gray-600">Loading users...</span>
//               </div>
//             </div>
//           </main>
//         </div>
//       </div>
//     );
//   }

//   if (error || !permissions?.users.list) {
//     return (
//       <div className={`min-h-screen bg-gray-50 ${isSidebarOpen ? "sm:ml-64" : ""} transition-all duration-300 overflow-x-hidden box-border`}>
//         <HeaderWithSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
//         <div className="flex w-full">
//           <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
//             <div className="flex items-center justify-center py-8">
//               <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md w-full">
//                 <svg
//                   className="mx-auto h-12 w-12 text-red-500"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                   />
//                 </svg>
//                 <p className="mt-4 text-lg font-semibold text-red-600">
//                   {error || "You do not have permission to view users. Contact Admin for access."}
//                 </p>
//               </div>
//             </div>
//           </main>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-screen bg-gray-50 ${isSidebarOpen ? "sm:ml-64" : ""} transition-all duration-300 overflow-x-hidden box-border`}>
//       <HeaderWithSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
//       <div className="flex w-full">
//         <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
//           <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md border border-gray-200 w-full max-w-full">
//             {error && (
//               <div className="mb-4 p-3 rounded text-sm sm:text-base bg-red-100 text-red-800 w-full max-w-full">
//                 {error}
//               </div>
//             )}
//             <UsersHeader
//               permissions={permissions}
//               onFilterToggle={handleFilterToggle}
//               onExportToggle={() => setShowExportOptions((prev) => !prev)}
//               className="w-full max-w-full min-w-0"
//             />
//             {permissions.users.list && (
//               <>
//                 <FilterControls
//                   showFilterInput={showFilterInput}
//                   filterId={filterId}
//                   filterName={filterName}
//                   filterIdError={filterIdError}
//                   onFilterIdChange={handleFilterChange}
//                   onFilterNameChange={handleFilterNameChange}
//                   onClearFilter={handleClearFilter}
//                   className="w-full max-w-full min-w-0"
//                 />
//                 <ExportOptions
//                   showExportOptions={showExportOptions}
//                   permissions={permissions}
//                   onExport={handleExport}
//                   className="w-full max-w-full min-w-0"
//                 />
//                 <UsersTable
//                   users={filteredUsers}
//                   permissions={permissions}
//                   onEdit={handleEditUser}
//                   onDelete={openDeleteModal}
//                   className="w-full max-w-full min-w-0"
//                 />
//               </>
//             )}
//             <DeleteModal
//               isOpen={deleteUserId !== null}
//               users={users}
//               deleteUserId={deleteUserId}
//               onClose={closeDeleteModal}
//               onConfirm={handleDeleteUser}
//               className="max-w-lg"
//             />
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }
