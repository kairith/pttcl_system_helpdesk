// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import HeaderWithSidebar from "@/app/components/common/Header/Headerwithsidebar";
import {
  fetchTicketsCount,
  fetchDashboardData,
} from "@/app/components/Dashboard_components/All_Ticket_Chart";
import StatsCards from "@/app/components/Dashboard_components/StatsCards";
import LineChartCard from "@/app/components/Dashboard_components/LineChartCard";
import TicketChart from "@/app/components/Dashboard_components/TotalTicketBarChart";
import BarChartCard from "@/app/components/Dashboard_components/TicketSummaryBarChart";
import DoughnutChartCard from "@/app/components/Dashboard_components/DoughnutChartCard";
import TicketDetailsTable from "@/app/components/Dashboard_components/TicketDetailsTable";
import Card from "@/app/components/common/Card";

interface TicketData {
  id: number;
  ticket_id: string;
  province: string;
  status?: string;
  station_id: string;
  station_type: string;
  issue_description: string;
  issue_type: string;
}

interface StatsData {
  open: number;
  on_hold: number;
  in_progress: number;
  close: number;
}

interface DashboardProps {
  isSidebarOpen: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ isSidebarOpen }) => {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [ticketData, setTicketData] = useState<TicketData[]>([]);
  const [stats, setStats] = useState<StatsData>({
    open: 0,
    on_hold: 0,
    in_progress: 0,
    close: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const countResult = await fetchTicketsCount(undefined, selectedYear);
        if (countResult.error) {
          setError(countResult.error);
        } else {
          setStats(countResult.stats);
        }

        const { ticketData, error } = await fetchDashboardData(
          undefined,
          selectedYear
        );
        if (error) {
          setError(error);
        } else {
          setTicketData(ticketData);
        }
      } catch (err) {
        setError(`Failed to load dashboard data: ${(err as Error).message}`);
      }
    };

    loadData();
  }, [selectedYear]);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* header for page */}
      <HeaderWithSidebar />
      <div className="flex">
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 w-full transition-all duration-300 ${
            isSidebarOpen ? "sm:ml-64" : ""
          }`}
        >
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
                Dashboard
              </h1>
            </div>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <StatsCards stats={stats} />
            {/* all ticket lineChart */}
            <LineChartCard title="Ticket Trends" />

            {/* all ticket barchart  */}
            {/* <div className="mb-6 sm:mb-8 bg-white shadow-lg rounded-xl border border-gray-200 p-4 sm:p-6 mt-9">
              
              <TicketChart />
            </div> */}
            <div className="mb-6 sm:mb-8 bg-white shadow-lg rounded-xl border border-gray-200 mt-9">
            <Card className="p-4  sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                  Ticket Summary
                </h2>
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="w-full sm:w-48 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Years</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>

              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                {/* ticket summary Barchart  */}
                <BarChartCard
                  title="Tickets by Issue Type"
                  selectedYear={selectedYear}
                />
                {/* ticket summary Doughnut */}
                <DoughnutChartCard
                  title="Ticket Categories"
                  selectedYear={selectedYear}
                />
              </div>
            </Card>
            </div>
            {/* detail ticket each year  */}
            <TicketDetailsTable ticketData={ticketData} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
