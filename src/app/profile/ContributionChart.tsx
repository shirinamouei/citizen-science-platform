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
  const total = data[data.length - 1] ?? 0;
  const summary = `Line chart of your cumulative contributions over time. ${total} total ${
    total === 1 ? "contribution" : "contributions"
  } across ${labels.length} ${labels.length === 1 ? "date" : "dates"}, from ${labels[0]} to ${
    labels[labels.length - 1]
  }. The same entries are listed in the Upload history table below.`;
  return (
    <Line
      role="img"
      aria-label={summary}
      data={{
        labels,
        datasets: [
          {
            label: "Total contributions",
            data,
            borderColor: "#B35F00",
            backgroundColor: "rgba(255,149,0,0.12)",
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointBackgroundColor: "#B35F00",
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#4b5b76", font: { size: 11 } } },
          y: {
            beginAtZero: true,
            ticks: { precision: 0, color: "#4b5b76", font: { size: 11 } },
            grid: { color: "#d5dcec" },
          },
        },
      }}
    />
  );
}
