// app/components/Dashboard_components/StatsCards.tsx
import Image from "next/image";
import Card from "@/app/frontend/components/common/Card/Card";

interface StatsData {
  open: number;
  on_hold: number;
  in_progress: number;
  close: number;
}

interface StatsCardsProps {
  stats: StatsData;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const statsCards = [
    {
      title: "Open",
      value: stats.open.toString(),
      trend: "8.5% Up from yesterday",
      trendType: "positive",
      icon: "/images/img_ticket_1.png",
      bgColor: "bg-purple-100",
    },
    {
      title: "On Hold",
      value: stats.on_hold.toString(),
      trend: "1.3% Up from past week",
      trendType: "positive",
      icon: "/images/img_icon_yellow_700.svg",
      bgColor: "bg-yellow-100",
    },
    {
      title: "In Progress",
      value: stats.in_progress.toString(),
      trend: "4.3% Down from yesterday",
      trendType: "negative",
      icon: "/images/img_icon.svg",
      bgColor: "bg-green-100",
    },
    {
      title: "Close",
      value: stats.close.toString(),
      trend: "1.8% Up from yesterday",
      trendType: "positive",
      icon: "/images/img_check_1.png",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 pt-5">
      {statsCards.map((stat, index) => (
        <Card key={index} className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm font-medium mb-2">
                {stat.title}
              </p>
              <p className="text-xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">
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
                  width={20}
                  height={20}
                  className="mr-2"
                />
                <span
                  className={`text-xs sm:text-sm font-medium ${
                    stat.trendType === "positive" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.trend}
                </span>
              </div>
            </div>
            <div
              className={`w-12 h-12 sm:w-15 sm:h-15 rounded-full ${stat.bgColor} flex items-center justify-center`}
            >
              <Image src={stat.icon} alt={stat.title} width={32} height={32} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;