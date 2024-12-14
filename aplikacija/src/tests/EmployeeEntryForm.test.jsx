import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import EmployeeEntryForm from "../components/EmployeeEntryForm";
import axios from "axios";

jest.mock("axios");

// Mock alert to avoid jsdom error
global.alert = jest.fn();

beforeEach(() => {
  // Mock GET request for employees
  axios.get.mockResolvedValue({
    data: [{ id: 1, name: "John Doe" }, { id: 2, name: "Jane Smith" }],
  });

  // Mock POST request for form submission
  axios.post.mockResolvedValue({
    data: { success: true },
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

test("renders EmployeeEntryForm with mocked data", async () => {
    await act(async () => {
      render(<EmployeeEntryForm />);
    });
  
    // Verify the dropdown label exists
    expect(screen.getByLabelText(/izberite zaposlenega/i)).toBeInTheDocument();
  
    // Simulate opening the dropdown
    fireEvent.mouseDown(screen.getByLabelText(/izberite zaposlenega/i));
  
    // Wait for dropdown options to appear
    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
      expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
    });
  });
  

test("submits form data successfully", async () => {
  await act(async () => {
    render(<EmployeeEntryForm />);
  });

  // Simulate dropdown interaction
  fireEvent.mouseDown(screen.getByLabelText(/izberite zaposlenega/i));
  fireEvent.click(screen.getByText(/john doe/i));

  // Fill out other form fields
  fireEvent.change(screen.getByLabelText(/število opravljenih ur/i), {
    target: { value: "8" },
  });
  fireEvent.change(screen.getByLabelText(/datum/i), {
    target: { value: "2024-12-01" },
  });
  fireEvent.change(screen.getByLabelText(/opis/i), {
    target: { value: "Completed tasks for the day." },
  });

  // Submit the form
  fireEvent.click(screen.getByRole("button", { name: /pošlji/i }));

  // Verify POST request
  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:5001/api/entries",
      {
        employeeId: 1, // Adjusted to integer
        hoursWorked: "8",
        date: "2024-12-01",
        description: "Completed tasks for the day.",
      }
    );
  });

  // Verify alert
  expect(global.alert).toHaveBeenCalledWith("Data submitted successfully");
});
