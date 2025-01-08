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
	UserID      string  `json:"user_id"` // Added to associate expenses with a user
	CreatedAt   string  `json:"created_at"`
}

// Initialize DB connection
func initDB() {
	var err error
	// Connect to the MySQL database
	//dsn := "root:root@tcp(expenses_db:3306)/expenses_db"
	dsn := "root:root@tcp(localhost:3306)/expenses_db"

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

// Middleware to extract user_id from headers
func getUserIDFromHeader(r *http.Request) (string, error) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		return "", http.ErrNoLocation
	}
	return userID, nil
}

// Handle GET/POST requests for /expenses
func handleExpenses(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromHeader(r)
	if err != nil {
		http.Error(w, "Unauthorized: User ID not found in headers", http.StatusUnauthorized)
		return
	}

	if r.Method == http.MethodGet {
		getExpenses(w, r, userID)
	} else if r.Method == http.MethodPost {
		addExpense(w, r, userID)
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

	userID, err := getUserIDFromHeader(r)
	if err != nil {
		http.Error(w, "Unauthorized: User ID not found in headers", http.StatusUnauthorized)
		return
	}

	switch r.Method {
	case http.MethodPut:
		updateExpense(w, r, id, userID)
	case http.MethodDelete:
		deleteExpense(w, r, id, userID)
	default:
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
	}
}

// Get all expenses for a user
func getExpenses(w http.ResponseWriter, r *http.Request, userID string) {
	rows, err := db.Query("SELECT id, description, amount, category, date, user_id, created_at FROM expenses WHERE user_id = ?", userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var expenses []Expense
	for rows.Next() {
		var expense Expense
		if err := rows.Scan(&expense.ID, &expense.Description, &expense.Amount, &expense.Category, &expense.Date, &expense.UserID, &expense.CreatedAt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		expenses = append(expenses, expense)
	}

	// Check if no expenses were found and return an empty array
	if len(expenses) == 0 {
		expenses = []Expense{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(expenses)
}

// Add a new expense for a user
func addExpense(w http.ResponseWriter, r *http.Request, userID string) {
	var expense Expense
	if err := json.NewDecoder(r.Body).Decode(&expense); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Assign the extracted userID to the expense
	expense.UserID = userID

	_, err := db.Exec("INSERT INTO expenses (description, amount, category, date, user_id) VALUES (?, ?, ?, ?, ?)",
		expense.Description, expense.Amount, expense.Category, expense.Date, expense.UserID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(expense)
}

// Update an expense for a user
func updateExpense(w http.ResponseWriter, r *http.Request, id string, userID string) {
	var expense Expense
	if err := json.NewDecoder(r.Body).Decode(&expense); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	_, err := db.Exec("UPDATE expenses SET description = ?, amount = ?, category = ?, date = ? WHERE id = ? AND user_id = ?",
		expense.Description, expense.Amount, expense.Category, expense.Date, id, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(expense)
}

// Delete an expense for a user
func deleteExpense(w http.ResponseWriter, r *http.Request, id string, userID string) {
	_, err := db.Exec("DELETE FROM expenses WHERE id = ? AND user_id = ?", id, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
