"use client";
import HeaderWithSidebar from "@/app/components/common/Header";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  fetchTicketsCount,
  fetchDashboardData,
} from "@/app/admin/dashboard/all_ticket";
import Card from "@/app/components/common/Card";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface TicketData {
  id: number;
  ticket_id: string;
  province: string;
  station_id: string;
  station_type: string;
  issue_description: string;
  issue_type: string;
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
  provider: string;
  percentage: number;
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
  const [selectedPeriod, setSelectedPeriod] = useState<string>("October");
  const [ticketData, setTicketData] = useState<TicketData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [barChartData, setBarChartData] = useState<BarChartData[]>([]);
  const [doughnutChartData, setDoughnutChartData] = useState<
    DoughnutChartData[]
  >([]);
  const [stats, setStats] = useState<StatsData>({
    open: 0,
    on_hold: 0,
    in_progress: 0,
    close: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const countResult = await fetchTicketsCount(selectedPeriod);
      if (countResult.error) {
        setError(countResult.error);
      } else {
        setStats(countResult.stats);
      }

      const { tickets, chartData, barChartData, doughnutChartData, error } =
        await fetchDashboardData(selectedPeriod);
      if (error) {
        setError(error);
      } else {
        setTicketData(tickets);
        setChartData(chartData);
        setBarChartData(barChartData);
        setDoughnutChartData(doughnutChartData);
      }
    };

    loadData();
  }, [selectedPeriod]);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  const statsCards = [
    {
      title: "open",
      value: stats.open.toString(),
      trend: "8.5% Up from yesterday",
      trendType: "positive",
      icon: "/images/img_ticket_1.png",
      bgColor: "bg-purple-100",
    },
    {
      title: "on hold",
      value: stats.on_hold.toString(),
      trend: "1.3% Up from past week",
      trendType: "positive",
      icon: "/images/img_icon_yellow_700.svg",
      bgColor: "bg-yellow-100",
    },
    {
      title: "in progress",
      value: stats.in_progress.toString(),
      trend: "4.3% Down from yesterday",
      trendType: "negative",
      icon: "/images/img_icon.svg",
      bgColor: "bg-green-100",
    },
    {
      title: "close",
      value: stats.close.toString(),
      trend: "1.8% Up from yesterday",
      trendType: "positive",
      icon: "/images/img_check_1.png",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderWithSidebar/>
      <div className="flex">
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 w-full transition-all duration-300 ${
            isSidebarOpen ? "sm:ml-64" : "sm:ml-0"
          }`}
        >
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-8">
              Dashboard
            </h1>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            Dashboard
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {statsCards.map((stat, index) => (
                <Card key={index} className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-xs sm:text-sm font-medium mb-2">
                        {stat.title}
                      </p>
                      <p className="text-xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">
                        {stat.value}
                      </p>
                      <div className="flex items-center">
                        <Image
                          src={
                            stat.trendType === "positive"
                              ? "/images/img_ictrendingup24px.svg"
                              : "/images/img_ictrendingdown24px.svg"
                          }
                          alt="trend"
                          width={20}
                          height={20}
                          className="mr-2"
                        />
                        <span
                          className={`text-xs sm:text-sm font-medium ${
                            stat.trendType === "positive"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {stat.trend}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-12 h-12 sm:w-15 sm:h-15 rounded-full ${stat.bgColor} flex items-center justify-center`}
                    >
                      <Image
                        src={stat.icon}
                        alt={stat.title}
                        width={32}
                        height={32}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            {/* Total Ticket Chart */}
            <Card className="mb-6 sm:mb-8 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
                  Total Ticket
                </h2>
                <select
                  value={selectedPeriod}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  className="w-full sm:w-48 px-2 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="October">2024</option>
                  <option value="November">2025</option>
                  <option value="December">2026</option>
                </select>
              </div>
              <div className="relative w-full h-64 sm:h-80">
                <Bar
                  data={{
                    labels: chartData.map((data) => data.month),
                    datasets: [
                      {
                        label: "Tickets",
                        data: chartData.map((data) => data.value),
                        backgroundColor: "rgba(0, 255, 255, 0.6)",
                        borderColor: "rgb(255, 255, 255)",
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top" },
                      title: { display: true, text: "Tickets per Month" },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { stepSize: 10 },
                      },
                    },
                  }}
                />
              </div>
            </Card>
            {/* Ticket Summary */}
            <Card className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                Ticket Summary
              </h2>
              <div className="flex flex-col lg:flex-row">
                {/* Bar Chart */}
                <div className="flex-1 mb-6 lg:mb-0 lg:mr-6">
                  <div className="relative w-full h-64 sm:h-80">
                    <Bar
                      data={{
                        labels: barChartData.map((data) => data.issue_type),
                        datasets: [
                          {
                            label: "Tickets by Issue Type",
                            data: barChartData.map((data) => data.count),
                            backgroundColor: barChartData.map((data) =>
                              [
                                "ABA",
                                "ATG",
                                "Dispenser",
                                "FleetCard",
                                "Network",
                              ].includes(data.issue_type)
                                ? "rgb(254, 197, 61)"
                                : "rgb(72, 128, 255)"
                            ),
                            borderColor: barChartData.map((data) =>
                              [
                                "ABA",
                                "ATG",
                                "Dispenser",
                                "FleetCard",
                                "Network",
                              ].includes(data.issue_type)
                                ? "rgb(254, 197, 61)"
                                : "rgb(72, 128, 255)"
                            ),
                            borderWidth: 1,
                            borderRadius: 4,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          title: {
                            display: true,
                            text: "Tickets by Issue Type",
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            min: 0,
                            max: 50,
                            ticks: {
                              callback: function (value) {
                                if ([0, 15, 30, 45].includes(Number(value))) {
                                  return value;
                                }
                                return null;
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
                {/* Doughnut Chart */}
                <div className="w-full lg:w-80">
                  <div className="relative w-full h-64 sm:h-80">
                    <Doughnut
                      data={{
                        labels: doughnutChartData.map((data) => data.provider),
                        datasets: [
                          {
                            data: doughnutChartData.map(
                              (data) => data.percentage
                            ),
                            backgroundColor: [
                              "rgb(254, 197, 61)",
                              "rgb(72, 128, 255)",
                            ],
                            borderColor: [
                              "rgb(255, 255, 255)",
                              "rgb(255, 255, 255)",
                            ],
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: "bottom" },
                          title: { display: true, text: "Tickets by Category" },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>
            {/* Ticket Details Table */}
            <Card className="mt-6 sm:mt-8 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  Ticket Details
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 rounded-xl">
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                        No
                      </th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                        Ticket ID
                      </th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                        Station ID
                      </th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                        Station Type
                      </th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                        Issue Description
                      </th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                        Issue Type
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticketData.map((ticket) => (
                      <tr key={ticket.id} className="border-b border-gray-200">
                        <td className="p-2 sm:p-3 text-gray-700">
                          {ticket.id}
                        </td>
                        <td className="p-2 sm:p-3 text-gray-700">
                          {ticket.ticket_id}
                        </td>
                        <td className="p-2 sm:p-3 text-gray-700">
                          {ticket.station_id}
                        </td>
                        <td className="p-2 sm:p-3 text-gray-700">
                          {ticket.station_type}
                        </td>
                        <td className="p-2 sm:p-3 text-gray-700">
                          {ticket.issue_description}
                        </td>
                        <td className="p-2 sm:p-3 text-gray-700">
                          {ticket.issue_type}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
