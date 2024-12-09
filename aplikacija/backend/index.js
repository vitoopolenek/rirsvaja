const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcrypt");

dotenv.config({ path: "../.env" });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Connect to MySQL database
const connectToDatabase = () => {
  db.connect((err) => {
    if (err) {
      console.error("Error connecting to MySQL:", err);
      setTimeout(connectToDatabase, 5000); // Retry every 5 seconds
    } else {
      console.log("Connected to MySQL database");
    }
  });
};
connectToDatabase();

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Route to fetch all employees
app.get("/api/employees", (req, res) => {
  const query = "SELECT * FROM employees";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch employees" });
    res.json(results);
  });
});

// Route to fetch work entries for a specific employee
app.get("/api/entries", (req, res) => {
  const { employeeId } = req.query;

  if (!employeeId) {
    return res.status(400).json({ error: "Employee ID is required" });
  }

  const query = "SELECT * FROM work_entries WHERE employee_id = ?";
  db.query(query, [employeeId], (err, results) => {
    if (err) {
      console.error("Error fetching work entries:", err);
      return res.status(500).json({ error: "Failed to fetch work entries" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "No work entries found" });
    }

    res.status(200).json(results);
  });
});

// Route to fetch monthly hours for a specific employee
app.get("/api/entries/month", (req, res) => {
  const { employeeId, month } = req.query;

  if (!employeeId || !month) {
    return res.status(400).json({ error: "Employee ID and month are required" });
  }

  const query =
    "SELECT * FROM work_entries WHERE employee_id = ? AND MONTH(date) = ?";
  db.query(query, [employeeId, month], (err, results) => {
    if (err) {
      console.error("Error fetching monthly hours:", err);
      return res.status(500).json({ error: "Failed to fetch monthly hours" });
    }

    res.status(200).json(results);
  });
});

// Route to update a work entry
app.put("/api/entries/:id", (req, res) => {
  const { id } = req.params;
  const { hoursWorked, date, description } = req.body;

  const query =
    "UPDATE work_entries SET hours_worked = ?, date = ?, description = ? WHERE id = ?";
  db.query(query, [hoursWorked, date, description, id], (err, results) => {
    if (err) {
      console.error("Error updating work entry:", err);
      return res.status(500).json({ error: "Failed to update work entry" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Work entry not found" });
    }

    res.status(200).json({ message: "Data updated successfully" });
  });
});

// Route to fetch total hours
app.get("/api/entries/total-hours", (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: "Start date and end date are required" });
  }

  const query = `
    SELECT 
      e.id AS employee_id,
      e.name AS employee_name,
      SUM(w.hours_worked) AS total_hours
    FROM employees e
    LEFT JOIN work_entries w ON e.id = w.employee_id
    WHERE w.date BETWEEN ? AND ?
    GROUP BY e.id, e.name
  `;

  db.query(query, [startDate, endDate], (err, results) => {
    if (err) {
      console.error("Error fetching total hours:", err);
      return res.status(500).json({ error: "Failed to fetch total hours" });
    }

    res.status(200).json(results);
  });
});

// Login route
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM employees WHERE username = ?";
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = results[0];
    try {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        return res.json({ success: true, user });
      } else {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (err) {
      console.error("Error comparing passwords:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  db.end(() => {
    console.log("MySQL connection closed");
    process.exit(0);
  });
});

module.exports = { app, server, db };
