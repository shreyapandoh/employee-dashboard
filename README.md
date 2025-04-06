# Employee Organization Chart

An interactive web application that visualizes an employee organization chart with filtering and drag & drop functionality.

## Features

- Interactive organization chart visualization based on employee hierarchy
- Employee list with search and team filtering capabilities
- Drag and drop functionality to reassign managers
- Real-time updates with API integration
- Responsive design

## Installation and Setup

1. Clone the repository
2. Install dependencies:
```
npm install
```
3. Start the development server:
```
npm start
```
4. Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## Project Structure

```
src/
├── components/
│   ├── EmployeeList.jsx   # Employee listing with search/filter
│   ├── EmployeeList.css
│   ├── OrgChart.jsx       # Organization chart with drag & drop
│   └── OrgChart.css
├── App.jsx                # Main application component
├── App.css                # Main styles
└── index.js               # Entry point
```

## Implementation Details

### Data Model

The application uses the following data model for employees:
- ID: Unique identifier
- Name: Employee name
- Designation: Job title
- Team: Department/team name
- ManagerId: References another employee's ID

### Mock API

The application uses MirageJS to simulate API endpoints:
- GET /api/employees - Retrieves all employees
- PATCH /api/employees/:id - Updates an employee's manager

### Functionality

1. **Search and Filter**:
   - Search by name, designation, or team
   - Filter by specific team

2. **Organization Chart**:
   - Tree visualization based on manager-employee relationships
   - Expandable/collapsible nodes

3. **Drag and Drop**:
   - Drag employees to reassign their manager
   - Validation to prevent circular references
   - Visual feedback during drag operations

## Development Notes

- Uses native HTML5 drag and drop API instead of external libraries
- Custom styling with CSS
- Implements proper validation for hierarchy changes
- Uses React hooks for state management