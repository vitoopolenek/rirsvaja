import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import axios from "axios";
import EmployeeSummary from "./components/EmployeeSummary";

jest.mock("axios");

describe("EmployeeSummary Component Tests", () => {
  const mockData = [
    { employee_id: 1, name: "John Doe", total_hours: 120, efficiency: 90, isBoss: 1 },
    { employee_id: 2, name: "Jane Smith", total_hours: 100, efficiency: 85, isBoss: 0 },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Renders the header title correctly", () => {
    render(<EmployeeSummary />);
  
    expect(screen.getByText("Povzetek dela zaposlenih")).toBeInTheDocument();
  });
  


  test("2. Displays employee data fetched from the API", async () => {
    axios.get.mockResolvedValueOnce({ data: mockData });

    render(<EmployeeSummary />);

    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/120/i)).toBeInTheDocument();
      expect(screen.getByText(/90/i)).toBeInTheDocument();
      expect(screen.getAllByText(/1/i)[0]).toBeInTheDocument();

      expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
      expect(screen.getByText(/100/i)).toBeInTheDocument();
      expect(screen.getByText(/85/i)).toBeInTheDocument();
      expect(screen.getAllByText(/0/i)[0]).toBeInTheDocument();
    });
  });

  test("3. Displays 'No data available' when API returns an empty array", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<EmployeeSummary />);

    await waitFor(() => {
      expect(screen.getByText(/No data available/i)).toBeInTheDocument();
    });
  });

  test("4. Displays an error message when API call fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("Failed to fetch data"));

    render(<EmployeeSummary />);

    await waitFor(() => {
      expect(screen.getByText(/Napaka pri nalaganju podatkov/i)).toBeInTheDocument();
    });
  });

  test("5. Does not crash when rendering with no data", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    const { container } = render(<EmployeeSummary />);

    await waitFor(() => {
      expect(container).toBeInTheDocument();
      expect(screen.getByText(/No data available/i)).toBeInTheDocument();
    });
  });
});
