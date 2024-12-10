const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require('bcrypt');


dotenv.config({ path: "../.env" });

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

app.get("/api/employees", (req, res) => {
  const query = "SELECT * FROM employees";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch employees" });
    res.json(results);
  });
});

// Route to fetch work entries for a specific employee
app.get("/api/entries", async (req, res) => {
  const { employeeId } = req.query;

  if (!employeeId) {
    return res.status(400).json({ error: 'Employee ID is required' });
  }

  const query = "SELECT * FROM work_entries WHERE employee_id = ?";
  db.query(query, [employeeId], (err, results) => {
    if (err) {
      console.error("Error fetching work entries:", err);
      return res.status(500).json({ error: 'Failed to fetch work entries' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No work entries found' });
    }

    res.status(200).json(results);
  });
});

// Route to fetch monthly hours for a specific employee
app.get("/api/entries/month", async (req, res) => {
  const { employeeId, month } = req.query;

  if (!employeeId || !month) {
    return res.status(400).json({ error: "Employee ID and month are required" });
  }

  const query = `
    SELECT we.employee_id, we.hours_worked, we.date, e.name 
    FROM work_entries AS we
    INNER JOIN employees AS e ON we.employee_id = e.id
    WHERE we.employee_id = ? AND MONTH(we.date) = ?
  `;

  db.query(query, [employeeId, month], (err, results) => {
    if (err) {
      console.error("Error fetching monthly hours:", err);
      return res.status(500).json({ error: "Failed to fetch monthly hours" });
    }

    res.status(200).json(results);
  });
});


// Route to update a work entry
app.put("/api/entries/:id", async (req, res) => {
  const { id } = req.params;
  const { hoursWorked, date, description } = req.body;

  const query = "UPDATE work_entries SET hours_worked = ?, date = ?, description = ? WHERE id = ?";
  db.query(query, [hoursWorked, date, description, id], (err, results) => {
    if (err) {
      console.error("Error updating work entry:", err);
      return res.status(500).json({ error: 'Failed to update work entry' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Work entry not found' });
    }

    res.status(200).json({ message: "Data updated successfully" });
  });
});


app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt:", { username });

  const query = "SELECT * FROM employees WHERE username = ?";
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      console.warn("Invalid credentials: User not found");
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = results[0];
    console.log("Fetched user:", user);

    try {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        console.log("Login successful for user:", user.username);
        return res.json({ success: true, user });
      } else {
        console.warn("Invalid credentials: Incorrect password");
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (err) {
      console.error("Error comparing passwords:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
});

const server = app.listen(port, () => {
  console.log("Server running on http://localhost:${port}");
});

module.exports = { app, server, db }; // Export app, server, and db
