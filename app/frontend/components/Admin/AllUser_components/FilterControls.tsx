import { ChangeEvent } from "react";

interface FilterControlsProps {
  showFilterInput: boolean;
  filterId: string;
  filterName: string;
  filterIdError: string | null;
  onFilterIdChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onFilterNameChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClearFilter: () => void;
}

export default function FilterControls({
  showFilterInput,
  filterId,
  filterName,
  filterIdError,
  onFilterIdChange,
  onFilterNameChange,
  onClearFilter,
}: FilterControlsProps) {
  return (
    <>
      {showFilterInput && (
        <div className="flex flex-col sm:flex-row gap-2 mb-4 ">
          <div>
            <input
              type="text"
              value={filterId}
              onChange={onFilterIdChange}
              placeholder="Enter User ID"
              className="w-full sm:w-40 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              aria-label="Filter by User ID"
            />
            {filterIdError && (
              <p className="text-red-600 text-xs mt-1">{filterIdError}</p>
            )}
          </div>
          <input
            type="text"
            value={filterName}
            onChange={onFilterNameChange}
            placeholder="Enter Name/Email"
            className="w-full sm:w-40 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            aria-label="Filter by Name or Email"
          />
          <button
            onClick={onClearFilter}
            className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
            aria-label="Reset filter"
          >
            Reset Filter
          </button>
        </div>
      )}
    </>
  );
}