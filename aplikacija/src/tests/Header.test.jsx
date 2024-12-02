import React from "react";
import { render, screen } from "@testing-library/react";
import Header from "../components/Header";

test("renders header with title", () => {
  render(<Header onNavigate={jest.fn()} />); // Mock the onNavigate function

  const title = screen.getByText(/evidenca ur/i); // Check for the hardcoded title
  expect(title).toBeInTheDocument();
});

test("renders navigation buttons", () => {
  render(<Header onNavigate={jest.fn()} />); // Mock the onNavigate function

  // Check for all buttons
  expect(screen.getByText(/vnesi ure/i)).toBeInTheDocument();
  expect(screen.getByText(/moja evidenca/i)).toBeInTheDocument();
  expect(screen.getByText(/pregled/i)).toBeInTheDocument();
});
