import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmployeeList from '../components/EmployeeList';

describe('EmployeeList Component', () => {
  const mockProps = {
    employees: [
      { id: 1, name: "Mark Hill", designation: "CEO", team: "Executive" },
      { id: 2, name: "Joe Linux", designation: "CTO", team: "Technology" },
      { id: 3, name: "Linda May", designation: "CFO", team: "Finance" }
    ],
    teams: ["Executive", "Technology", "Finance"],
    selectedTeam: "",
    setSelectedTeam: jest.fn(),
    searchQuery: "",
    setSearchQuery: jest.fn(),
    isLoading: false,
    error: null
  };

  test('renders employee list correctly', () => {
    render(<EmployeeList {...mockProps} />);
    
    expect(screen.getByText('Mark Hill')).toBeInTheDocument();
    expect(screen.getByText('Joe Linux')).toBeInTheDocument();
    expect(screen.getByText('Linda May')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    render(<EmployeeList {...mockProps} isLoading={true} />);
    
    expect(screen.getByText(/Loading employees/i)).toBeInTheDocument();
  });

  test('shows error state', () => {
    render(<EmployeeList {...mockProps} error="Failed to load employees" />);
    
    expect(screen.getByText(/Failed to load employees/i)).toBeInTheDocument();
  });

  test('search input calls the setSearchQuery function', () => {
    render(<EmployeeList {...mockProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search employees...');
    userEvent.type(searchInput, 'Mark');
    
    expect(mockProps.setSearchQuery).toHaveBeenCalled();
  });

  test('team select calls the setSelectedTeam function', () => {
    render(<EmployeeList {...mockProps} />);
    
    const selectElement = screen.getByRole('combobox');
    userEvent.selectOptions(selectElement, 'Technology');
    
    expect(mockProps.setSelectedTeam).toHaveBeenCalled();
  });
});
