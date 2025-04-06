import React from 'react';
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
  return (
    <div className="employee-list-container">
      <h2>Employees</h2>
      
      <div className="filters">
        <input
          type="text"
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        
        <select 
          value={selectedTeam} 
          onChange={(e) => {
            setSelectedTeam(e.target.value);
            onSelectEmployee(null); // Clear selected employee when changing team
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
        {employees.map(employee => (
          <li 
            key={employee.id} 
            className={`employee-item ${selectedEmployee?.id === employee.id ? 'selected' : ''}`}
            onClick={() => onSelectEmployee(employee)}
          >
            <div className="employee-name">{employee.name}</div>
            <div className="employee-info">
              <span className="employee-designation">{employee.designation}</span>
              <span className="employee-team">{employee.team}</span>
            </div>
          </li>
        ))}
        
        {!isLoading && !error && employees.length === 0 && (
          <li className="no-results">No employees match your search</li>
        )}
      </ul>
    </div>
  );
}

export default EmployeeList;