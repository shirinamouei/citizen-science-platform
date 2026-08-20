"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

export default function ContributionChart({ labels, data }: { labels: string[]; data: number[] }) {
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: "Total contributions",
            data,
            borderColor: "#FF9500",
            backgroundColor: "rgba(255,149,0,0.12)",
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointBackgroundColor: "#FF9500",
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#5b6b85", font: { size: 11 } } },
          y: {
            beginAtZero: true,
            ticks: { precision: 0, color: "#5b6b85", font: { size: 11 } },
            grid: { color: "#e3e9f7" },
          },
        },
      }}
    />
  );
}
