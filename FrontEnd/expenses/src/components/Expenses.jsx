import React, { useEffect, useState } from "react";
import api from "../services/api";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "",
    date: "",
  });
  const [editingExpense, setEditingExpense] = useState(null);

  // Fetch expenses on component mount
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await api.get("/expenses");
        setExpenses(response.data);
      } catch (error) {
        alert("Failed to fetch expenses. Please try again later.");
      }
    };
    fetchExpenses();
  }, []);

  // Handle input changes for new or editing expenses
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingExpense) {
      setEditingExpense({ ...editingExpense, [name]: value });
    } else {
      setNewExpense({ ...newExpense, [name]: value });
    }
  };

  // Add a new expense
// Add a new expense
const handleAddExpense = async () => {
  if (!newExpense.description || !newExpense.amount || !newExpense.category || !newExpense.date) {
    alert("All fields are required!");
    return;
  }

  const payload = {
    description: newExpense.description,
    amount: parseFloat(newExpense.amount), // Convert amount to number
    category: newExpense.category,
    date: newExpense.date
  };

  try {
    const response = await api.post("/expenses", payload);
    setExpenses([...expenses, response.data]); // Update the local expenses state
    setNewExpense({ description: "", amount: "", category: "", date: "" }); // Reset form
  } catch (error) {
    console.error("Error adding expense:", error);
    alert("Failed to add expense. Please check your input and try again.");
  }
}; 

  

// Edit an existing expense
const handleEditExpense = async () => {
  try {
    const payload = {
      ...editingExpense,
      amount: parseFloat(editingExpense.amount) // Ensure amount is a number
    };

    const response = await api.put(`/expenses/${editingExpense.id}`, payload);
    setExpenses(
      expenses.map((expense) =>
        expense.id === editingExpense.id ? response.data : expense
      )
    );
    setEditingExpense(null);
  } catch (error) {
    console.error("Error editing expense:", error);
    alert("Failed to edit expense. Please try again.");
  }
};
  // Delete an expense
  const handleDeleteExpense = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(expenses.filter((expense) => expense.id !== id));
    } catch (error) {
      alert("Failed to delete expense. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Expenses</h1>

      {/* Expense Form */}
      <div className="mb-6">
        <h2 className="text-xl mb-4">{editingExpense ? "Edit Expense" : "Add Expense"}</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={editingExpense ? editingExpense.description : newExpense.description}
            onChange={handleInputChange}
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={editingExpense ? editingExpense.amount : newExpense.amount}
            onChange={handleInputChange}
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={editingExpense ? editingExpense.category : newExpense.category}
            onChange={handleInputChange}
            className="p-2 border rounded"
          />
          <input
            type="date"
            name="date"
            value={editingExpense ? editingExpense.date : newExpense.date}
            onChange={handleInputChange}
            className="p-2 border rounded"
          />
        </div>
        <button
          onClick={editingExpense ? handleEditExpense : handleAddExpense}
          className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
        >
          {editingExpense ? "Update Expense" : "Add Expense"}
        </button>
        {editingExpense && (
          <button
            onClick={() => setEditingExpense(null)}
            className="bg-gray-500 text-white px-4 py-2 mt-4 ml-4 rounded"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Expense Table */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Date</th>
            <th className="border border-gray-300 px-4 py-2">Category</th>
            <th className="border border-gray-300 px-4 py-2">Amount</th>
            <th className="border border-gray-300 px-4 py-2">Description</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id} className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2">{expense.date}</td>
              <td className="border border-gray-300 px-4 py-2">{expense.category}</td>
              <td className="border border-gray-300 px-4 py-2">${expense.amount}</td>
              <td className="border border-gray-300 px-4 py-2">{expense.description}</td>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  onClick={() => setEditingExpense(expense)}
                  className="bg-yellow-500 text-white px-2 py-1 mr-2 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteExpense(expense.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Expenses;
