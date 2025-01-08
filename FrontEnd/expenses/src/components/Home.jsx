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

  if (!summary || !charts) return <div className="p-8">Loading...</div>;

  // Summary data for display (Total expenses and category breakdown)
  const categoryLabels = Object.keys(summary.category_summary);
  const categoryValues = Object.values(summary.category_summary);

  const pieData = {
    labels: Object.keys(charts.pie_chart),
    datasets: [
      {
        data: Object.values(charts.pie_chart),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
      },
    ],
  };

  const lineData = {
    labels: charts.line_chart.map((entry) => entry.date),
    datasets: [
      {
        label: "Total Expenses",
        data: charts.line_chart.map((entry) => entry.total),
        borderColor: "#36A2EB",
        fill: false,
        tension: 0.1,
        borderWidth: 3,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-4xl font-semibold text-gray-800 mb-8 text-center">
          Expense Manager Dashboard
        </h1>

        {/* Category Summary Block */}
        <div className="bg-white mb-8 p-6 rounded-lg shadow-xl transform transition-all hover:scale-105 duration-300 ease-in-out">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Category Summary</h2>

          {/* Flexbox for Category Summary */}
          <div className="flex flex-wrap gap-6 justify-start">
            {categoryLabels.map((category, index) => (
              <div key={index} className="bg-blue-50 p-4 rounded-lg shadow-md flex flex-col items-center w-40">
                <p className="text-lg font-semibold text-gray-800">{category}</p>
                <p className="text-xl text-blue-600">${categoryValues[index]}</p>
              </div>
            ))}
          </div>

          <p className="text-xl font-bold text-gray-900 mt-4">
            Total Expenses:{" "}
            <span className="text-blue-600">${summary.total_expenses}</span>
          </p>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow-xl transform transition-all hover:scale-105 duration-300 ease-in-out">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Category Distribution</h2>
            <Pie data={pieData} />
          </div>

          {/* Line Chart */}
          <div className="bg-white p-6 rounded-lg shadow-xl transform transition-all hover:scale-105 duration-300 ease-in-out">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Expenses Over Time</h2>
            <Line data={lineData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
