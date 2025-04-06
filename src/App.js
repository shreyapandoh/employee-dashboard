import React, { useState, useEffect } from 'react';
import { createServer } from 'miragejs';
import EmployeeList from './components/EmployeeList';
import OrgChart from './components/OrgChart';
import './App.css';

// Setup Mock API
const setupMockServer = () => {
  return createServer({
    seeds(server) {
      server.db.loadData({
        employees: [
          { id: 1, name: "Mark Hill", designation: "CEO", team: "Executive", managerId: null },
          { id: 2, name: "Joe Linux", designation: "CTO", team: "Technology", managerId: 1 },
          { id: 3, name: "Linda May", designation: "CFO", team: "Finance", managerId: 1 },
          { id: 4, name: "John Green", designation: "VP of Engineering", team: "Technology", managerId: 2 },
          { id: 5, name: "Ron Blomquist", designation: "VP of IT", team: "Technology", managerId: 2 },
          { id: 6, name: "Michael Rubin", designation: "VP of Sales", team: "Sales", managerId: 3 },
          { id: 7, name: "Alice Lopez", designation: "Security Officer", team: "Technology", managerId: 4 },
          { id: 8, name: "Mary Johnson", designation: "Software Engineer", team: "Technology", managerId: 4 },
          { id: 9, name: "Bob Wilson", designation: "QA Tester", team: "Technology", managerId: 4 },
          { id: 10, name: "Kate Brown", designation: "Infrastructure Manager", team: "Technology", managerId: 5 },
          { id: 11, name: "Carlos Rodriguez", designation: "Sales Representative", team: "Sales", managerId: 6 },
          { id: 12, name: "Emma White", designation: "Accountant", team: "Finance", managerId: 3 }
        ]
      });
    },
    routes() {
      this.namespace = "api";
      
      this.get("/employees", (schema) => {
        return schema.db.employees;
      });
      
      this.patch("/employees/:id", (schema, request) => {
        const id = request.params.id;
        const attrs = JSON.parse(request.requestBody);
        schema.db.employees.update(id, attrs);
        return schema.db.employees.find(id);
      });
    }
  });
};

function App() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const server = setupMockServer();
    
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/employees');
        const data = await response.json();
        setEmployees(data);
        setFilteredEmployees(data);
        console.log('employees', employees)
        console.log('filteredEmployees', filteredEmployees)
        
        // Extract unique teams
        const uniqueTeams = [...new Set(data.map(emp => emp.team))];
        setTeams(uniqueTeams);
        console.log('teams', teams)
        
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch employees');
        setIsLoading(false);
        console.error(err);
      }
    };
    
    fetchEmployees();
    
    return () => {
      server.shutdown();
    };
  }, []);

  useEffect(() => {
    // Check for dangling manager references
    if (employees.length > 0) {  // Only run if employees are loaded
      employees.forEach(emp => {
        if (emp.managerId && !employees.some(e => e.id === emp.managerId)) {
          console.warn(`Invalid managerId ${emp.managerId} for employee ${emp.id}`);
        }
      });
    }
  }, [employees]);

  useEffect(() => {
    let result = [...employees];
    
    // Apply team filter
    if (selectedTeam) {
      result = result.filter(emp => emp.team === selectedTeam);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(emp => 
        emp.name.toLowerCase().includes(query) || 
        emp.designation.toLowerCase().includes(query) || 
        emp.team.toLowerCase().includes(query)
      );
    }
    
    setFilteredEmployees(result);
  }, [selectedTeam, searchQuery, employees]);

  const handleUpdateManager = async (employeeId, newManagerId) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ managerId: newManagerId }),
      });
      
      const updatedEmployee = await response.json();
      
      // Update the employees state
      setEmployees(prevEmployees => 
        prevEmployees.map(emp => 
          emp.id === updatedEmployee.id ? updatedEmployee : emp
        )
      );
      
      return true;
    } catch (err) {
      console.error('Failed to update manager:', err);
      return false;
    }
  };

  useEffect(() => {
    console.log('selectedEmployee (updated)', selectedEmployee);
  }, [selectedEmployee]);

  // Handle employee selection
  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    if (employee) {
      // Clear team filter when selecting an employee
      setSelectedTeam('');
    }
  };

  
  return (
    <div className="app">
      <header className="app-header">
        <h1>Organization Chart</h1>
      </header>
      
      <div className="app-container">
        <div className="sidebar">
          <EmployeeList 
            employees={employees}
            teams={teams}
            selectedTeam={selectedTeam}
            setSelectedTeam={setSelectedTeam}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectEmployee={handleSelectEmployee}
            selectedEmployee={selectedEmployee}
            isLoading={isLoading}
            error={error}
          />
        </div>
        
        <div className="main-content">
          <OrgChart 
            employees={employees}
            filteredEmployees={filteredEmployees}
            selectedTeam={selectedTeam}
            selectedEmployee={selectedEmployee}
            onUpdateManager={handleUpdateManager}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}

export default App;