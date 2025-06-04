// LineChartCard.tsx
"use client";
import React, { useState, useEffect } from "react";
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
import { TicketCount } from "@/app/lib/types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface LineChartCardProps {
  title: string;
}

const LineChartCard: React.FC<LineChartCardProps> = ({ title }) => {
  const [chartData, setChartData] = useState<TicketCount[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadChartData() {
      try {
        const response = await fetch("/api/data");
        if (!response.ok) throw new Error("Failed to fetch data");
        const data: TicketCount[] = await response.json();
        setChartData(data);
      } catch (err) {
        setError("Failed to load chart data.");
      }
    }
    loadChartData();
  }, []);

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
    type: "line" as const,
    data: {
      labels: chartData.map((item) => item.month),
      datasets: [
        {
          label: "Tickets Opened in 2024",
          data: chartData.map((item) => item.value),
          fill: true,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          tension: 0.4,
          pointRadius: 4,
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
          text: title,
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
            stepSize: 1,
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
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-4 sm:mb-6">
        {title}
      </h1>
      <div className="relative h-80 sm:h-96">
        <Line data={chartConfig.data} options={chartConfig.options} />
      </div>
    </div>
  );
};

export default LineChartCard;