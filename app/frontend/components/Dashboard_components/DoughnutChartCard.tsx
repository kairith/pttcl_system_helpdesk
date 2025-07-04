"use client";

import { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels"; // Import the plugin
import { fetchDashboardData } from "@/app/frontend/components/Dashboard_components/All_Ticket_Chart";

ChartJS.register(ArcElement, Title, Tooltip, Legend, ChartDataLabels); // Register the plugin

interface DoughnutChartData {
  provider: string;
  percentage: number;
}

interface DoughnutChartCardProps {
  title: string;
  selectedYear: string;
}


interface TotalticketCategory {
  Total_ticket: number;
}



const DoughnutChartCard: React.FC<DoughnutChartCardProps> = ({
  title,
  selectedYear,
}) => {
  const [doughnutChartData, setDoughnutChartData] = useState<
    DoughnutChartData[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { doughnutChartData, error } = await fetchDashboardData(
          undefined,
          selectedYear
        );
        console.log(
          "DoughnutChartCard data for",
          selectedYear,
          ":",
          doughnutChartData
        );
        if (error) {
          setError(error);
          setDoughnutChartData([]);
        } else if (Array.isArray(doughnutChartData)) {
          setDoughnutChartData(doughnutChartData);
          setError(null);
        } else {
          setError("Invalid doughnut chart data format");
          setDoughnutChartData([]);
        }
      } catch (err) {
        const errorMessage = `Failed to fetch data: ${(err as Error).message}`;
        console.error(errorMessage);
        setError(errorMessage);
        setDoughnutChartData([]);
      }
    };
    loadData();
  }, [selectedYear]);

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
        {error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : doughnutChartData.length === 0 ? (
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
                  formatter: (value: number) => `${value} %`,
                  
                  font: {
                    weight: "bold",
                    size: 12,
                  },
                  anchor: "center",
                  align: "center",
                },
                tooltip: {
                  enabled: true, // Keep tooltips enabled if true for additional details on hover / no hover change to false 
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
