import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock the fetch API
global.fetch = jest.fn();

describe('App Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    
    // Mock the API response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: "Mark Hill", designation: "CEO", team: "Executive", managerId: null },
        { id: 2, name: "Joe Linux", designation: "CTO", team: "Technology", managerId: 1 },
        { id: 3, name: "Linda May", designation: "CFO", team: "Finance", managerId: 1 }
      ]
    });
  });

  test('renders the app header', async () => {
    render(<App />);
    const headerElement = screen.getByText(/Organization Chart/i);
    expect(headerElement).toBeInTheDocument();
  });

  test('fetches and displays employees', async () => {
    render(<App />);
    
    // Wait for the data to load
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    
    // Check if employee names are rendered
    expect(screen.getByText('Mark Hill')).toBeInTheDocument();
    expect(screen.getByText('Joe Linux')).toBeInTheDocument();
    expect(screen.getByText('Linda May')).toBeInTheDocument();
  });

  test('filters employees by team', async () => {
    render(<App />);
    
    // Wait for the data to load
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    
    // Select Technology team
    const selectElement = screen.getByRole('combobox');
    userEvent.selectOptions(selectElement, 'Technology');
    
    // Check that only Technology team members are visible
    await waitFor(() => {
      expect(screen.getByText('Joe Linux')).toBeInTheDocument();
      
      // These might still be in the DOM but should be visually faded
      const markNode = screen.getByText('Mark Hill').closest('.org-node');
      expect(markNode).toHaveClass('faded');
    });
  });
});
