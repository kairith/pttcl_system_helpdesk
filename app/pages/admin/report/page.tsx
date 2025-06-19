
// app/pages/admin/reports/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import HeaderWithSidebar from "@/app/components/common/Header/Headerwithsidebar";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface ReportData {
  label: string;
  count: number;
}

interface PivotData {
  labels: string[];
  datasets: { label: string; data: number[]; backgroundColor: string; borderColor: string }[];
}

interface User {
  id: string;
  user_name: string;
}

interface ReportsProps {
  isSidebarOpen: boolean;
}

export default function Reports({ isSidebarOpen }: ReportsProps) {
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

  // Refs for chart and table elements
  const barChartRef = useRef<ChartJS<"bar", number[], unknown> | null>(null);
  const pivotChartRef = useRef<ChartJS<"bar", number[], unknown> | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadFilters() {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Please log in as an admin.");
        router.push("/");
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
      }
    }
    loadFilters();
  }, [router]);

  useEffect(() => {
    async function loadReports() {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Please log in as an admin.");
        router.push("/");
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

        // Fetch bar chart data
        console.log(`Fetching report: ${reportType}, params: ${params.toString()}`);
        const barResponse = await fetch(`/api/data/reports?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!barResponse.ok) {
          throw new Error(`HTTP error! status: ${barResponse.status}`);
        }
        const barData = await barResponse.json();
        setData(barData.data || []);

        // Fetch pivot chart data
        console.log(`Fetching pivot report: ${reportType}, params: ${params.toString()}`);
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
          "rgb(59, 130, 246)", // Blue
          "rgb(16, 185, 129)", // Green
          "rgb(245, 158, 11)", // Orange
          "rgb(239, 68, 68)",  // Red
          "rgb(139, 92, 246)", // Purple
        ],
        borderColor: [
          "rgb(37, 99, 235)",  // Dark Blue
          "rgb(5, 150, 105)",  // Dark Green
          "rgb(217, 119, 6)",  // Dark Orange
          "rgb(220, 38, 38)",  // Dark Red
          "rgb(124, 58, 237)", // Dark Purple
        ],
        borderWidth: 0.5,
        borderRadius: 4,
        borderSkipped: "bottom" as const,
      },
    ],
  };

  const barChartOptions = {
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
    },
  };

  const pivotChartOptions = {
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
        display: true,
        position: "top" as const,
      },
    },
  };

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
      <HeaderWithSidebar />
      <div className="flex">
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 w-full transition-all duration-300 ${
            isSidebarOpen ? "sm:ml-64" : "sm:ml-0"
          }`}
        >
          <div className="container mx-auto">
            <div className="mt-19 sm:mt-6 p-4 sm:p-6 bg-white rounded-lg shadow-md">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-8">
                Reports
              </h1>
              {error && <p className="text-red-600 mb-4">{error}</p>}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as "status" | "issue_type")}
                  className="w-full sm:w-40 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  aria-label="Select report type"
                >
                  <option value="status">Ticket Count by Status</option>
                  <option value="issue_type">Ticket Count by Issue Type</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full sm:w-40 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  aria-label="Filter by status"
                >
                  <option value="">All Statuses</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <select
                  value={filterIssueType}
                  onChange={(e) => setFilterIssueType(e.target.value)}
                  className="w-full sm:w-40 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  aria-label="Filter by issue type"
                >
                  <option value="">All Issue Types</option>
                  {issueTypes.map((issueType) => (
                    <option key={issueType} value={issueType}>
                      {issueType}
                    </option>
                  ))}
                </select>
                <select
                  value={filterUserId}
                  onChange={(e) => setFilterUserId(e.target.value)}
                  className="w-full sm:w-40 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  aria-label="Filter by user"
                >
                  <option value="">All Users</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.user_name}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full sm:w-40 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  aria-label="Start date"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full sm:w-40 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  aria-label="End date"
                />
              </div>
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Report Visualization</h2>
                {data.length > 0 || pivotData.labels.length > 0 ? (
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="w-full lg:w-1/2 h-96">
                      <h3 className="text-md font-medium text-gray-600 mb-2">Bar Chart</h3>
                      <Bar
                        ref={barChartRef}
                        data={barChartData}
                        options={barChartOptions}
                      />
                    </div>
                    <div className="w-full lg:w-1/2 h-96">
                      <h3 className="text-md font-medium text-gray-600 mb-2">Pivot Chart</h3>
                      <Bar
                        ref={pivotChartRef}
                        data={pivotData}
                        options={pivotChartOptions}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center">No data available</p>
                )}
              </div>
              <div ref={tableRef}>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Report Data</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 rounded-xl">
                        <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                          {reportType === "status" ? "Status" : "Issue Type"}
                        </th>
                        <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Count</th>
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
                            <td className="p-2 sm:p-3 text-gray-700">{item.label}</td>
                            <td className="p-2 sm:p-3 text-gray-700">{item.count}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
