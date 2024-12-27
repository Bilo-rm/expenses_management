import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Pie, Line } from "react-chartjs-2";
import "chart.js/auto";

const Home = () => {
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summaryResponse = await api.get("/home/summary"); // Fetch summary
        const chartsResponse = await api.get("/home/charts"); // Fetch charts data
        setSummary(summaryResponse.data); // Set the summary state
        setCharts(chartsResponse.data); // Set the charts data state
      } catch (error) {
        alert("Failed to fetch data. Please try again later.");
      }
    };
    fetchData();
  }, []);

  if (!summary || !charts) return <div>Loading...</div>;

  // Summary data for display (Total expenses and category breakdown)
  const categoryLabels = Object.keys(summary.category_summary); // e.g., ['electronics']
  const categoryValues = Object.values(summary.category_summary); // e.g., [520]

  const pieData = {
    labels: Object.keys(charts.pie_chart), // e.g., ['bashar', 'electronics']
    datasets: [
      {
        data: Object.values(charts.pie_chart), // e.g., [91.39, 8.61]
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"], // Customize colors as needed
      },
    ],
  };

  // Line chart data
  const lineData = {
    labels: charts.line_chart.map((entry) => entry.date), // Extract dates from line chart data
    datasets: [
      {
        label: "Total Expenses",
        data: charts.line_chart.map((entry) => entry.total), // Extract totals for the line chart
        borderColor: "#36A2EB",
        fill: false,
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to Expense Manager</h1>

      {/* Category Summary Block */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Category Summary</h2>
        {categoryLabels.map((category, index) => (
          <p key={index} className="text-xl">
            {category}: ${categoryValues[index]}
          </p>
        ))}
        <p className="text-xl font-bold">Total Expenses: ${summary.total_expenses}</p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Category Distribution</h2>
          <Pie data={pieData} />
        </div>

        {/* Line Chart */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Expenses Over Time</h2>
          <Line data={lineData} />
        </div>
      </div>
    </div>
  );
};

export default Home;
