import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import Overview from "../components/Overview";
import axios from "axios";

jest.mock("axios");

describe("Overview Component", () => {
  beforeEach(() => {
    axios.get.mockClear();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test("renders overview component with default state", async () => {
    render(<Overview />);
    expect(screen.getByText(/pregled oddelanih ur/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mesec/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByText(/izberite mesec/i)).toBeInTheDocument();
  });

  test("fetches and displays data when a month is selected", async () => {
    const mockData = [
      { id: 1, name: "John Doe", total_hours: 160 },
      { id: 2, name: "Jane Smith", total_hours: 140 },
    ];
    axios.get.mockResolvedValueOnce({ data: mockData });
  
    render(<Overview />);
  
    const dropdown = screen.getByLabelText(/mesec/i);
    fireEvent.mouseDown(dropdown);
    fireEvent.click(screen.getByText(/januar/i)); // Select "January"
  
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
  
    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row");
  
    expect(rows.length).toBeGreaterThan(1);
    expect(within(rows[1]).queryByText(/John Doe/i)).toBeInTheDocument();
    expect(within(rows[1]).queryByText(/160/i)).toBeInTheDocument();
    expect(within(rows[2]).queryByText(/Jane Smith/i)).toBeInTheDocument();
    expect(within(rows[2]).queryByText(/140/i)).toBeInTheDocument();
  });
  
  

  test("shows error message if data fetching fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("Napaka pri iskanju ur za ta mesec"));

    render(<Overview />);

    const dropdown = screen.getByLabelText(/mesec/i);
    fireEvent.mouseDown(dropdown);
    fireEvent.click(screen.getByText(/januar/i));

    await waitFor(() =>
      expect(screen.getByText(/napaka pri iskanju ur za ta mesec/i)).toBeInTheDocument()
    );
  });
});
