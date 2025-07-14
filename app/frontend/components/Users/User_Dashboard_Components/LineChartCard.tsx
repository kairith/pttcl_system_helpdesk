"use client";

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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ChartData {
  month: string;
  value: number;
}

interface LineChartCardProps {
  title: string;
  selectedYear: string;
  chartData: ChartData[];
}

const LineChartCard: React.FC<LineChartCardProps> = ({
  title,
  selectedYear,
  chartData,
}) => {
  const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedData = allMonths.map((month) => {
    const data = chartData.find((d) => d.month === month);
    return { month, value: data ? data.value : 0 };
  });

  return (
    <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
        {title}
      </h3>
      <div className="relative h-80 sm:h-96">
        {chartData.length === 0 ? (
          <p className="text-gray-500 text-center">
            No tickets found for {selectedYear === "ALL" ? "all years" : selectedYear}
          </p>
        ) : (
          <Line
            data={{
              labels: formattedData.map((item) => item.month),
              datasets: [
                {
                  label: `Tickets in ${selectedYear === "ALL" ? "All Years" : selectedYear}`,
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
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "top" },
                title: {
                  display: true,
                  text: `${title} - ${selectedYear === "ALL" ? "All Years" : selectedYear}`,
                  font: { size: 18, family: "'Inter', sans-serif", weight: "bold" },
                  color: "#1F2937",
                  padding: { top: 10, bottom: 20 },
                },
                tooltip: {
                  backgroundColor: "rgba(31, 41, 55, 0.9)",
                  titleFont: { size: 14, family: "'Inter', sans-serif" },
                  bodyFont: { size: 12, family: "'Inter', sans-serif" },
                  padding: 10,
                  cornerRadius: 6,
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: "Month",
                    font: { size: 14, family: "'Inter', sans-serif" },
                    color: "#1F2937",
                  },
                  ticks: { font: { size: 12, family: "'Inter', sans-serif" }, color: "#4B5563" },
                  grid: { display: false },
                },
                y: {
                  title: {
                    display: true,
                    text: "Number of Tickets",
                    font: { size: 14, family: "'Inter', sans-serif" },
                    color: "#1F2937",
                  },
                  ticks: {
                    font: { size: 12, family: "'Inter', sans-serif" },
                    color: "#4B5563",
                    stepSize: 5,
                  },
                  beginAtZero: true,
                  grid: { color: "#E5E7EB" },
                },
              },
            }}
          />
        )}
      </div>
    </div>
  );
};

export default LineChartCard;