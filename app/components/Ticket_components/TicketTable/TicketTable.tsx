"use client";

import React, { useState, useEffect, useRef } from "react";
import { Ticket } from "@/app/types/ticket";
import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

interface TicketTableProps {
  filteredTickets: (Ticket & { users_name: string; creator_name: string })[];
}

export default function TicketTable({ filteredTickets }: TicketTableProps) {
  const router = useRouter();
  const [selectedTicket, setSelectedTicket] = useState<Ticket & { users_name: string; creator_name: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

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
    router.push(`/admin/edit_ticket/${ticketId}`);
  };

  const handleDelete = async (ticketId: string) => {
    if (confirm("Are you sure you want to delete this ticket?")) {
      const token = sessionStorage.getItem("token");
      if (!token) {
        alert("No authentication token found. Please log in.");
        return;
      }
      try {
        const response = await fetch(`/api/data/delete_ticket/${ticketId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete ticket");
        }
        alert("Ticket deleted successfully");
        window.location.reload();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleView = (ticket: Ticket & { users_name: string; creator_name: string }) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const tableElement = tableRef.current;
    if (isModalOpen && tableElement) {
      tableElement.style.filter = "blur(5px)";
      tableElement.style.opacity = "0.4";
      tableElement.style.transition = "filter 0.3s ease-in-out, opacity 0.3s ease-in-out";

      const modal = document.querySelector(".modal-content");
      if (modal) {
        (modal as HTMLElement).style.transform = "translateY(20px) scale(0.95)";
        (modal as HTMLElement).style.opacity = "0";
        timeout = setTimeout(() => {
          if (modal) {
            (modal as HTMLElement).style.transition = "transform 0.3s ease-in-out, opacity 0.3s ease-in-out";
            (modal as HTMLElement).style.transform = "translateY(0) scale(1)";
            (modal as HTMLElement).style.opacity = "1";
          }
        }, 10);
      }
    } else if (tableElement) {
      tableElement.style.filter = "none";
      tableElement.style.opacity = "1";
      tableElement.style.transition = "filter 0.3s ease-in-out, opacity 0.3s ease-in-out";

      const modal = document.querySelector(".modal-content");
      if (modal) {
        (modal as HTMLElement).style.transition = "transform 0.3s ease-in-out, opacity 0.3s ease-in-out";
        (modal as HTMLElement).style.transform = "translateY(20px) scale(0.95)";
        (modal as HTMLElement).style.opacity = "0";
        timeout = setTimeout(() => {
          setSelectedTicket(null);
        }, 300);
      }
    }
    return () => clearTimeout(timeout);
  }, [isModalOpen]);

  return (
    <div className="w-full overflow-x-auto">
      <div ref={tableRef} className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 hidden md:table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ticket ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Station ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Station Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assign</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Issue</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-4 text-center text-gray-500">No tickets found.</td>
              </tr>
            ) : (
              filteredTickets.map((ticket, index) => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(ticket.id.toString())} className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"><PencilIcon className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(ticket.id.toString())} className="p-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                      <button onClick={() => handleView(ticket)} className="p-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"><EyeIcon className="w-4 h-4" /></button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">{ticket.ticket_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{ticket.station_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{ticket.station_name || "N/A"}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{ticket.users_name || "Not Assigned"}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{ticket.issue_type || "N/A"}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 text-xs font-medium ${getStatusBadge(ticket.status.toString())}`}>
                      {ticket.status || "N/A"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Mobile Responsive Cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {filteredTickets.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No tickets found.</div>
          ) : (
            filteredTickets.map((ticket, index) => (
              <div key={ticket.id} className="p-4">
                <div className="mb-2 text-sm text-gray-800 font-medium">No: {index + 1}</div>
                <div className="mb-2 text-sm text-gray-800 font-medium">Ticket ID: {ticket.ticket_id}</div>
                <div className="mb-2 text-sm text-gray-800 font-medium">Station ID: {ticket.station_id}</div>
                <div className="mb-2 text-sm text-gray-800 font-medium">Station Name: {ticket.station_name || "N/A"}</div>
                <div className="mb-2 text-sm text-gray-800 font-medium">Assign: {ticket.users_name || "Not Assigned"}</div>
                <div className="mb-2 text-sm text-gray-800 font-medium">Issue Type: {ticket.issue_type || "N/A"}</div>
                <div className="mb-2 text-sm font-medium">
                  Status: <span className={`px-2 py-1 text-xs font-medium ${getStatusBadge(ticket.status.toString())}`}>{ticket.status || "N/A"}</span>
                </div>
                <div className="flex justify-start gap-2 mt-3">
                  <button onClick={() => handleEdit(ticket.id.toString())} className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"><PencilIcon className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(ticket.id.toString())} className="p-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                  <button onClick={() => handleView(ticket)} className="p-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"><EyeIcon className="w-4 h-4" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && selectedTicket && (
  <div
   className="fixed inset-0 flex items-center justify-center z-50"
    style={{
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adjust the opacity of the black background
      backdropFilter: 'blur(10px)', // Set the blur effect
      WebkitBackdropFilter: 'blur(10px)' // For Safari support
    }} // Increased blur value
  >
    <div
      className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl modal-content"
      style={{ transition: "transform 0.3s ease-in-out, opacity 0.3s ease-in-out" }}
    >
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Ticket Details: <span className="text-blue-600">{selectedTicket.ticket_id}</span>
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Ticket ID</label>
            <p className="text-gray-800 break-words">{selectedTicket.ticket_id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Station ID</label>
            <p className="text-gray-800 break-words">{selectedTicket.station_id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Station Name</label>
            <p className="text-gray-800 break-words">{selectedTicket.station_name || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Station Type</label>
            <p className="text-gray-800 break-words">{selectedTicket.station_type || "N/A"}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Province</label>
            <p className="text-gray-800 break-words">{selectedTicket.province || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Issue Description</label>
            <p className="text-gray-800 break-words">{selectedTicket.issue_description || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Issue Type</label>
            <p className="text-gray-800 break-words">{selectedTicket.issue_type || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Issue Type ID</label>
            <p className="text-gray-800 break-words">{selectedTicket.issue_type_id || "N/A"}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Status</label>
            <p className="text-gray-800 break-words">{selectedTicket.status || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Assign</label>
            <p className="text-gray-800 break-words">{selectedTicket.users_name || "Not Assigned"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Comment</label>
            <p className="text-gray-800 break-words">{selectedTicket.comment || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Ticket Time</label>
            <p className="text-gray-800 break-words">{selectedTicket.ticket_time ? new Date(selectedTicket.ticket_time).toLocaleString() : "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Created By User ID</label>
            <p className="text-gray-800 break-words">{selectedTicket.user_create_ticket || "N/A"}</p>
          </div>
        </div>
      </div>
      <button
        onClick={closeModal}
        className="mt-6 w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        Close
      </button>
    </div>
  </div>
)}
    </div>
  );
}