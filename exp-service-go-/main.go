package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	_ "github.com/go-sql-driver/mysql"
)

var db *sql.DB

// Expense struct
type Expense struct {
	ID          int     `json:"id"`
	Description string  `json:"description"`
	Amount      float64 `json:"amount"`
	Category    string  `json:"category"`
	Date        string  `json:"date"`
	CreatedAt   string  `json:"created_at"`
}

// Initialize DB connection
func initDB() {
	var err error
	// Connect to the MySQL database
	dsn := "root:root@tcp(expenses_db:3306)/expenses_db"
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal(err)
	}
}

func main() {
	initDB()
	defer db.Close()

	// Define routes
	http.HandleFunc("/expenses", handleExpenses)
	http.HandleFunc("/expenses/", handleExpense)

	// Start the server
	log.Println("Server starting on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// Handle GET/POST requests for /expenses
func handleExpenses(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		getExpenses(w, r)
	} else if r.Method == http.MethodPost {
		addExpense(w, r)
	} else {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
	}
}

// Handle PUT/DELETE requests for /expenses/{id}
func handleExpense(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/expenses/"):]
	if id == "" {
		http.Error(w, "Missing expense ID", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodPut:
		updateExpense(w, r, id)
	case http.MethodDelete:
		deleteExpense(w, r, id)
	default:
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
	}
}

// Get all expenses
func getExpenses(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, description, amount, category, date, created_at FROM expenses")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var expenses []Expense
	for rows.Next() {
		var expense Expense
		if err := rows.Scan(&expense.ID, &expense.Description, &expense.Amount, &expense.Category, &expense.Date, &expense.CreatedAt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		expenses = append(expenses, expense)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(expenses)
}

// Add a new expense
func addExpense(w http.ResponseWriter, r *http.Request) {
	var expense Expense
	if err := json.NewDecoder(r.Body).Decode(&expense); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	_, err := db.Exec("INSERT INTO expenses (description, amount, category, date) VALUES (?, ?, ?, ?)",
		expense.Description, expense.Amount, expense.Category, expense.Date)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(expense)
}

// Update an expense
func updateExpense(w http.ResponseWriter, r *http.Request, id string) {
	var expense Expense
	if err := json.NewDecoder(r.Body).Decode(&expense); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	_, err := db.Exec("UPDATE expenses SET description = ?, amount = ?, category = ?, date = ? WHERE id = ?",
		expense.Description, expense.Amount, expense.Category, expense.Date, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(expense)
}

// Delete an expense
func deleteExpense(w http.ResponseWriter, r *http.Request, id string) {
	_, err := db.Exec("DELETE FROM expenses WHERE id = ?", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
