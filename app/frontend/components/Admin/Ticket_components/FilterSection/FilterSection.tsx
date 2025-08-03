"use client";

import React, { useEffect, useRef } from "react";
import { Ticket } from "@/app/backend/types/ticket";

interface FilterSectionProps {
  showFilterInput: boolean;
  isExporting: boolean;
  stationIdFilter: string;
  stationNameFilter: string;
  stationTypeFilter: string;
  provinceFilter: string;
  issueDescriptionFilter: string;
  issueTypeFilter: string;
  statusFilter: string;
  usersIdFilter: string;
  ticketOpenFrom: string;
  ticketOpenTo: string;
  ticketCloseFrom: string;
  ticketCloseTo: string;
  ticketOnHoldFilter: string;
  ticketInProgressFilter: string;
  ticketPendingVendorFilter: string;
  ticketTimeFilter: string;
  commentFilter: string;
  userCreateTicketFilter: string;
  issueTypeIdFilter: string;
  usersNameFilter: string;
  tickets: (Ticket & { users_name: string; creator_name: string })[];
  onFilterChange: (key: string, value: string) => void;
  onFilter: () => void;
  onClearFilter: () => void;
}

export default function FilterSection({
  showFilterInput,
  isExporting,
  stationIdFilter,
  stationNameFilter,
  stationTypeFilter,
  provinceFilter,
  issueDescriptionFilter,
  issueTypeFilter,
  statusFilter,
  usersIdFilter,
  ticketOpenFrom,
  ticketOpenTo,
  ticketCloseFrom,
  ticketCloseTo,
  ticketOnHoldFilter,
  ticketInProgressFilter,
  ticketPendingVendorFilter,
  ticketTimeFilter,
  commentFilter,
  userCreateTicketFilter,
  issueTypeIdFilter,
  usersNameFilter,
  tickets,
  onFilterChange,
  onFilter,
  onClearFilter,
}: FilterSectionProps) {
  const stationIdDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        stationIdDropdownRef.current &&
        !stationIdDropdownRef.current.contains(event.target as Node)
      ) {
        // Keep dropdown behavior as is
      }
    };

    if (showFilterInput && stationIdFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilterInput, stationIdFilter]);

  const handleSelectChange = (key: string, value: string) => {
    // console.log(`Selected ${key}: ${value}`);
    onFilterChange(key, value);
  };

  return (
    <div
      className={`mb-6 overflow-hidden transition-all duration-300 ease-in-out ${
        showFilterInput ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 w-full pt-2">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700">Station ID</label>
          <input
            type="text"
            value={stationIdFilter}
            onChange={(e) => handleSelectChange("stationIdFilter", e.target.value)}
            placeholder="Station ID"
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full"
            disabled={isExporting}
          />
          {stationIdFilter && tickets.length > 0 && (
            <div
              ref={stationIdDropdownRef}
              className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg"
            >
              {[
                ...new Set(tickets.map((ticket) => ticket.station_id)),
              ]
                .filter((id) =>
                  id
                    ?.toString()
                    .toLowerCase()
                    .includes(stationIdFilter.toLowerCase())
                )
                .map((id) => (
                  <div
                    key={id}
                    onClick={() => handleSelectChange("stationIdFilter", id || "")}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {id || "N/A"}
                  </div>
                ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Issue Type</label>
          <select
            value={issueTypeFilter}
            onChange={(e) => handleSelectChange("issueTypeFilter", e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full appearance-none"
            disabled={isExporting}
          >
            <option value="">Issue Type</option>
            {tickets.length > 0 &&
              [...new Set(tickets.map((ticket) => ticket.issue_type))].map((type) => (
                <option key={type} value={type || ""}>
                  {type || "N/A"}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ticket Status</label>
          <select
            value={statusFilter}
            onChange={(e) => handleSelectChange("statusFilter", e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full appearance-none"
            disabled={isExporting}
          >
            <option value="">Ticket Status</option>
            {tickets.length > 0 &&
              [...new Set(tickets.map((ticket) => ticket.status))].map((status) => (
                <option key={status} value={status || ""}>
                  {status || "N/A"}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Assign</label>
          <select
            value={usersNameFilter}
            onChange={(e) => handleSelectChange("usersNameFilter", e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full appearance-none"
            disabled={isExporting}
          >
            <option value="">Assign</option>
            {tickets.length > 0 &&
              [...new Set(tickets.map((ticket) => ticket.users_name))].map((users_name) => (
                <option key={users_name} value={users_name || ""}>
                  {users_name || "N/A"}
                </option>
              ))}
          </select>
        </div>
        {/* <div>
          <label className="block text-sm font-medium text-gray-700">User Create</label>
          <select
            value={userCreateTicketFilter}
            onChange={(e) => handleSelectChange("userCreateTicketFilter", e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full appearance-none"
            disabled={isExporting}
          >
            <option value="">User Create</option>
            {tickets.length > 0 &&
              [...new Set(tickets.map((ticket) => ticket.user_create_ticket))].map((userId) => (
                <option key={userId} value={userId || ""}>
                  {userId || "N/A"}
                </option>
              ))}
          </select>
        </div> */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700">Issue Type ID</label>
          <select
            value={issueTypeIdFilter}
            onChange={(e) => handleSelectChange("issueTypeIdFilter", e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full appearance-none"
            disabled={isExporting}
          >
            <option value="">Issue Type ID</option>
            {tickets.length > 0 &&
              [...new Set(tickets.map((ticket) => ticket.issue_type_id))].map((id) => (
                <option key={id} value={id || ""}>
                  {id || "N/A"}
                </option>
              ))}
          </select>
        </div> */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Ticket Open From</label>
          <input
            type="date"
            value={ticketOpenFrom}
            onChange={(e) => handleSelectChange("ticketOpenFrom", e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full"
            disabled={isExporting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ticket Open To</label>
          <input
            type="date"
            value={ticketOpenTo}
            onChange={(e) => handleSelectChange("ticketOpenTo", e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full"
            disabled={isExporting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ticket Close From</label>
          <input
            type="date"
            value={ticketCloseFrom}
            onChange={(e) => handleSelectChange("ticketCloseFrom", e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full"
            disabled={isExporting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ticket Close To</label>
          <input
            type="date"
            value={ticketCloseTo}
            onChange={(e) => handleSelectChange("ticketCloseTo", e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full"
            disabled={isExporting}
          />
        </div>
        <button
          onClick={() => {
            console.log("Filter button clicked");
            onFilter();
          }}
          className="h-11 mt-5 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm sm:text-base disabled:opacity-50"
          disabled={isExporting}
        >
          Filter
        </button>
        <button
          onClick={() => {
            console.log("Clear filter button clicked");
            onClearFilter();
          }}
          className="h-11 mt-5 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm sm:text-base disabled:opacity-50"
          disabled={isExporting}
        >
          Clear
        </button>
      </div>
    </div>
  );
}