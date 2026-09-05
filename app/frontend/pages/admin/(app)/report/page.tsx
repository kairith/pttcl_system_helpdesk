"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import LoadingScreen from "@/app/frontend/components/ui/loadingScreen";
import Card from "@/app/frontend/components/common/Card/Card";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

interface ReportData {
  label: string;
  count: number;
}

interface PivotData {
  labels: string[];
  datasets: { label: string; data: number[]; backgroundColor: string; borderColor: string }[];
}

interface User {
  users_id: string;
  users_name: string;
}

export default function Reports() {
  const [reportType, setReportType] = useState<"status" | "issue_type">("status");
  const [data, setData] = useState<ReportData[]>([]);
  const [pivotData, setPivotData] = useState<PivotData>({ labels: [], datasets: [] });
  const [statuses, setStatuses] = useState<string[]>([]);
  const [issueTypes, setIssueTypes] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterIssueType, setFilterIssueType] = useState("");
  const [filterUserId, setFilterUserId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const barChartRef = useRef<ChartJS<"bar", number[], unknown> | null>(null);
  const pivotChartRef = useRef<ChartJS<"bar", number[], unknown> | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const loadFilters = useCallback(async () => {
    setIsLoading(true);
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("Please log in as an admin.");
      router.push("/");
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch("/api/data/report-filters", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const { statuses, issueTypes, users } = await response.json();
      setStatuses(statuses || []);
      setIssueTypes(issueTypes || []);
      setUsers(users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load filters");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    setIsLoading(true);
    async function loadReports() {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Please log in as an admin.");
        router.push("/");
        setIsLoading(false);
        return;
      }
      try {
        const params = new URLSearchParams();
        params.append("type", reportType);
        if (filterStatus) params.append("status", filterStatus);
        if (filterIssueType) params.append("issue_type", filterIssueType);
        if (filterUserId) params.append("user_id", filterUserId);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const barResponse = await fetch(`/api/data/reports?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!barResponse.ok) {
          throw new Error(`HTTP error! status: ${barResponse.status}`);
        }
        const barData = await barResponse.json();
        setData(barData.data || []);

        const pivotResponse = await fetch(`/api/data/reports-pivot?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!pivotResponse.ok) {
          throw new Error(`HTTP error! status: ${pivotResponse.status}`);
        }
        const pivotResult = await pivotResponse.json();
        setPivotData(pivotResult.data || { labels: [], datasets: [] });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load report");
      } finally {
        setIsLoading(false);
      }
    }
    loadReports();
  }, [reportType, filterStatus, filterIssueType, filterUserId, startDate, endDate, router]);

  const barChartData = {
    labels: data.map((item) => item.label),
    datasets: [
      {
        label: reportType === "status" ? "Tickets by Status" : "Tickets by Issue Type",
        data: data.map((item) => item.count),
        backgroundColor: [
          "rgb(59, 130, 246)",
          "rgb(16, 185, 129)",
          "rgb(245, 158, 11)",
          "rgb(239, 68, 68)",
          "rgb(139, 92, 246)",
        ],
        borderColor: [
          "rgb(37, 99, 235)",
          "rgb(5, 150, 105)",
          "rgb(217, 119, 6)",
          "rgb(220, 38, 38)",
          "rgb(124, 58, 237)",
        ],
        borderWidth: 0.5,
        borderRadius: 4,
        borderSkipped: "bottom" as const,
      },
    ],
  };

  const barChartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Tickets",
        },
      },
      x: {
        title: {
          display: true,
          text: reportType === "status" ? "Status" : "Issue Type",
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      datalabels: {
        anchor: "center" as const,
        align: "center" as const,
        color: "#000",
        font: {
          weight: "bold" as const,
          size: 12,
        },
        formatter: (value: number) => (value === 0 ? "" : value),
      },
    },
  };

  const pivotChartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    indexAxis: "y" as const,
    scales: {
      x: {
        beginAtZero: true,
        stacked: true,
        title: {
          display: true,
          text: "Number of Tickets",
        },
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: reportType === "status" ? "Status" : "Issue Type",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        anchor: "center" as const,
        align: "center" as const,
        color: "#000",
        font: {
          weight: "bold" as const,
          size: 12,
        },
        formatter: (value: number) => (value === 0 ? "" : value),
      },
    },
  };

  const handleResetFilters = () => {
    setReportType("status");
    setFilterStatus("");
    setFilterIssueType("");
    setFilterUserId("");
    setStartDate("");
    setEndDate("");
  };

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md w-full">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-4 text-lg font-semibold text-red-600">{error}</p>
          <button
            onClick={() => loadFilters()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
        <LoadingScreen />
    );
  }

  return (
    <Card className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Reports</h1>
            <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8 w-full max-w-full flex-wrap">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col min-w-[190px]">
                <label htmlFor="reportType" className="text-xs text-gray-500 mb-1">
                  Report
                </label>
                <select
                  id="reportType"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as "status" | "issue_type")}
                  title={reportType === "status" ? "Ticket Count by Status" : "Ticket Count by Issue Type"}
                  className="min-w-[190px] p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base truncate"
                  aria-label="Select report type"
                >
                  <option value="status">Ticket Count by Status</option>
                  <option value="issue_type">Ticket Count by Issue Type</option>
                </select>
              </div>
              <div className="flex flex-col min-w-[120px]">
                <label htmlFor="filterStatus" className="text-xs text-gray-500 mb-1">
                  Status
                </label>
                <select
                  id="filterStatus"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  title={filterStatus || "All Statuses"}
                  className="min-w-[120px] p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base truncate"
                  aria-label="Filter by status"
                >
                  <option value="">All Statuses</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col min-w-[130px]">
                <label htmlFor="filterIssueType" className="text-xs text-gray-500 mb-1">
                  Issue type
                </label>
                <select
                  id="filterIssueType"
                  value={filterIssueType}
                  onChange={(e) => setFilterIssueType(e.target.value)}
                  title={filterIssueType || "All Issue Types"}
                  className="min-w-[130px] p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base truncate"
                  aria-label="Filter by issue type"
                >
                  <option value="">All Issue Types</option>
                  {issueTypes.map((issueType) => (
                    <option key={issueType} value={issueType}>
                      {issueType}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col min-w-[130px]">
                <label htmlFor="filterUserId" className="text-xs text-gray-500 mb-1">
                  User
                </label>
                <select
                  id="filterUserId"
                  value={filterUserId}
                  onChange={(e) => setFilterUserId(e.target.value)}
                  title={
                    filterUserId
                      ? users.find((u) => String(u.users_id) === String(filterUserId))?.users_name || "All Users"
                      : "All Users"
                  }
                  className="min-w-[130px] p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base truncate"
                  aria-label="Filter by user"
                >
                  <option value="">All Users</option>
                  {users.map((user) => (
                    <option key={user.users_id} value={user.users_id}>
                      {user.users_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">Date range</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-blue-500">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="p-1 border-0 focus:outline-none focus:ring-0 text-sm sm:text-base"
                    aria-label="Start date"
                  />
                  <span className="text-gray-400 text-sm">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="p-1 border-0 focus:outline-none focus:ring-0 text-sm sm:text-base"
                    aria-label="End date"
                  />
                </div>
              </div>
            </div>
              <div className="flex flex-col shrink-0">
                <label className="text-xs mb-1 invisible" aria-hidden="true">
                  Reset
                </label>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 text-sm sm:text-base"
                >
                  Reset filters
                </button>
              </div>
            </div>
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Report Visualization</h2>
              {data.length > 0 || pivotData.labels.length > 0 ? (
                <div className="flex flex-col lg:flex-row gap-6 w-full max-w-full">
                  <div className="w-full lg:w-1/2 h-[40vh] min-w-0">
                    <h3 className="text-md font-medium text-gray-600 mb-2">Bar Chart</h3>
                    <div className="relative w-full h-full">
                      <Bar
                        ref={barChartRef}
                        data={barChartData}
                        options={barChartOptions}
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-1/2 h-[40vh] min-w-0">
                    <h3 className="text-md font-medium text-gray-600 mb-2">Pivot Chart</h3>
                    <div className="relative w-full h-full">
                      <Bar
                        ref={pivotChartRef}
                        data={pivotData}
                        options={pivotChartOptions}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center">No data available</p>
              )}
            </div>
            <div ref={tableRef}>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Report Data</h2>
              <div className="overflow-x-auto w-full max-w-full">
                <table className="w-full text-sm table-auto border-collapse">
                  <thead>
                    <tr className="bg-gray-100 rounded-xl">
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800 min-w-[120px]">
                        {reportType === "status" ? "Status" : "Issue Type"}
                      </th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800 min-w-[80px]">
                        Count
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="p-4 text-center text-gray-500">
                          No data found.
                        </td>
                      </tr>
                    ) : (
                      data.map((item) => (
                        <tr
                          key={item.label}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="p-2 sm:p-3 text-gray-700 min-w-0">{item.label}</td>
                          <td className="p-2 sm:p-3 text-gray-700 min-w-0">{item.count}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
    </Card>
  );
}