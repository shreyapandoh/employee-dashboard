import React, { useState, useEffect, useMemo } from 'react';
import './OrgChart.css';

function OrgChart({ employees, filteredEmployees, selectedTeam, selectedEmployee, onUpdateManager, isLoading, error }) {
  // State initialization
  const [rootEmployees, setRootEmployees] = useState([]);
  const [visibleEmployeeIds, setVisibleEmployeeIds] = useState(new Set());
  const [highlightedEmployeeIds, setHighlightedEmployeeIds] = useState(new Set());
  const [draggedEmployee, setDraggedEmployee] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  // Memoized employee finder
  const findEmployee = useMemo(() => {
    return (id) => employees.find(e => e.id == id) || null;
  }, [employees]);

  // Find root employees (employees with no manager)
  useEffect(() => {
    const roots = employees.filter(emp => emp.managerId == null);
    setRootEmployees(roots);
    
    // Expand all root nodes by default
    const newExpanded = new Set(expandedNodes);
    roots.forEach(root => newExpanded.add(root.id));
    setExpandedNodes(newExpanded);
  }, [employees]);

  // Calculate visible and highlighted employees
  useEffect(() => {
    if (isLoading || error) return;
  
    const newVisibleIds = new Set();
    const newHighlightedIds = new Set();
  
    // Show full hierarchy when no filters
    if (!selectedTeam && !selectedEmployee) {
      employees.forEach(emp => newVisibleIds.add(emp.id));
      setVisibleEmployeeIds(newVisibleIds);
      console.log('visibleEmployeeIds', visibleEmployeeIds)
      setHighlightedEmployeeIds(newHighlightedIds);
      console.log('highlightedEmployeeId', highlightedEmployeeIds)
      return;
    }
  
    // Show team hierarchy
    if (selectedTeam) {
      filteredEmployees.forEach(emp => {
        if (!emp) return;
        
        // Add employee and highlight
        newVisibleIds.add(emp.id);
        newHighlightedIds.add(emp.id);
        
        // Add all ancestors
        let current = emp;
        while (current?.managerId) {
          current = employees.find(e => e.id == current.managerId);
          if (current) newVisibleIds.add(current.id);
        }
        
        // Add all descendants
        const showDescendants = (id) => {
          employees
            .filter(e => e?.managerId == id)
            .forEach(e => {
              newVisibleIds.add(e.id);
              showDescendants(e.id);
            });
        };
        showDescendants(emp.id);
      });
    }
  
    // Show individual employee hierarchy
    if (selectedEmployee) {
        console.log('selected employee line 77', selectedEmployee)
      const emp = employees.find(e => e.id == selectedEmployee.id);
      if (emp) {
        // Add selected employee and highlight
        newVisibleIds.add(emp.id);
        console.log('newVisibleIds line 82', newVisibleIds)
        newHighlightedIds.add(emp.id);
        
        // Add all ancestors
        let current = emp;
        while (current?.managerId) {
          current = employees.find(e => e.id == current.managerId);
          if (current) newVisibleIds.add(current.id);
        }
        
        // Add all descendants
        const showDescendants = (id) => {
            console.log('inside showDescendants line 93')
          employees
            .filter(e => e?.managerId == id)
            .forEach(e => {
              newVisibleIds.add(e.id);
              showDescendants(e.id);
            });
        };
        showDescendants(emp.id);
      }
    }
  
    setVisibleEmployeeIds(newVisibleIds);
    console.log('visibleEmployeeIds line 107', visibleEmployeeIds)
    setHighlightedEmployeeIds(newHighlightedIds);
  }, [employees, filteredEmployees, selectedTeam, selectedEmployee, isLoading, error]);

  // Toggle node expansion
  const toggleNode = (id) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Check if target is a descendant of source
  const isDescendant = (sourceId, targetId) => {
    if (sourceId == targetId) return true;
    return employees
      .filter(emp => emp.managerId == sourceId)
      .some(child => isDescendant(child.id, targetId));
  };

  // Drag and drop handlers
  const handleDragStart = (e, employee) => {
    setDraggedEmployee(employee);
    e.dataTransfer.setData('text/plain', employee.id);
  };

  const handleDragOver = (e, employee) => {
    e.preventDefault();
    if (!draggedEmployee || draggedEmployee.id == employee.id || isDescendant(draggedEmployee.id, employee.id)) {
      e.dataTransfer.dropEffect = 'none';
    } else {
      e.dataTransfer.dropEffect = 'move';
      setDropTarget(employee);
    }
  };

  const handleDrop = (e, targetEmployee) => {
    e.preventDefault();
    if (draggedEmployee && targetEmployee && 
        draggedEmployee.id !== targetEmployee.id && 
        !isDescendant(draggedEmployee.id, targetEmployee.id)) {
      onUpdateManager(draggedEmployee.id, targetEmployee.id);
    }
    setDraggedEmployee(null);
    setDropTarget(null);
  };

  // Employee Node Component
  const EmployeeNode = ({ employee , level = 0 }) => {
    console.log('employee and level is', employee, level)
    if (!employee || !visibleEmployeeIds.has(employee.id)) return null;

    console.log('above children', employees.filter(emp => emp?.managerId == employee.id), employees)
    const children = employees.filter(emp => emp?.managerId == employee.id);
    console.log('children is', children, employee.id, employees.managerId)
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(employee.id);
    const isDragging = draggedEmployee?.id == employee.id;
    const isHighlighted = highlightedEmployeeIds.has(employee.id);
    const isDropTarget = dropTarget?.id == employee.id;
    const isValidDrop = isDropTarget && draggedEmployee && 
                       draggedEmployee.id !== employee.id && 
                       !isDescendant(draggedEmployee.id, employee.id);

    const nodeClasses = [
      'org-node',
      isHighlighted && 'highlighted',
      isDragging && 'dragging',
      isDropTarget && (isValidDrop ? 'can-drop' : 'no-drop')
    ].filter(Boolean).join(' ');

    return (
      <div className="org-tree-node" style={{ marginLeft: `${level * 20}px` }}>
        <div 
          className={nodeClasses}
          draggable
          onDragStart={(e) => handleDragStart(e, employee)}
          onDragOver={(e) => handleDragOver(e, employee)}
          onDrop={(e) => handleDrop(e, employee)}
          onDragEnd={() => setDraggedEmployee(null)}
        >
          <div className="node-content">
            <div className="employee-details">
              <div className="employee-name">{employee.name}</div>
              <div className="employee-position">{employee.designation}</div>
              <div className="employee-team">{employee.team}</div>
            </div>
            {hasChildren && (
              <button 
                className="toggle-btn"
                onClick={() => toggleNode(employee.id)}
              >
                {isExpanded ? '−' : '+'}
              </button>
            )}
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div className="children-container">
            {children.map(child => (
              <EmployeeNode
                key={child.id}
                employee={child}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    console.log('rootEmployees', rootEmployees)
  })
  // Loading and error states
  if (isLoading) return <div className="loading-org-chart">Loading organization chart...</div>;
  if (error) return <div className="error-org-chart">{error}</div>;
  if (employees.length == 0) return <div className="no-results">No employees data available</div>;

  

  return (
    <div className="org-chart-container">
      <h2>
        {selectedTeam ? `Team: ${selectedTeam}` : 
         selectedEmployee ? `Viewing: ${selectedEmployee.name}` : 
         'Full Organization Chart'}
      </h2>
      
      {rootEmployees.length > 0 ? (
        <div className="org-chart">
          {rootEmployees.map(root => (
            <EmployeeNode
              key={root.id}
              employee={root}
            />
          ))}
        </div>
      ) : (
        <div className="no-results">
          No hierarchy found - check if any employee has managerId: null
        </div>
      )}
    </div>
  );
}

export default OrgChart;