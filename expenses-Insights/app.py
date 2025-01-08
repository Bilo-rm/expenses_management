from flask import Flask, jsonify, request
import requests
from datetime import datetime
import redis
import json
import hashlib
import mysql.connector
from mysql.connector import Error

# Initialize Flask app and Redis client
app = Flask(__name__)
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)

# Database Connection
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",  # replace with your MySQL username
            password="root",  # replace with your MySQL password
            database="expense_manager"  # your MySQL database name
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def save_expenses_to_db(expenses):
    """Save raw expenses data to MySQL database."""
    connection = get_db_connection()
    if connection:
        cursor = connection.cursor()

        insert_query = """
        INSERT INTO expenses (category, amount, date, description)
        VALUES (%s, %s, %s, %s)
        """

        try:
            for expense in expenses:
                data = (expense.get("category", "Other"), 
                        expense.get("amount", 0),
                        expense.get("date", None),
                        expense.get("description", ""))
                cursor.execute(insert_query, data)
            connection.commit()
            print(f"Inserted {cursor.rowcount} rows into expenses table.")
        except Error as e:
            print(f"Error inserting data: {e}")
        finally:
            cursor.close()
            connection.close()

# Helper Functions
def fetch_expenses(token):
    """Fetch expenses from the Expenses Service and save to the database."""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"http://localhost:4000/api/expenses", headers=headers)
        response.raise_for_status()
        expenses = response.json()
        
        # Save the fetched expenses into the database
        save_expenses_to_db(expenses)

        print("Fetched and saved expenses:", expenses)  # Debug line
        return expenses
    except requests.exceptions.RequestException as e:
        print(f"Error fetching expenses: {e}")
        return []

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

def get_cache_key(token, endpoint):
    """Generate a cache key based on the token and endpoint."""
    key = f"{endpoint}:{token}"
    return hashlib.md5(key.encode('utf-8')).hexdigest()

def cache_data(key, data, expiration=3600):
    """Cache the data in Redis."""
    redis_client.setex(key, expiration, json.dumps(data))

def get_cached_data(key):
    """Get the cached data from Redis."""
    cached_data = redis_client.get(key)
    if cached_data:
        return json.loads(cached_data)
    return None

# Endpoints
@app.route('/api/home/summary', methods=['GET'])
def summary():
    """Get total expenses and category summary for the current month."""
    token = request.headers.get('Authorization').split("Bearer ")[-1]
    cache_key = get_cache_key(token, 'summary')
    cached_data = get_cached_data(cache_key)
    if cached_data:
        return jsonify(cached_data), 200

    expenses = fetch_expenses(token)
    current_month = datetime.now().strftime("%Y-%m")
    filtered_expenses = [e for e in expenses if e["date"].startswith(current_month)] 

    total_expenses, category_summary = aggregate_expenses(filtered_expenses)

    result = {
        "total_expenses": total_expenses,
        "category_summary": category_summary
    }

    cache_data(cache_key, result)

    return jsonify(result), 200

@app.route('/api/home/charts', methods=['GET'])
def charts():
    """Get data for pie and line charts."""
    token = request.headers.get('Authorization').split("Bearer ")[-1]
    cache_key = get_cache_key(token, 'charts')
    cached_data = get_cached_data(cache_key)
    if cached_data:
        return jsonify(cached_data), 200

    expenses = fetch_expenses(token)

    _, category_summary = aggregate_expenses(expenses)
    total_expense = sum(category_summary.values())
    pie_chart = {k: (v / total_expense) * 100 for k, v in category_summary.items()}

    line_chart = calculate_trends(expenses)

    result = {
        "pie_chart": pie_chart,
        "line_chart": line_chart
    }

    cache_data(cache_key, result)

    return jsonify(result), 200

@app.route('/api/home/insights', methods=['GET'])
def insights():
    """Get spending insights."""
    token = request.headers.get('Authorization').split("Bearer ")[-1]
    cache_key = get_cache_key(token, 'insights')
    cached_data = get_cached_data(cache_key)
    if cached_data:
        return jsonify(cached_data), 200

    expenses = fetch_expenses(token)

    _, category_summary = aggregate_expenses(expenses)
    largest_spending_category = max(category_summary, key=category_summary.get)

    trend_data = calculate_trends(expenses)
    trend_data.sort(key=lambda x: x["total"], reverse=True)
    highest_spending_days = trend_data[:3]

    result = {
        "largest_spending_category": largest_spending_category,
        "highest_spending_days": highest_spending_days
    }

    cache_data(cache_key, result)

    return jsonify(result), 200

# Run the app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
