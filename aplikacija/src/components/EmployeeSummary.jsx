import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Paper,
  Box,
} from "@mui/material";
import axios from "axios";

const EmployeeSummary = () => {
  const [summary, setSummary] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5001/api/employees/summary"
        );
        setSummary(response.data);
      } catch (error) {
        console.error("Error fetching summary:", error);
        setError(true);
      }
    };
    fetchSummary();
  }, []);

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Povzetek dela zaposlenih
        </Typography>
        <Paper sx={{ mt: 2, p: 2 }}>
          {error ? (
            <Typography align="center" color="error">
              Napaka pri nalaganju podatkov
            </Typography>
          ) : summary.length === 0 ? (
            <Typography align="center">No data available</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <th role="columnheader">Ime</th>
                  </TableCell>
                  <TableCell>
                    <th role="columnheader">Oddelane ure</th>
                  </TableCell>
                  <TableCell>
                    <th role="columnheader">Učinkovitost (%)</th>
                  </TableCell>
                  <TableCell>
                    <th role="columnheader">Je šef</th>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {summary.map((item) => (
                  <TableRow key={item.employee_id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.total_hours}</TableCell>
                    <TableCell>{item.efficiency}</TableCell>
                    <TableCell>{item.isBoss}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default EmployeeSummary;
