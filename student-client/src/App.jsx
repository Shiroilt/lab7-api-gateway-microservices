import { useState, useEffect } from 'react'
import StudentList from './StudentList'
import StudentForm from './StudentForm'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/students`);
      if (!response.ok) {
        throw new Error('Unable to load data. Please try again.');
      }
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      setError('Unable to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchStudents();
      } else if (response.status === 404) {
        alert('Student not found');
      } else {
        alert('Unable to delete student. Please try again.');
      }
    } catch (err) {
      alert('Unable to connect to the server.');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
  };

  const handleFormSuccess = () => {
    setEditingStudent(null);
    fetchStudents();
  };

  const cancelEdit = () => {
    setEditingStudent(null);
  };

  return (
    <div className="container">
      <h1>Student Management System</h1>
      
      {error && <div className="error-banner">{error}</div>}
      
      <div className="content">
        <div className="form-section">
          <h2>{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
          <StudentForm 
            student={editingStudent} 
            onSuccess={handleFormSuccess} 
            onCancel={editingStudent ? cancelEdit : null}
            apiUrl={API_BASE_URL}
          />
        </div>
        
        <div className="list-section">
          <h2>Student List</h2>
          {loading ? (
            <p>Loading students...</p>
          ) : (
            <StudentList 
              students={students} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
