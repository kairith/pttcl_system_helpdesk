// app/components/Dashboard_components/TicketChart.tsx
"use client";

import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { fetchDashboardData } from "@/app/frontend/components/Dashboard_components/All_Ticket_Chart";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ChartData {
  month: string;
  value: number;
}

interface TicketChartProps {
  title: string;
}

const TicketChart: React.FC<TicketChartProps> = ({ title }) => {
  const [selectedYear, setSelectedYear] = useState<string>("2024");
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { chartData, error } = await fetchDashboardData(undefined, selectedYear);
        console.log("TicketChart received chartData for", selectedYear, ":", chartData);
        if (error) {
          setError(error);
          setChartData([]);
        } else if (Array.isArray(chartData)) {
          setChartData(chartData);
          setError(null);
        } else {
          setError("Invalid chart data format");
          setChartData([]);
        }
      } catch (err) {
        const errorMessage = `Failed to fetch data: ${(err as Error).message}`;
        console.error(errorMessage);
        setError(errorMessage);
        setChartData([]);
      }
    };
    loadData();
  }, [selectedYear]);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
  };

  const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedData = allMonths.map((month) => {
    const data = chartData.find((d) => d.month === month);
    return { month, value: data ? data.value : 0 };
  });

  return (
    <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white shadow rounded-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
          {title}
        </h2>
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
      <div className="relative w-full h-64 sm:h-80">
        {error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : chartData.length === 0 ? (
          <p className="text-gray-500 text-center">No tickets found for {selectedYear}</p>
        ) : (
          <Bar
            data={{
              labels: formattedData.map((data) => data.month),
              datasets: [
                {
                  label: `Tickets in ${selectedYear}`,
                  data: formattedData.map((data) => data.value),
                  backgroundColor: "rgba(59, 130, 246, 0.6)",
                  borderColor: "rgb(59, 130, 246)",
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: `${title} - ${selectedYear}` },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { stepSize: 5 },
                },
              },
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TicketChart;