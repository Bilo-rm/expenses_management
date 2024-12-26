from flask import Flask, jsonify, request
import requests
from datetime import datetime

app = Flask(__name__)

# Helper Functions
def fetch_expenses(token):
    """Fetch expenses from the Expenses Service."""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"http://localhost:4000/api/expenses", headers=headers)
        response.raise_for_status()
        print("Fetched Expenses:", response.json())  # Debug line
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
    # Extract token from request header
    token = request.headers.get('Authorization').split("Bearer ")[-1]

    expenses = fetch_expenses(token)
    current_month = datetime.now().strftime("%Y-%m")
    filtered_expenses = [e for e in expenses if e["date"].startswith(current_month)] 

    total_expenses, category_summary = aggregate_expenses(filtered_expenses)

    return jsonify({
        "total_expenses": total_expenses,
        "category_summary": category_summary
    }), 200

@app.route('/api/home/charts', methods=['GET'])
def charts():
    """Get data for pie and line charts."""
    # Extract token from request header
    token = request.headers.get('Authorization').split("Bearer ")[-1]

    expenses = fetch_expenses(token)

    # Pie Chart Data
    _, category_summary = aggregate_expenses(expenses)
    total_expense = sum(category_summary.values())
    pie_chart = {k: (v / total_expense) * 100 for k, v in category_summary.items()}

    # Line Chart Data
    line_chart = calculate_trends(expenses)

    return jsonify({
        "pie_chart": pie_chart,
        "line_chart": line_chart
    }), 200

@app.route('/api/home/insights', methods=['GET'])
def insights():
    """Get spending insights."""
    # Extract token from request header
    token = request.headers.get('Authorization').split("Bearer ")[-1]

    expenses = fetch_expenses(token)

    # Calculate largest spending category
    _, category_summary = aggregate_expenses(expenses)
    largest_spending_category = max(category_summary, key=category_summary.get)

    # Calculate days with highest spending
    trend_data = calculate_trends(expenses)
    trend_data.sort(key=lambda x: x["total"], reverse=True)
    highest_spending_days = trend_data[:3]  # Top 3 days

    return jsonify({
        "largest_spending_category": largest_spending_category,
        "highest_spending_days": highest_spending_days
    }), 200

# Run the app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
