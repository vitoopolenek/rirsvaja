const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose(); // Use SQLite

dotenv.config({ path: "../.env" });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let db;

// Use SQLite for testing or MySQL for production
if (process.env.NODE_ENV === "test") {
  db = new sqlite3.Database(":memory:", (err) => {
    if (err) {
      console.error("Error connecting to SQLite:", err.message);
    } else {
      console.log("Connected to SQLite in-memory database.");
      seedTestDatabase(); // Seed in-memory database
    }
  });
} else {
  const mysql = require("mysql2/promise");
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
      setTimeout(connectToDatabase, 5000);
    }
  };
  connectToDatabase();
}

// Seed the SQLite database for testing
const seedTestDatabase = () => {
  const createEmployeesTable = `
    CREATE TABLE employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      password TEXT,
      name TEXT
    );
  `;
  const createWorkEntriesTable = `
    CREATE TABLE work_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER,
      date TEXT,
      hours_worked INTEGER,
      description TEXT
    );
  `;
  const insertEmployees = `
    INSERT INTO employees (username, password, name) VALUES
    ('testuser', '${bcrypt.hashSync("password123", 10)}', 'Test User');
  `;
  const insertWorkEntries = `
    INSERT INTO work_entries (employee_id, date, hours_worked, description) VALUES
    (1, '2024-11-01', 8, 'Worked on project'),
    (1, '2024-11-02', 6, 'Worked on bug fixes');
  `;

  db.serialize(() => {
    db.run(createEmployeesTable);
    db.run(createWorkEntriesTable);
    db.run(insertEmployees);
    db.run(insertWorkEntries);
    console.log("Seeded SQLite test database.");
  });
};

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Use SQLite's `all` for querying during tests
const queryDb = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Routes (same logic as before)
app.get("/api/employees", async (req, res) => {
  try {
    const rows = await queryDb("SELECT * FROM employees");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

app.get("/api/entries/total-hours", async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: "Start date and end date are required" });
  }

  try {
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
    const rows = await queryDb(query, [startDate, endDate]);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching total hours:", err);
    res.status(500).json({ error: "Failed to fetch total hours" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

module.exports = { app, db };
