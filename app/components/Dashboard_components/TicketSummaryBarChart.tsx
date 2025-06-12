// app/components/Dashboard_components/BarChartCard.tsx
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
import { fetchDashboardData } from "@/app/components/Dashboard_components/All_Ticket_Chart";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartData {
  issue_type: string;
  count: number;
}

interface BarChartCardProps {
  title: string;
  selectedYear: string;
}

const BarChartCard: React.FC<BarChartCardProps> = ({ title, selectedYear }) => {
  const [barChartData, setBarChartData] = useState<BarChartData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { barChartData, error } = await fetchDashboardData(undefined, selectedYear);
        console.log("BarChartCard received data for", selectedYear, ":", barChartData);
        if (error) {
          setError(error);
          setBarChartData([]);
        } else if (Array.isArray(barChartData)) {
          setBarChartData(barChartData);
          setError(null);
        } else {
          setError("Invalid bar chart data format");
          setBarChartData([]);
        }
      } catch (err) {
        const errorMessage = `Failed to fetch data: ${(err as Error).message}`;
        console.error(errorMessage);
        setError(errorMessage);
        setBarChartData([]);
      }
    };
    loadData();
  }, [selectedYear]);

  return (
    <div className="flex-1 p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
        {title}
      </h3>
      <div className="relative w-full h-64 sm:h-80">
        {error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : barChartData.length === 0 ? (
          <p className="text-gray-500 text-center">No data for {selectedYear === "ALL" ? "all years" : selectedYear}</p>
        ) : (
          <Bar
            data={{
              labels: barChartData.map((data) => data.issue_type),
              datasets: [
                {
                  label: "Tickets by Issue Type",
                  data: barChartData.map((data) => data.count),
                  backgroundColor: barChartData.map((data) =>
                    ["ABA", "ATG", "Dispenser", "FleetCard", "Network", "Power"].includes(data.issue_type)
                      ? "rgb(254, 197, 61)"
                      : "rgb(72, 128, 255)"
                  ),
                  borderColor: barChartData.map((data) =>
                    ["ABA", "ATG", "Dispenser", "FleetCard", "Network", "Power"].includes(data.issue_type)
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
                  text: `${title} - ${selectedYear === "ALL" ? "All Years" : selectedYear}`,
                },
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

export default BarChartCard;