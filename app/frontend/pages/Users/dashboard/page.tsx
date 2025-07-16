
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  fetchTicketsCount,
  fetchDashboardData,
} from "@/app/frontend/components/Users/User_Dashboard_Components/All_Ticket_chart";
import StatsCards from "@/app/frontend/components/Users/User_Dashboard_Components/StatsCards";
import LineChartCard from "@/app/frontend/components/Users/User_Dashboard_Components/LineChartCard";
import BarChartCard from "@/app/frontend/components/Users/User_Dashboard_Components/TicketSummaryBarChart";
import DoughnutChartCard from "@/app/frontend/components/Users/User_Dashboard_Components/DoughnutChartCard";
import TicketDetailsTable from "@/app/frontend/components/Users/User_Dashboard_Components/TicketDetailsTable";
import Card from "@/app/frontend/components/common/Card/Card";
import HeaderResponsive from "@/app/frontend/components/common/Header/headerResponsive";
import LoadingScreen from "@/app/frontend/components/ui/loadingScreen";

interface TicketData {
  id: number;
  ticket_id: string;
  province: string;
  status?: string;
  station_id: string;
  station_name: string;
  station_type: string;
  issue_description: string;
  issue_type: string;
  ticket_open?: string;
  users_name: string;
}

interface ChartData {
  month: string;
  value: number;
}

interface BarChartData {
  issue_type: string;
  count: number;
}

interface DoughnutChartData {
  count: number;
  provider: string;
  percentage: number;
}

interface StatsData {
  open: number;
  on_hold: number;
  in_progress: number;
  close: number;
}

const Dashboard: React.FC = () => {
  
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [ticketData, setTicketData] = useState<TicketData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [barChartData, setBarChartData] = useState<BarChartData[]>([]);
  const [doughnutChartData, setDoughnutChartData] = useState<DoughnutChartData[]>([]);
  const [stats, setStats] = useState<StatsData>({
    open: 0,
    on_hold: 0,
    in_progress: 0,
    close: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [users_id, setUsersId] = useState<string>("");
  const router = useRouter();



  useEffect(() => {
    setIsLoading(true);
    if (typeof window !== "undefined") {
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      const userId = user.users_id || "";
      setUsersId(userId);

      if (!userId) {
        setError("User ID is required. Please log in again.");
        router.push("/login");
        return;
      }

      console.log(`Dashboard: Loading data for users_id: ${userId}, selectedYear: ${selectedYear}`);

      const loadData = async () => {
        try {
          const countResult = await fetchTicketsCount(userId, selectedYear);
          if (countResult.error) {
            setError(countResult.error);
            return;
          }
          setStats(countResult.stats);
          console.log(`Dashboard: Stats data:`, countResult.stats);

          const dashboardResult = await fetchDashboardData(userId, undefined, selectedYear);
          if (dashboardResult.error) {
            setError(dashboardResult.error);
            return;
          }
          setTicketData(dashboardResult.ticketData);
          setChartData(dashboardResult.chartData);
          setBarChartData(dashboardResult.barChartData);
          setDoughnutChartData(dashboardResult.doughnutChartData);
          console.log(`Dashboard: Ticket data length: ${dashboardResult.ticketData.length}`);
          console.log(`Dashboard: Chart data:`, dashboardResult.chartData);
          console.log(`Dashboard: Bar chart data:`, dashboardResult.barChartData);
          console.log(`Dashboard: Doughnut chart data:`, dashboardResult.doughnutChartData);
        } catch (err) {
          setError(`Failed to load dashboard data: ${(err as Error).message}`);
          console.error(`Dashboard: Error loading data:`, err);
        }
        finally {
        setIsLoading(false);
       }
      };

      loadData();
    }
  }, [selectedYear, router]);

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
  if (error) {
    return (
      <HeaderResponsive>
        <div className="flex w-full">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
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
              </div>
            </div>
          </main>
        </div>
      </HeaderResponsive>
    );
  }

  return (
    <HeaderResponsive>
      <div className="flex w-full">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
          <div className="w-full max-w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
                Dashboard
              </h1>
              <select
                value={selectedYear}
                onChange={handleYearChange}
                className="w-full sm:w-48 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
              >
                <option value="ALL">All Years</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>
            <StatsCards stats={stats} />
            <LineChartCard
              title="Ticket Trends"
              chartData={chartData}
              selectedYear={selectedYear}
             
            />
            <div className="mb-6 sm:mb-8 bg-white shadow-lg rounded-xl border border-gray-200 w-full max-w-full min-w-0">
              <Card className="p-4 sm:p-6 w-full max-w-full min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                  Ticket Summary
                </h2>
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 w-full max-w-full">
                  <BarChartCard
                    title="Tickets by Issue Type"
                    selectedYear={selectedYear}
                    barChartData={barChartData}
                  
                  />
                  <DoughnutChartCard
                    title="Ticket Categories"
                    selectedYear={selectedYear}
                    doughnutChartData={doughnutChartData}
                  />
                </div>
              </Card>
            </div>
            <TicketDetailsTable ticketData={ticketData}  />
          </div>
        </main>
      </div>
    </HeaderResponsive>
  );
};

export default Dashboard;
