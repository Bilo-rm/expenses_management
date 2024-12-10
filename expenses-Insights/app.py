from flask import Flask, jsonify, request
import requests
from datetime import datetime

app = Flask(__name__)

# Mock data for testing
"""
MOCK_EXPENSES = [
    {"expense": "Groceries", "amount": 50, "date": "2024-10-01", "category": "Food"},
    {"expense": "Dining Out", "amount": 30, "date": "2024-12-02", "category": "Food"},
    {"expense": "Gas", "amount": 40, "date": "2024-11-03", "category": "Transport"},
    {"expense": "Electricity Bill", "amount": 100, "date": "2024-12-04", "category": "Utilities"},
    {"expense": "Internet", "amount": 60, "date": "2024-12-04", "category": "Utilities"},
    {"expense": "Movie Tickets", "amount": 20, "date": "2024-12-05", "category": "Entertainment"},
]
"""
# Helper Functions
def fetch_expenses():
    """Fetch expenses from the Expenses Service."""
    try:
        response = requests.get(f"http://localhost:8080/expenses")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching expenses: {e}")
        return []

# Helper Functions
def aggregate_expenses(expenses):
    """Aggregate expenses by category."""
    category_summary = {}
    total_expenses = 0

    for expense in expenses:
        category = expense.get("category", "Other")
        amount = expense.get("amount", 0)
        category_summary[category] = category_summary.get(category, 0) + amount
        total_expenses += amount

    return total_expenses, category_summary

def calculate_trends(expenses):
    """Prepare data for line chart."""
    trend_data = {}
    for expense in expenses:
        date = expense["date"]
        amount = expense["amount"]
        trend_data[date] = trend_data.get(date, 0) + amount

    trend_data = [{"date": key, "total": value} for key, value in sorted(trend_data.items())]
    return trend_data

# Endpoints

@app.route('/api/home/summary', methods=['GET'])
def summary():
    """Get total expenses and category summary for the current month."""
    # Mocking user_id and expenses
    user_id = "mock_user"
    """change  expenses to get data from fetch_expenses() not MOCK_EXPENSES"""
    expenses = fetch_expenses()
    current_month = datetime.now().strftime("%Y-%m")
    """change filter expenses to get data from expenses not MOCK_EXPENSES"""
    filtered_expenses = [e for e in expenses  if e["date"].startswith(current_month)] 

    total_expenses, category_summary = aggregate_expenses(filtered_expenses)

    return jsonify({
        "user_id": user_id,
        "total_expenses": total_expenses,
        "category_summary": category_summary
    }), 200

@app.route('/api/home/charts', methods=['GET'])
def charts():
    """Get data for pie and line charts."""
    # Mocking user_id and expenses
    user_id = "mock_user"
    """change  expenses to get data from fetch_expenses() not MOCK_EXPENSES"""
    expenses = fetch_expenses()

    # Pie Chart Data
    _, category_summary = aggregate_expenses(expenses)
    total_expense = sum(category_summary.values())
    pie_chart = {k: (v / total_expense) * 100 for k, v in category_summary.items()}

    # Line Chart Data
    line_chart = calculate_trends(expenses)

    return jsonify({
        "user_id": user_id,
        "pie_chart": pie_chart,
        "line_chart": line_chart
    }), 200

@app.route('/api/home/insights', methods=['GET'])
def insights():
    """Get spending insights."""
    # Mocking user_id and expenses
    user_id = "mock_user"
    """change  expenses to get data from fetch_expenses() not MOCK_EXPENSES"""
    expenses = fetch_expenses()

    # Calculate largest spending category
    _, category_summary = aggregate_expenses(expenses)
    largest_spending_category = max(category_summary, key=category_summary.get)

    # Calculate days with highest spending
    trend_data = calculate_trends(expenses)
    trend_data.sort(key=lambda x: x["total"], reverse=True)
    highest_spending_days = trend_data[:3]  # Top 3 days

    return jsonify({
        "user_id": user_id,
        "largest_spending_category": largest_spending_category,
        "highest_spending_days": highest_spending_days
    }), 200

# Run the app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
