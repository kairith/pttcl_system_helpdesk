import { User } from "@/app/backend/types/user";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

interface UsersTableProps {
  users: (User & { rules_name: string })[];
  permissions: { users: { edit: boolean; delete: boolean; list: boolean } };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function UsersTable({
  users,
  permissions,
  onEdit,
  onDelete,
}: UsersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100 rounded-xl">
            <th className="text-left p-2 sm:p-3 font-bold text-gray-800">User ID</th>
            {(permissions.users.edit || permissions.users.delete) && (
              <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Actions</th>
            )}
            <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Name</th>
            <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Email</th>
            <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Verified</th>
            <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Status</th>
            <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Rules</th>
            <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Company</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td
                colSpan={(permissions.users.edit || permissions.users.delete) ? 8 : 7}
                className="p-4 text-center text-gray-500"
              >
                No users found.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user.users_id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="p-2 sm:p-3 text-gray-700">{user.users_id}</td>
                {(permissions.users.edit || permissions.users.delete) && (
                  <td className="p-2 sm:p-3 text-gray-700 flex gap-2">
                    {permissions.users.edit && (
                      <button
                        onClick={() => onEdit(user.users_id)}
                        className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        aria-label={`Edit user ${user.users_name}`}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    )}
                    {permissions.users.delete && (
                      <button
                        onClick={() => onDelete(user.users_id)}
                        className="p-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                        aria-label={`Delete user ${user.users_name}`}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                )}
                <td className="p-2 sm:p-3 text-gray-700">{user.users_name}</td>
                <td className="p-2 sm:p-3 text-gray-700">{user.email}</td>
                <td className="p-2 sm:p-3 text-gray-700">
                  {user.code === 0 ? "Verified" : "Not Verified"}
                </td>
                <td className="p-2 sm:p-3 text-gray-700">
                  {user.status ? "Active" : "Inactive"}
                </td>
                <td className="p-2 sm:p-3 text-gray-700">{user.rules_name || "None"}</td>
                <td className="p-2 sm:p-3 text-gray-700">{user.company || "None"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}