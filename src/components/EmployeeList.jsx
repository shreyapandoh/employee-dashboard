import React, { useEffect, useState } from 'react';
import './EmployeeList.css';

function EmployeeList({ 
  employees, 
  teams, 
  selectedTeam, 
  setSelectedTeam, 
  searchQuery, 
  setSearchQuery,
  onSelectEmployee,
  selectedEmployee,
  isLoading,
  error 
}) {

  const [employee, setEmployee] = useState([]);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    let filteredEmployees = [...employees];

    if (selectedTeam) {
      filteredEmployees = filteredEmployees.filter(emp => emp.team === selectedTeam);
    }
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filteredEmployees = filteredEmployees.filter(emp => 
        emp.name.toLowerCase().includes(query) || 
        emp.designation.toLowerCase().includes(query) || 
        emp.team.toLowerCase().includes(query)
      );
    }
    setEmployee(filteredEmployees);
  }, [debouncedSearchQuery, selectedTeam, employees]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debouncedSearchQuery) {
      clearTimeout(window.searchTimeout);
    }

    window.searchTimeout = setTimeout(() => {
      setDebouncedSearchQuery(value);
    }, 1000);
  };

  useEffect(() => {
    setEmployee(employees);
  }, [employees]);

  return (
    <div className="employee-list-container">
      <h2>Employees</h2>
      
      <div className="filters">
        <input
          type="text"
          placeholder="Search employees..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
        
        <select 
          value={selectedTeam} 
          onChange={(e) => {
            setSelectedTeam(e.target.value);
            onSelectEmployee(null);
          }}
          className="team-select"
        >
          <option value="">All Teams</option>
          {teams.map(team => (
            <option key={team} value={team}>{team}</option>
          ))}
        </select>
      </div>
      
      {isLoading && <div className="loading">Loading employees...</div>}
      {error && <div className="error">{error}</div>}
      
      <ul className="employee-list">
        {employee.map(emp => (
          <li 
            key={emp.id} 
            className={`employee-item ${selectedEmployee?.id === emp.id ? 'selected' : ''}`}
            onClick={() => onSelectEmployee(emp)}
          >
            <div className="employee-name">{emp.name}</div>
            <div className="employee-info">
              <span className="employee-designation">{emp.designation}</span>
              <span className="employee-team">{emp.team}</span>
            </div>
          </li>
        ))}
        
        {!isLoading && !error && employee.length === 0 && (
          <li className="no-results">No employees match your search</li>
        )}
      </ul>
    </div>
  );
}

export default EmployeeList;
