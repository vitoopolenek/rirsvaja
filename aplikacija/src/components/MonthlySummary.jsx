import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";

const MonthlySummary = () => {
  const [month, setMonth] = useState("");
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    if (month) {
      const fetchMonthlyHours = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5001/api/entries/month`,
            {
              params: { employeeId: 1, month },
            }
          );
          console.log("API Response:", response.data); // Debugging log
          setEntries(response.data);
        } catch (err) {
          console.error("Error fetching monthly hours:", err);
        }
      };
      fetchMonthlyHours();
    }
  }, [month]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        MESEČNI POVZETEK
      </Typography>
      <FormControl fullWidth>
        <InputLabel id="select-month-label">Izberi mesec</InputLabel>
        <Select
          labelId="select-month-label"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          {[...Array(12).keys()].map((i) => (
            <MenuItem key={i} value={i + 1}>
              {new Date(0, i).toLocaleString("sl", { month: "long" })}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TableContainer component={Paper} style={{ marginTop: "20px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Zaposleni</TableCell>
              <TableCell>Datum</TableCell>
              <TableCell>Ure</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} style={{ textAlign: "center" }}>
                  Ni podatkov za izbrani mesec
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{entry.name}</TableCell>
                  <TableCell>
                    {format(new Date(entry.date), "dd-MM-yyyy")}
                  </TableCell>
                  <TableCell>{entry.hours_worked}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default MonthlySummary;
