"use client";

import React from "react";

interface ControlsSectionProps {
  onCreateTicket?: () => void;
  onFilterToggle?: () => void;
  onExportToggle?: () => void;
  showExportOptions: boolean;
  setShowExportOptions: React.Dispatch<React.SetStateAction<boolean>>;
  isExporting: boolean;
  onExport?: (format: "xlsx" | "pdf" | "csv") => void;
}

export default function ControlsSection({
  onCreateTicket,
  onFilterToggle,
  onExportToggle,
  showExportOptions,
  setShowExportOptions,
  isExporting,
  onExport,
}: ControlsSectionProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
      {onCreateTicket && (
        <button
          onClick={onCreateTicket}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex-1 sm:flex-none sm:w-40 text-sm sm:text-base disabled:opacity-50"
          disabled={isExporting}
        >
          <span className="mr-2">+</span> Create Ticket
        </button>
      )}
      {onFilterToggle && (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1 sm:flex-none">
          <button
            onClick={onFilterToggle}
            className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 flex-1 sm:w-32 text-sm sm:text-base disabled:opacity-50"
            disabled={isExporting}
          >
            <span className="mr-2">🔍</span> Filter
          </button>
        </div>
      )}
      {onExportToggle && onExport && (
        <div className="relative flex items-center gap-3">
          <button
            onClick={onExportToggle}
            className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 flex-1 sm:flex-none sm:w-32 text-sm sm:text-base flex items-center justify-center disabled:opacity-50"
            disabled={isExporting}
          >
            <span className="mr-2">📄</span> Export
          </button>
          {showExportOptions && (
            <div className="flex gap-2">
              <button
                onClick={() => onExport("xlsx")}
                className="bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm sm:text-base disabled:opacity-50"
                disabled={isExporting}
              >
                Excel
              </button>
              <button
                onClick={() => onExport("pdf")}
                className="bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm sm:text-base disabled:opacity-50"
                disabled={isExporting}
              >
                PDF
              </button>
              <button
                onClick={() => onExport("csv")}
                className="bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm sm:text-base disabled:opacity-50"
                disabled={isExporting}
              >
                CSV
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}