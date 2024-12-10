import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import MonthlySummary from "./components/MonthlySummary";

jest.mock("axios");

test("renders the component with initial state", () => {
  render(<MonthlySummary />);
  expect(screen.getByText(/MESEČNI POVZETEK/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Izberi mesec/i)).toBeInTheDocument();
});

test("renders all months in the dropdown", () => {
  render(<MonthlySummary />);
  fireEvent.mouseDown(screen.getByLabelText(/Izberi mesec/i));
  const months = [
    "januar",
    "februar",
    "marec",
    "april",
    "maj",
    "junij",
    "julij",
    "avgust",
    "september",
    "oktober",
    "november",
    "december",
  ];
  months.forEach((month) => {
    expect(screen.getByRole("option", { name: new RegExp(month, "i") })).toBeInTheDocument();
  });
});

test("updates the selected month in the dropdown", async () => {
  render(<MonthlySummary />);
  fireEvent.mouseDown(screen.getByLabelText(/Izberi mesec/i));
  const novemberOption = screen.getByRole("option", { name: /november/i });
  fireEvent.click(novemberOption);

  await waitFor(() => {
    expect(screen.getByText(/november/i)).toBeInTheDocument();
  });
});

test("displays table headers", () => {
  render(<MonthlySummary />);
  expect(screen.getByText(/Zaposleni/i)).toBeInTheDocument();
  expect(screen.getByText(/Datum/i)).toBeInTheDocument();
  expect(screen.getByText(/Ure/i)).toBeInTheDocument();
});

test("displays no data message when no entries are available", async () => {
  // Mock axios to return an empty array when fetching entries
  axios.get.mockResolvedValueOnce({ data: [] });

  render(<MonthlySummary />);

  // Open the dropdown and select a month
  fireEvent.mouseDown(screen.getByLabelText(/Izberi mesec/i));
  const januaryOption = screen.getByRole("option", { name: /januar/i });
  fireEvent.click(januaryOption);

  // Ensure the "no data" message is displayed
  await waitFor(() => {
    expect(
      screen.getByText(/ni podatkov za izbrani mesec/i)
    ).toBeInTheDocument();
  });

  // Restore mocks
  axios.get.mockReset();
});
