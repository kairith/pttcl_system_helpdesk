
// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";

import {
  fetchTicketsCount,
  fetchDashboardData,
} from "@/app/frontend/components/Admin/Dashboard_components/All_Ticket_Chart";
import StatsCards from "@/app/frontend/components/Admin/Dashboard_components/StatsCards";
import LineChartCard from "@/app/frontend/components/Admin/Dashboard_components/LineChartCard";
import BarChartCard from "@/app/frontend/components/Admin/Dashboard_components/TicketSummaryBarChart";
import DoughnutChartCard from "@/app/frontend/components/Admin/Dashboard_components/DoughnutChartCard";
import TicketDetailsTable from "@/app/frontend/components/Admin/Dashboard_components/TicketDetailsTable";
import Card from "@/app/frontend/components/common/Card/Card";

import HeaderResponsive from "@/app/frontend/components/common/Header/headerResponsive";
import LoadingScreen from "@/app/frontend/components/ui/loadingScreen";

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

const Dashboard: React.FC = () => {
  
  const [selectedYear, setSelectedYear] = useState("2024");
  const [isLoading, setIsLoading] = useState(true);
  const [ticketData, setTicketData] = useState<TicketData[]>([]);
  const [stats, setStats] = useState<StatsData>({
    open: 0,
    on_hold: 0,
    in_progress: 0,
    close: 0,
  });
  const [error, setError] = useState<string | null>(null);

  

  useEffect(() => {
    setIsLoading(true);
    const loadData = async () => {
      try {
        const countResult = await fetchTicketsCount(undefined, selectedYear);
        if (countResult.error) {
          setError(countResult.error);
        } else {
          setStats(countResult.stats);
        }

        const { ticketData, error } = await fetchDashboardData(undefined, selectedYear);
        if (error) {
          setError(error);
        } else {
          setTicketData(ticketData);
        }
      } catch (err) {
        setError(`Failed to load dashboard data: ${(err as Error).message}`);
      }finally{
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedYear]);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value);
  };

    if (isLoading) {
      return (
        <HeaderResponsive>
          <LoadingScreen></LoadingScreen>
        </HeaderResponsive>
      );
    }

  return (
    <HeaderResponsive>
      <div className="flex w-full">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
          <div className="mb-6 sm:mb-8 w-full max-w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
                Dashboard
              </h1>
            </div>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <StatsCards stats={stats} />
            <LineChartCard title="Ticket Trends" />
            <div className="mb-6 sm:mb-8 bg-white shadow-lg rounded-xl border border-gray-200 mt-9 w-full max-w-full">
              <Card className="p-4 sm:p-6">
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
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 w-full">
                  <BarChartCard title="Tickets by Issue Type" selectedYear={selectedYear} />
                  <DoughnutChartCard title="Ticket Categories" selectedYear={selectedYear} />
                </div>
              </Card>
            </div>
            <TicketDetailsTable ticketData={ticketData} />
          </div>
        </main>
      </div>
   </HeaderResponsive>
  );
};

export default Dashboard;
