const express = require("express");
const sqlite3 = require("sqlite3").verbose(); // Use SQLite3
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcrypt");

dotenv.config({ path: "../.env" });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let db;

// Use SQLite for testing or development
const useSQLite = process.env.NODE_ENV === "test";

// Initialize Database Connection
const connectToDatabase = () => {
  if (useSQLite) {
    // SQLite3 setup
    db = new sqlite3.Database(":memory:", (err) => {
      if (err) {
        console.error("Error connecting to SQLite:", err.message);
      } else {
        console.log("Connected to SQLite database");
        seedDatabase(); // Seed SQLite database
      }
    });
  } else {
    // Fallback to MySQL for production
    const mysql = require("mysql2/promise");
    const connectMySQL = async () => {
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
        setTimeout(connectMySQL, 5000);
      }
    };
    connectMySQL();
  }
};

// Seed SQLite Database
const seedDatabase = () => {
  db.serialize(() => {
    db.run(
      "CREATE TABLE employees (id INTEGER PRIMARY KEY, username TEXT, password TEXT)"
    );
    db.run(
      "CREATE TABLE work_entries (id INTEGER PRIMARY KEY, employee_id INTEGER, hours_worked INTEGER, date TEXT, description TEXT)"
    );

    const stmt1 = db.prepare("INSERT INTO employees (username, password) VALUES (?, ?)");
    stmt1.run("testuser", bcrypt.hashSync("password", 10));
    stmt1.finalize();

    const stmt2 = db.prepare(
      "INSERT INTO work_entries (employee_id, hours_worked, date, description) VALUES (?, ?, ?, ?)"
    );
    stmt2.run(1, 8, "2024-11-01", "Worked on project");
    stmt2.run(1, 6, "2024-11-02", "Team meeting");
    stmt2.finalize();

    console.log("Seeded SQLite database");
  });
};

// Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Fetch Employees
app.get("/api/employees", (req, res) => {
  db.all("SELECT * FROM employees", [], (err, rows) => {
    if (err) {
      console.error("Error fetching employees:", err.message);
      return res.status(500).json({ error: "Failed to fetch employees" });
    }
    res.json(rows);
  });
});

// Fetch Total Hours
app.get("/api/entries/total-hours", (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: "Start date and end date are required" });
  }

  const query = `
    SELECT 
      e.id AS employee_id,
      e.username AS employee_name,
      SUM(w.hours_worked) AS total_hours
    FROM employees e
    LEFT JOIN work_entries w ON e.id = w.employee_id
    WHERE w.date BETWEEN ? AND ?
    GROUP BY e.id, e.username
  `;

  db.all(query, [startDate, endDate], (err, rows) => {
    if (err) {
      console.error("Error fetching total hours:", err.message);
      return res.status(500).json({ error: "Failed to fetch total hours" });
    }
    res.status(200).json(rows);
  });
});

// Start the server
const startServer = () => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};

// Connect to the database and start the server
connectToDatabase();
startServer();

// Graceful Shutdown
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  if (useSQLite) {
    db.close(() => {
      console.log("SQLite database connection closed");
      process.exit(0);
    });
  } else {
    db.end(() => {
      console.log("MySQL connection closed");
      process.exit(0);
    });
  }
});

module.exports = { app, db };
