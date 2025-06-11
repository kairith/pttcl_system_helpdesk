"use client";

import React from "react";
import { Ticket } from "@/app/types/ticket"; // Adjust path as needed
import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

interface TicketTableProps {
  filteredTickets: (Ticket & { users_name: string; creator_name: string })[];
}

export default function TicketTable({ filteredTickets }: TicketTableProps) {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.trim().toLowerCase();
    switch (normalizedStatus) {
      case "open":
        return "bg-green-100 text-green-700 rounded-md";
      case "in progress":
        return "bg-yellow-100 text-yellow-700 rounded-md";
      case "close":
        return "bg-red-100 text-red-700 rounded-md";
      default:
        return "bg-gray-100 text-gray-700 rounded-md";
    }
  };

  const handleEdit = (ticketId: string) => {
    console.log("Navigating to edit page with ID:", ticketId);
    router.push(`/admin/edit_ticket/${ticketId}`);
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                No
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Action
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ticket ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Station ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Station Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Assign
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Issue
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-4 text-center text-gray-500">
                  No tickets found.
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket, index) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    <div className="flex justify-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleEdit(ticket.id.toString())}
                        className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 transition-colors">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                    {ticket.ticket_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                    {ticket.station_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                    {ticket.station_name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                    {ticket.users_name || "Not Assigned"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 break-words max-w-xs">
                    {ticket.issue_type || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        ticket.status.toString()
                      )}`}
                    >
                      {ticket.status || "N/A"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}