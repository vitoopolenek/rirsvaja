const express = require("express");
const mysql = require("mysql2/promise"); // Use the promise-based version
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcrypt");

dotenv.config({ path: "../.env" });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let db;

// Function to establish a connection to the MySQL database
const connectToDatabase = async () => {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    });
    console.log("Connected to MySQL database");
  } catch (error) {
    console.error(
      `Error connecting to MySQL, retrying in 5 seconds: ${error.message}`
    );
    setTimeout(connectToDatabase, 5000); // Retry every 5 seconds
  }
};

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Route to fetch all employees
app.get("/api/employees", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM employees");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

// Route to fetch work entries for a specific employee
app.get("/api/entries", async (req, res) => {
  const { employeeId } = req.query;

  if (!employeeId) {
    return res.status(400).json({ error: "Employee ID is required" });
  }

  try {
    const [rows] = await db.query("SELECT * FROM work_entries WHERE employee_id = ?", [employeeId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "No work entries found" });
    }
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching work entries:", err);
    res.status(500).json({ error: "Failed to fetch work entries" });
  }
});

// Route to fetch monthly hours for a specific employee
app.get("/api/entries/month", async (req, res) => {
  const { employeeId, month } = req.query;

  if (!employeeId || !month) {
    return res.status(400).json({ error: "Employee ID and month are required" });
  }

  try {
    const [rows] = await db.query("SELECT * FROM work_entries WHERE employee_id = ? AND MONTH(date) = ?", [employeeId, month]);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching monthly hours:", err);
    res.status(500).json({ error: "Failed to fetch monthly hours" });
  }
});

// Route to update a work entry
app.put("/api/entries/:id", async (req, res) => {
  const { id } = req.params;
  const { hoursWorked, date, description } = req.body;

  try {
    const [result] = await db.query(
      "UPDATE work_entries SET hours_worked = ?, date = ?, description = ? WHERE id = ?",
      [hoursWorked, date, description, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Work entry not found" });
    }
    res.status(200).json({ message: "Data updated successfully" });
  } catch (err) {
    console.error("Error updating work entry:", err);
    res.status(500).json({ error: "Failed to update work entry" });
  }
});

// Route to fetch total hours
app.get("/api/entries/total-hours", async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: "Start date and end date are required" });
  }

  try {
    const [rows] = await db.query(
      `
      SELECT 
        e.id AS employee_id,
        e.name AS employee_name,
        SUM(w.hours_worked) AS total_hours
      FROM employees e
      LEFT JOIN work_entries w ON e.id = w.employee_id
      WHERE w.date BETWEEN ? AND ?
      GROUP BY e.id, e.name
      `,
      [startDate, endDate]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching total hours:", err);
    res.status(500).json({ error: "Failed to fetch total hours" });
  }
});

// Login route
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM employees WHERE username = ?", [username]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Start the server only after connecting to the database
const startServer = async () => {
  await connectToDatabase();
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  if (db) {
    await db.end();
    console.log("MySQL connection closed");
  }
  process.exit(0);
});

// Start the server
startServer();

module.exports = { app, db };
