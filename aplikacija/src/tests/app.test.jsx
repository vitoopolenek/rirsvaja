import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../App";
import axios from "axios";

jest.mock("axios");

const mockEmployees = [
  { id: "1", name: "Janez Novak" },
  { id: "2", name: "Marija Kovač" },
];

beforeAll(() => {
  global.alert = jest.fn(); // Mock window.alert
});

describe("App Component Tests", () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockEmployees });
    axios.post.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders login form by default", () => {
    render(<App />);
    const loginButton = screen.getByRole("button", { name: /login/i });
    expect(loginButton).toBeInTheDocument();
  });

  test("navigates to EmployeeEntryForm on login and submits form", async () => {
    render(<App />);

    // Simulate login
    const loginButton = screen.getByRole("button", { name: /login/i });
    fireEvent.click(loginButton);

    // Wait for navigation
    await waitFor(() => {
      expect(screen.getByText(/vnos podatkov o zaposlenih/i)).toBeInTheDocument();
    });

    // Select employee
    const employeeDropdown = screen.getByLabelText(/izberite zaposlenega/i);
    fireEvent.mouseDown(employeeDropdown);

    const options = screen.getByRole("option", { name: /janez novak/i });
    fireEvent.click(options);

    // Fill out form
    fireEvent.change(screen.getByLabelText(/število opravljenih ur/i), {
      target: { value: "8" },
    });
    fireEvent.change(screen.getByLabelText(/datum/i), {
      target: { value: "2024-12-01" },
    });
    fireEvent.change(screen.getByLabelText(/opis/i), {
      target: { value: "Daily tasks completed." },
    });

    // Submit form
    const submitButton = screen.getByRole("button", { name: /pošlji/i });
    fireEvent.click(submitButton);

    // Verify API call
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:5000/api/entries",
        expect.objectContaining({
          employeeId: "1",
          hoursWorked: "8",
          date: "2024-12-01",
          description: "Daily tasks completed.",
        })
      );
    });

    // Verify alert was called
    expect(global.alert).toHaveBeenCalledWith("Data submitted successfully");
  });
});
