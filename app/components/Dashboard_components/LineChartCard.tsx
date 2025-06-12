// app/components/LineChartCard.tsx
"use client";

import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { fetchDashboardData } from "@/app/components/Dashboard_components/All_Ticket_Chart";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ChartData {
  month: string;
  value: number;
}

interface LineChartCardProps {
  title: string;
}

const LineChartCard: React.FC<LineChartCardProps> = ({ title }) => {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadChartData() {
      try {
        const { chartData, error } = await fetchDashboardData(undefined, selectedYear);
        console.log("LineChartCard received chartData for", selectedYear, ":", chartData);
        setChartData(chartData);
        setError(error);
      } catch (err) {
        setError("Failed to load chart data.");
      }
    }
    loadChartData();
  }, [selectedYear]);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
  };

  // Ensure all months are displayed, even with zero tickets
  const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedData = allMonths.map((month) => {
    const data = chartData.find((d) => d.month === month);
    return { month, value: data ? data.value : 0 };
  });

  if (error) {
    return (
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
    );
  }

  const chartConfig = {
    data: {
      labels: formattedData.map((item) => item.month),
      datasets: [
        {
          label: `Tickets Opened in ${selectedYear}`,
          data: formattedData.map((item) => item.value),
          fill: true,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.5,
          pointRadius: 5,
          pointHoverRadius: 6,
          pointBackgroundColor: "rgb(255, 255, 255)",
          pointBorderColor: "rgb(59, 130, 246)",
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top" as const,
          labels: {
            font: {
              size: 14,
              family: "'Inter', sans-serif",
            },
            color: "#1F2937",
          },
        },
        title: {
          display: true,
          // text: `${title} : ${selectedYear}`,
          font: {
            size: 18,
            family: "'Inter', sans-serif",
            weight: "bold" as const,
          },
          color: "#1F2937",
          padding: {
            top: 10,
            bottom: 20,
          },
        },
        tooltip: {
          backgroundColor: "rgba(31, 41, 55, 0.9)",
          titleFont: {
            size: 14,
            family: "'Inter', sans-serif",
          },
          bodyFont: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          padding: 10,
          cornerRadius: 6,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Month",
            font: {
              size: 14,
              family: "'Inter', sans-serif",
            },
            color: "#1F2937",
          },
          ticks: {
            font: {
              size: 12,
              family: "'Inter', sans-serif",
            },
            color: "#4B5563",
          },
          grid: {
            display: false,
          },
        },
        y: {
          title: {
            display: true,
            text: "Number of Tickets",
            font: {
              size: 14,
              family: "'Inter', sans-serif",
            },
            color: "#1F2937",
          },
          ticks: {
            font: {
              size: 12,
              family: "'Inter', sans-serif",
            },
            color: "#4B5563",
            stepSize: 5,
            beginAtZero: true,
          },
          grid: {
            color: "#E5E7EB",
          },
        },
      },
    },
  };

  return (
    <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-4 sm:mb-0">
          {title}
        </h1>
        <select
          value={selectedYear}
          onChange={(e) => handleYearChange(e.target.value)}
          className="w-full sm:w-48 px-2 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
      </div>
      <div className="relative h-80 sm:h-96">
        {chartData.length === 0 ? (
          <p className="text-gray-500 text-center">No tickets found for {selectedYear}</p>
        ) : (
          <Line data={chartConfig.data} options={chartConfig.options} />
        )}
      </div>
    </div>
  );
};

export default LineChartCard;