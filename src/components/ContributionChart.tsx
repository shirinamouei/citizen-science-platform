"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  type ChartData,
  type ScriptableContext,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const data: ChartData<"line"> = {
  labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  datasets: [
    {
      label: "Uploads",
      data: [2, 5, 4, 6, 7, 4],
      borderColor: "#FF9500",
      backgroundColor: (context: ScriptableContext<"line">) => {
        const { ctx, chartArea } = context.chart;
        if (!chartArea) return undefined;
        const gradient = ctx.createLinearGradient(0, 0, 0, chartArea.bottom);
        gradient.addColorStop(0, "rgba(255,149,0,0.35)");
        gradient.addColorStop(1, "rgba(255,149,0,0.02)");
        return gradient;
      },
      fill: true,
      tension: 0.4,
      pointBackgroundColor: "#112845",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      borderWidth: 2.5,
    },
  ],
};

export default function ContributionChart() {
  return (
    <Line
      data={data}
      height={260}
      options={{
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: "#e3e9f7" }, ticks: { color: "#5b6b85", font: { size: 12 } } },
          x: { grid: { display: false }, ticks: { color: "#5b6b85", font: { size: 12 } } },
        },
      }}
    />
  );
}
