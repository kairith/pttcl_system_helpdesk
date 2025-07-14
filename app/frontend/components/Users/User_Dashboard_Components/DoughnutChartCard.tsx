"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";


ChartJS.register(ArcElement, Title, Tooltip, Legend, ChartDataLabels);

interface DoughnutChartData {
  provider: string;
  percentage: number;
  count: number;
}

interface DoughnutChartCardProps {
  title: string;
  selectedYear: string;
  doughnutChartData: DoughnutChartData[];
}

const DoughnutChartCard: React.FC<DoughnutChartCardProps> = ({
  title,
  selectedYear,
  doughnutChartData,
}) => {
  const colorMap: { [key: string]: string } = {
    PTT_Digital: "rgb(72, 128, 255)", // Blue
    Third_Party: "rgb(254, 197, 61)", // Yellow
    Unknown: "rgb(128, 128, 128)", // Gray
  };

  return (
    <div className="w-full lg:w-80 p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
        {title}
      </h3>
      <div className="relative w-full h-64 sm:h-80">
        {doughnutChartData.length === 0 ? (
          <p className="text-gray-500 text-center">
            No data for {selectedYear === "ALL" ? "all years" : selectedYear}
          </p>
        ) : (
          <Doughnut
            data={{
              labels: doughnutChartData.map((data) => data.provider),
              datasets: [
                {
                  data: doughnutChartData.map((data) => data.percentage),
                  backgroundColor: doughnutChartData.map(
                    (data) => colorMap[data.provider] || colorMap.Unknown
                  ),
                  borderColor: ["rgb(255, 255, 255)"],
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
                  text: `${title} - ${
                    selectedYear === "ALL" ? "All Years" : selectedYear
                  }`,
                },
                datalabels: {
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  borderRadius: 9,
                  padding: 4,
                  color: "#fff",
                  formatter: (value: number) => `${value}%`,
                  font: {
                    weight: "bold",
                    size: 12,
                  },
                  anchor: "center",
                  align: "center",
                },
                tooltip: {
                  enabled: true,
                  callbacks: {
                    label: (context) => `${context.label}: ${context.raw}%`,
                  },
                },
              },
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DoughnutChartCard;