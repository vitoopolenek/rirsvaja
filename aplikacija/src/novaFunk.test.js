import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import axios from "axios";
import EmployeeSummary from "./components/EmployeeSummary"; // Ensure the correct path

jest.mock("axios");

describe("EmployeeSummary Component Tests", () => {
  const mockData = [
    { employee_id: 1, name: "John Doe", total_hours: 120, efficiency: 90, isBoss: 1 },
    { employee_id: 2, name: "Jane Smith", total_hours: 100, efficiency: 85, isBoss: 0 },
  ];

  afterEach(() => {
    jest.clearAllMocks(); // Reset mocks after each test
  });

  test("1. Renders the table headers correctly", async () => {
    await act(async () => {
      render(<EmployeeSummary />);
    });

    expect(screen.getByText(/Ime/i)).toBeInTheDocument();
    expect(screen.getByText(/Oddelane ure/i)).toBeInTheDocument();
    expect(screen.getByText(/Učinkovitost/i)).toBeInTheDocument();
    expect(screen.getByText(/Je šef/i)).toBeInTheDocument();
  });

  test("2. Displays employee data fetched from the API", async () => {
    axios.get.mockResolvedValue({ data: mockData });

    await act(async () => {
      render(<EmployeeSummary />);
    });

    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/120/i)).toBeInTheDocument();
      expect(screen.getByText(/90/i)).toBeInTheDocument();
      expect(screen.getByText(/1/i)).toBeInTheDocument();

      expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
      expect(screen.getByText(/100/i)).toBeInTheDocument();
      expect(screen.getByText(/85/i)).toBeInTheDocument();
      expect(screen.getByText(/0/i)).toBeInTheDocument();
    });
  });

  test("3. Displays 'No data available' when API returns an empty array", async () => {
    axios.get.mockResolvedValue({ data: [] });

    await act(async () => {
      render(<EmployeeSummary />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Ni podatkov za prikaz/i)).toBeInTheDocument();
    });
  });

  test("4. Displays an error message when API call fails", async () => {
    axios.get.mockRejectedValue(new Error("Failed to fetch data"));

    await act(async () => {
      render(<EmployeeSummary />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Napaka pri nalaganju podatkov/i)).toBeInTheDocument();
    });
  });

  test("5. Does not crash when rendering with no data", async () => {
    axios.get.mockResolvedValue({ data: [] });

    let container;
    await act(async () => {
      const renderResult = render(<EmployeeSummary />);
      container = renderResult.container;
    });

    await waitFor(() => {
      expect(container).toBeInTheDocument();
      expect(screen.getByText(/Ni podatkov za prikaz/i)).toBeInTheDocument();
    });
  });
});
