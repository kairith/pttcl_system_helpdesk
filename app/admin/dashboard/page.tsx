"use client";
import React, { useState, useEffect } from "react";
import Header from "@/app/components/common/Header";
import Card from "@/app/components/common/Card";
import Dropdown from "@/app/components/ui/Dropdown";
import Image from "next/image";
import NavSlide from "@/app/components/navbar/navbar";
interface TicketData {
  id: number;
  ticketId: string;
  province: string;
  stationId: string;
  stationType: string;
  issueDescription: string;
  issueType: string;
}
interface ChartData {
  month: string;
  value: number;
}
const Dashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("October");
  const [ticketData, setTicketData] = useState<TicketData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  useEffect(() => {
    // Initialize ticket data
    setTicketData([
      {
        id: 1,
        ticketId: "POS2503000004",
        province: "Takeo",
        stationId: "F611",
        stationType: "COCO",
        issueDescription: "Error change payment type",
        issueType: "Software",
      },
      {
        id: 2,
        ticketId: "POS2503000001",
        province: "Phnom Penh",
        stationId: "F001",
        stationType: "COCO",
        issueDescription: "Machine",
        issueType: "Hardware",
      },
      {
        id: 3,
        ticketId: "POS2503000003",
        province: "Phnom Penh",
        stationId: "F601",
        stationType: "COCO",
        issueDescription: "System Crash",
        issueType: "Software",
      },
    ]);
    // Initialize chart data
    setChartData([
      { month: "Jan", value: 10 },
      { month: "Feb", value: 15 },
      { month: "Mar", value: 20 },
      { month: "Apr", value: 25 },
      { month: "May", value: 67 },
      { month: "Jun", value: 30 },
      { month: "Jul", value: 35 },
      { month: "Aug", value: 40 },
      { month: "Sep", value: 45 },
      { month: "Oct", value: 50 },
      { month: "Nov", value: 55 },
      { month: "Dec", value: 60 },
    ]);
  }, []);
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  const statsCards = [
    {
      title: "open",
      value: "100",
      trend: "8.5% Up from yesterday",
      trendType: "positive",
      icon: "/images/img_ticket_1.png",
      bgColor: "bg-purple-100",
    },
    {
      title: "on hold",
      value: "50",
      trend: "1.3% Up from past week",
      trendType: "positive",
      icon: "/images/img_icon_yellow_700.svg",
      bgColor: "bg-yellow-100",
    },
    {
      title: "in progress",
      value: "20",
      trend: "4.3% Down from yesterday",
      trendType: "negative",
      icon: "/images/img_icon.svg",
      bgColor: "bg-green-100",
    },
    {
      title: "close",
      value: "30",
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
                <Image
                  src="/images/img_separator.svg"
                  alt="Chart background"
                  width={1070}
                  height={1199}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="relative z-10">
                  <Image
                    src="/images/img_graph.png"
                    alt="Graph"
                    width={997}
                    height={195}
                    className="w-full h-48"
                  />
                  <Image
                    src="/images/img_point.svg"
                    alt="Data points"
                    width={937}
                    height={205}
                    className="absolute top-0 left-0 w-full h-48"
                  />
                  <div className="absolute top-8 left-1/3">
                    <Image
                      src="/images/img_combined_shape.svg"
                      alt="Tooltip"
                      width={79}
                      height={27}
                    />
                    <span className="absolute top-1 left-2 text-white text-xs font-bold">
                      67.00000
                    </span>
                  </div>
                </div>
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
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-sm text-gray-600 font-bold">
                      <span>200</span>
                      <span>125</span>
                      <span>100</span>
                      <span>50</span>
                      <span>10</span>
                    </div>
                    {/* Chart area */}
                    <div className="ml-12 h-full flex items-end justify-between">
                      {/* ABA */}
                      <div className="flex flex-col items-center">
                        <div className="bg-yellow-400 w-12 h-24 rounded-t"></div>
                        <span className="text-sm mt-2">ABA</span>
                      </div>
                      {/* ATG */}
                      <div className="flex flex-col items-center">
                        <div className="bg-yellow-400 w-12 h-32 rounded-t"></div>
                        <span className="text-sm mt-2">ATG</span>
                      </div>
                      {/* Dispenser */}
                      <div className="flex flex-col items-center">
                        <div className="bg-yellow-400 w-12 h-24 rounded-t"></div>
                        <span className="text-sm mt-2">Dispenser</span>
                      </div>
                      {/* FleetCard */}
                      <div className="flex flex-col items-center">
                        <div className="bg-yellow-400 w-12 h-16 rounded-t"></div>
                        <span className="text-sm mt-2">FleetCard</span>
                      </div>
                      {/* Hardware */}
                      <div className="flex flex-col items-center">
                        <div className="bg-blue-500 w-12 h-40 rounded-t"></div>
                        <span className="text-sm mt-2">Hardware</span>
                      </div>
                      {/* Software */}
                      <div className="flex flex-col items-center">
                        <div className="bg-blue-500 w-12 h-36 rounded-t"></div>
                        <span className="text-sm mt-2">Software</span>
                      </div>
                      {/* Network */}
                      <div className="flex flex-col items-center">
                        <div className="bg-blue-500 w-12 h-48 rounded-t"></div>
                        <span className="text-sm mt-2">Network</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Pie Chart */}
                {/* Doughnut Chart */}
                <div className="w-96 relative">
                  <div className="relative w-96 h-96">
                    {/* Blue circle (67%) */}
                    <div className="absolute inset-0 w-96 h-96 rounded-full bg-blue-500"></div>

                    {/* Yellow circle (33%) */}
                    <div
                      className="absolute top-0 right-0 w-96 h-96 rounded-full bg-yellow-400"
                      style={{
                        clipPath: "polygon(50% 50%, 100% 0%, 100% 100%)",
                      }}
                    ></div>

                    {/* Inner white circle for doughnut hole */}
                    <div className="absolute inset-20 w-56 h-56 rounded-full bg-white z-10"></div>

                    {/* Percentage labels */}
                    <div className="absolute top-16 right-8 bg-white bg-opacity-70 rounded-2xl px-4 py-2 shadow-lg z-20">
                      <span className="text-2xl font-bold text-yellow-400">
                        33%
                      </span>
                    </div>
                    <div className="absolute bottom-32 left-8 bg-white bg-opacity-70 rounded-2xl px-4 py-2 shadow-lg z-20">
                      <span className="text-2xl font-bold text-blue-500">
                        67%
                      </span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex justify-center mt-4 space-x-8">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                      <span className="text-sm font-bold text-blue-500">
                        PTT Digital
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-400 rounded mr-2"></div>
                      <span className="text-sm font-bold text-yellow-400">
                        Third Party
                      </span>
                    </div>
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
                        Province
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
                        <td className="p-3 text-gray-700">{ticket.ticketId}</td>
                        <td className="p-3 text-gray-700">{ticket.province}</td>
                        <td className="p-3 text-gray-700">
                          {ticket.stationId}
                        </td>
                        <td className="p-3 text-gray-700">
                          {ticket.stationType}
                        </td>
                        <td className="p-3 text-gray-700">
                          {ticket.issueDescription}
                        </td>
                        <td className="p-3 text-gray-700">
                          {ticket.issueType}
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
