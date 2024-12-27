import React, { useEffect, useState } from "react";
import api from "../services/api";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await api.get("/expenses"); // Fetch all expenses
        setExpenses(response.data);
      } catch (error) {
        alert("Failed to fetch expenses. Please try again later.");
      }
    };
    fetchExpenses();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Expenses</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Date</th>
            <th className="border border-gray-300 px-4 py-2">Category</th>
            <th className="border border-gray-300 px-4 py-2">Amount</th>
            <th className="border border-gray-300 px-4 py-2">Description</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id} className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2">{expense.date}</td>
              <td className="border border-gray-300 px-4 py-2">{expense.category}</td>
              <td className="border border-gray-300 px-4 py-2">${expense.amount}</td>
              <td className="border border-gray-300 px-4 py-2">{expense.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Expenses;
