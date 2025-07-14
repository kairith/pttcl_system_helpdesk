import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface ExportOptionsProps {
  showExportOptions: boolean;
  permissions: { users: { list: boolean } };
  onExport: (format: "excel" | "pdf" | "csv") => Promise<void>;
}

export default function ExportOptions({
  showExportOptions,
  permissions,
  onExport,
}: ExportOptionsProps) {
  const router = useRouter();

  const handleExportClick = async (format: "excel" | "pdf" | "csv") => {
    if (!permissions.users.list) {
      toast.error("You do not have permission to export users. contact admin for access.");
      return;
    }
    await onExport(format);
  };

  return (
    <>
      {showExportOptions && (
        <div className="flex gap-4 mb-8 ">
          <button
            onClick={() => handleExportClick("excel")}
            className="bg-white border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100 text-sm sm:text-base shadow-sm"
            aria-label="Export as Excel"
          >
            Excel
          </button>
          <button
            onClick={() => handleExportClick("pdf")}
            className="bg-white border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100 text-sm sm:text-base shadow-sm"
            aria-label="Export as PDF"
          >
            PDF
          </button>
          <button
            onClick={() => handleExportClick("csv")}
            className="bg-white border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100 text-sm sm:text-base shadow-sm"
            aria-label="Export as CSV"
          >
            CSV
          </button>
        </div>
      )}
    </>
  );
}