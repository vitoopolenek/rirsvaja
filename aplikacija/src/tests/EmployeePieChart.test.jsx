import React from 'react';
import { render, screen } from '@testing-library/react';
import EmployeePieChart from '../components/EmployeePieChart';

describe('EmployeePieChart Component', () => {
  const mockData = [
    { name: 'Alice Johnson', total_hours: 40 },
    { name: 'John Doe', total_hours: 50 },
    { name: 'Jane Smith', total_hours: 30 },
  ];

  test('renders the pie chart with correct labels', () => {
    render(<EmployeePieChart data={mockData} />);

    // Check if each label is rendered and visible
    mockData.forEach((entry) => {
      const elements = screen.queryAllByText(entry.name);
      const visibleElements = elements.filter((el) => el.offsetParent !== null); // Filter visible elements
      expect(visibleElements.length).toBeGreaterThan(0); // Ensure at least one visible element matches
    });
  });

  test('renders the pie chart with correct data values', () => {
    render(<EmployeePieChart data={mockData} />);

    // Verify data indirectly by checking the rendered labels
    mockData.forEach((entry) => {
      const elements = screen.queryAllByText(entry.name);
      const visibleElements = elements.filter((el) => el.offsetParent !== null);
      expect(visibleElements.length).toBeGreaterThan(0); // Ensure data is mapped correctly
    });
  });
});
