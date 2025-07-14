"use client";

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
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

interface BarChartData {
  issue_type: string;
  count: number;
}

interface BarChartCardProps {
  title: string;
  selectedYear: string;
  barChartData: BarChartData[];
}

const BarChartCard: React.FC<BarChartCardProps> = ({
  title,
  selectedYear,
  barChartData,
}) => {
  const colorMap: { [key: string]: string } = {
    SOFTWARE: "rgb(72, 128, 255)", // Blue
    HARDWARE: "rgb(72, 128, 255)", // Blue
    DISPENSER: "rgb(254, 197, 61)", // Yellow
    ABA: "rgb(254, 197, 61)", // Yellow
    NETWORK: "rgb(254, 197, 61)", // Yellow
    ATG: "rgb(254, 197, 61)", // Yellow
    FLEETCARD: "rgb(254, 197, 61)", // Yellow
    POWER: "rgb(254, 197, 61)", // Yellow
    Unknown: "rgb(128, 128, 128)", // Gray
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
        {barChartData.length === 0 ? (
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
                      colorMap[data.issue_type.toUpperCase()] || colorMap.Unknown
                    ),
                    borderColor: barChartData.map((data) =>
                      colorMap[data.issue_type.toUpperCase()] || colorMap.Unknown
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
                      return typeof value === "number" && value > 0;
                    },
                    formatter: (value: number) => value.toString(),
                    font: { weight: "bold", size: 12 },
                    color: "#333",
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    borderRadius: 4,
                    padding: 4,
                    anchor: "end",
                    align: "top",
                    offset: 4,
                    clamp: true,
                  },
                  tooltip: {
                    enabled: true,
                    callbacks: {
                      label: (context) => `${context.label}: ${context.raw} tickets`,
                    },
                  },
                },
                scales: {
                  y: { beginAtZero: true, ticks: { stepSize: 5 } },
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