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
import ChartDataLabels from "chartjs-plugin-datalabels"; // Import plugin
import { fetchDashboardData } from "@/app/frontend/components/Dashboard_components/All_Ticket_Chart";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

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

  const colorMap: { [key: string]: string } = {
    ABA: "rgb(254, 197, 61)",
    ATG: "rgb(254, 197, 61)",
    Dispenser: "rgb(254, 197, 61)",
    FleetCard: "rgb(254, 197, 61)",
    Network: "rgb(254, 197, 61)",
    Power: "rgb(254, 197, 61)",
  };

  return (
    <div
      className="flex-1 p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-200"
      role="figure"
      aria-label={`Bar chart showing ${title} for ${selectedYear === "ALL" ? "all years" : selectedYear}`}
    >
      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
        {title}
      </h3>
      <div className="relative w-full h-72 sm:h-96">
        {error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : barChartData.length === 0 ? (
          <p className="text-gray-500 text-center">
            No data for {selectedYear === "ALL" ? "all years" : selectedYear}
          </p>
        ) : (
          <>
            <Bar
              data={{
                labels: barChartData.map((data) => data.issue_type),
                datasets: [
                  {
                    label: "Tickets by Issue Type",
                    data: barChartData.map((data) => data.count),
                    backgroundColor: barChartData.map((data) =>
                      colorMap[data.issue_type] || "rgb(72, 128, 255)"
                    ),
                    borderColor: barChartData.map((data) =>
                      colorMap[data.issue_type] || "rgb(72, 128, 255)"
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
                  datalabels: {
                    display: (context) => {
                      const dataArr = context.dataset.data;
                      const value = dataArr && dataArr[context.dataIndex];
                      return typeof value === "number" && value > 0; // Show only for non-zero numeric values
                    },
                    formatter: (value: number) => value.toString(), // Display count
                    font: {
                      weight: "bold",
                      size: 12,
                    },
                    color: "#333", // Dark text for contrast
                    backgroundColor: "rgba(255, 255, 255, 0.7)", // Semi-transparent white background
                    borderRadius: 4, // Rounded corners
                    padding: 4, // Padding inside label
                    anchor: "end", // Position at top of bar
                    align: "top", // Align above the bar
                    offset: 4, // Slight offset from bar top
                    clamp: true, // Prevent overflow
                  },
                  tooltip: {
                    enabled: false, // Disable default tooltips for hover on the chart
                    callbacks: {
                      label: (context) => `${context.label}: ${context.raw} tickets`,
                    },
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
            <table className="sr-only">
              <caption>
                {title} - {selectedYear === "ALL" ? "All Years" : selectedYear}
              </caption>
              <thead>
                <tr>
                  <th>Issue Type</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {barChartData.map((data, index) => (
                  <tr key={index}>
                    <td>{data.issue_type}</td>
                    <td>{data.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default BarChartCard;