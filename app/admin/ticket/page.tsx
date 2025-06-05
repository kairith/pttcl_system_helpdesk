"use client";
import React, { useState, useEffect } from "react";
import { Ticket } from "../../types/ticket";
import { fetchTickets } from "../ticket/action";
import Header from "@/app/components/common/Header";

interface TicketsProps {
  isSidebarOpen: boolean;
}

export default function Tickets({ isSidebarOpen }: TicketsProps) {
  const [tickets, setTickets] = useState<(Ticket & { users_name: string; creator_name: string })[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTickets() {
      const { tickets, error } = await fetchTickets();
      setTickets(tickets || []);
      setError(error);
    }
    loadTickets();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <main
            className={`flex-1 p-4 sm:p-6 lg:p-8 w-full transition-all duration-300 ${
              isSidebarOpen ? "sm:ml-64" : "sm:ml-0"
            }`}
          >
            <div className="text-red-500 text-center text-sm sm:text-base">{error}</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 w-full transition-all duration-300 ${
            isSidebarOpen ? "sm:ml-64" : "sm:ml-0"
          }`}
        >
          <div className="container mx-auto">
            <div className="mt-19 sm:mt-6 p-4 sm:p-6 bg-white rounded-lg shadow-md">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-8">
                Tickets
              </h1>
              {error && <p className="text-red-600 mb-4">{error}</p>}
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1200px]">
                  <thead>
                    <tr className="bg-gray-100 rounded-xl">
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">ID</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Ticket ID</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Station Name</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Station Type</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Province</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Issue Description</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Issue Type</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Status</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Assign</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Opened</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">On Hold</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">In Progress</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Pending Vendor</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Closed</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Last Updated</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Comment</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Issue Type ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.length === 0 ? (
                      <tr>
                        <td colSpan={17} className="p-4 text-center text-gray-500">
                          No tickets found.
                        </td>
                      </tr>
                    ) : (
                      tickets.map((ticket) => (
                        <tr key={ticket.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="p-2 sm:p-3 text-gray-700">{ticket.id}</td>
                          <td className="p-2 sm:p-3 text-gray-700">{ticket.ticket_id}</td>
                          <td className="p-2 sm:p-3 text-gray-700">{ticket.station_name || "N/A"}</td>
                          <td className="p-2 sm:p-3 text-gray-700">{ticket.station_type}</td>
                          <td className="p-2 sm:p-3 text-gray-700">{ticket.province}</td>
                          <td className="p-2 sm:p-3 text-gray-700">{ticket.issue_description}</td>
                          <td className="p-2 sm:p-3 text-gray-700">{ticket.issue_type}</td>
                          <td className="p-2 sm:p-3 text-gray-700">{ticket.status}</td>
                          <td className="p-2 sm:p-3 text-gray-700">{ticket.users_name || "N/A"}</td>
                          <td className="p-2 sm:p-3 text-gray-700">
                            {new Date(ticket.ticket_open).toLocaleString()}
                          </td>
                          <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.ticket_on_hold ? new Date(ticket.ticket_on_hold).toLocaleString() : "N/A"}
                          </td>
                          <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.ticket_in_progress ? new Date(ticket.ticket_in_progress).toLocaleString() : "N/A"}
                          </td>
                          <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.ticket_pending_vendor ? new Date(ticket.ticket_pending_vendor).toLocaleString() : "N/A"}
                          </td>
                          <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.ticket_close ? new Date(ticket.ticket_close).toLocaleString() : "N/A"}
                          </td>
                          <td className="p-2 sm:p-3 text-gray-700">
                            {new Date(ticket.ticket_time).toLocaleString()}
                          </td>
                          <td className="p-2 sm:p-3 text-gray-700">{ticket.comment || "N/A"}</td>
                          <td className="p-2 sm:p-3 text-gray-700">{ticket.issue_type_id}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}