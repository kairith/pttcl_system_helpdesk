"use client";
import React, { useState, useEffect } from "react";
import Header from "@/app/components/common/Header";
import Card from "@/app/components/common/Card";
import Dropdown from "@/app/components/ui/Dropdown";
import Image from "next/image";
import NavSlide from "@/app/components/navbar/navbar";
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

const Dashboard: React.FC = () => {
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
      // Fetch stats for cards
      const countResult = await fetchTicketsCount(selectedPeriod);
      if (countResult.error) {
        setError(countResult.error);
      } else {
        setStats(countResult.stats);
      }

      // Fetch tickets, chart data, bar chart data, and doughnut chart data
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
      <Header />
      <div className="flex">
        <NavSlide />
        <main className="flex-1 p-8 ml-60">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsCards.map((stat, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium mb-2">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-800 mb-4">
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
                          width={24}
                          height={23}
                          className="mr-2"
                        />
                        <span
                          className={`text-sm font-medium ${
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
                      className={`w-15 h-15 rounded-full ${stat.bgColor} flex items-center justify-center`}
                    >
                      <Image
                        src={stat.icon}
                        alt={stat.title}
                        width={40}
                        height={40}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            {/* Total Ticket Chart */}
            <Card className="mb-8 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Total Ticket
                </h2>
                <Dropdown
                  options={["October", "November", "December"]}
                  value={selectedPeriod}
                  onChange={handlePeriodChange}
                  className="bg-gray-50 border border-gray-300 rounded px-4 py-2"
                />
              </div>
              <div className="relative h-96">
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
                  height={300}
                />
              </div>
            </Card>
            {/* Ticket Summary */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Ticket Summary
              </h2>
              <div className="flex">
                {/* Bar Chart */}
                <div className="flex-1 mr-8">
                  <div className="relative h-96">
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
                              // Remove stepSize
                              // Use callback to display specific tick labels
                              callback: function (value) {
                                // Define which ticks to show
                                if ([0, 15, 30, 45].includes(Number(value))) {
                                  return value;
                                }
                                // Otherwise, hide tick
                                return null;
                              },
                            },
                          },
                        },
                      }}
                      height={300}
                    />
                  </div>
                </div>
                {/* Doughnut Chart */}
                <div className="w-96 relative">
                  <div className="relative w-96 h-96">
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
                          title: {
                            display: true,
                            text: "Tickets by issue type",
                          },
                        },
                      }}
                      height={300}
                    />
                  </div>
                </div>
              </div>
            </Card>
            {/* Ticket Details Table */}
            <Card className="mt-8 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Ticket Details
                </h2>
                <Dropdown
                  options={["October", "November", "December"]}
                  value={selectedPeriod}
                  onChange={handlePeriodChange}
                  className="bg-gray-50 border border-gray-300 rounded px-4 py-2"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 rounded-xl">
                      <th className="text-left p-3 font-bold text-gray-800">
                        No
                      </th>
                      <th className="text-left p-3 font-bold text-gray-800">
                        Ticket ID
                      </th>

                      <th className="text-left p-3 font-bold text-gray-800">
                        Station ID
                      </th>
                      <th className="text-left p-3 font-bold text-gray-800">
                        Station Type
                      </th>
                      <th className="text-left p-3 font-bold text-gray-800">
                        Issue Description
                      </th>
                      <th className="text-left p-3 font-bold text-gray-800">
                        Issue Type
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticketData.map((ticket) => (
                      <tr key={ticket.id} className="border-b border-gray-200">
                        <td className="p-3 text-gray-700">{ticket.id}</td>
                        <td className="p-3 text-gray-700">
                          {ticket.ticket_id}
                        </td>

                        <td className="p-3 text-gray-700">
                          {ticket.station_id}
                        </td>
                        <td className="p-3 text-gray-700">
                          {ticket.station_type}
                        </td>
                        <td className="p-3 text-gray-700">
                          {ticket.issue_description}
                        </td>
                        <td className="p-3 text-gray-700">
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
