"use client";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface UsersHeaderProps {
  permissions: {
    users: { add: boolean; list: boolean };
  };
  onFilterToggle: () => void;
  onExportToggle: () => void;
}

export default function UsersHeader({
  permissions,
  onFilterToggle,
  onExportToggle,
}: UsersHeaderProps) {
  const router = useRouter();

  const handleCreateUser = () => {
    if (!permissions.users.add) {
      toast.error("You do not have permission to add users.");
      return;
    }
    router.push("/pages/admin/user/add_user");
  };

  return (
    <div className="flex flex-col gap-4 mb-6 sm:mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
        Users
      </h1>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
        {permissions.users.add && (
          <button
            onClick={handleCreateUser}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full sm:w-40 h-10 text-sm sm:text-base flex items-center justify-center"
            aria-label="Create new user"
          >
            <span className="mr-2">+</span> Create User
          </button>
        )}
        {permissions.users.list && (
          <>
            <button
              onClick={onFilterToggle}
              className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 w-full sm:w-40 h-10 text-sm sm:text-base flex items-center justify-center"
              aria-label="Toggle filter input"
            >
              <span className="mr-2">🔍</span> Filter
            </button>
            <button
              onClick={onExportToggle}
              className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 w-full sm:w-40 h-10 text-sm sm:text-base flex items-center justify-center"
              aria-label="Toggle export options"
            >
              <span className="mr-2">📄</span> Export
            </button>
          </>
        )}
      </div>
    </div>
  );
}
