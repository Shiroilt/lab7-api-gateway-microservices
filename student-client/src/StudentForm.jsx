import React, { useState, useEffect } from 'react';

const StudentForm = ({ student, onSuccess, onCancel, apiUrl }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: '',
    semester: 1
  });
  
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        email: student.email,
        course: student.course,
        semester: student.semester
      });
    } else {
      setFormData({
        name: '',
        email: '',
        course: '',
        semester: 1
      });
    }
    setErrors([]);
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'semester' ? parseInt(value) || 1 : value
    }));
  };

  const validate = () => {
    const newErrors = [];
    if (!formData.name.trim()) newErrors.push("Name must be a non-empty string");
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push("Email must be a valid email address");
    }
    if (!formData.course.trim()) newErrors.push("Course must be a non-empty string");
    if (formData.semester < 1) newErrors.push("Semester must be an integer greater than or equal to 1");
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    setErrors([]);
    
    try {
      const url = student ? `${apiUrl}/students/${student.id}` : `${apiUrl}/students`;
      const method = student ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setFormData({ name: '', email: '', course: '', semester: 1 });
        onSuccess();
      } else if (response.status === 400) {
        const errorData = await response.json();
        setErrors(errorData.details || ["Validation failed on server"]);
      } else if (response.status === 404) {
        setErrors(["Student not found"]);
      } else {
        setErrors(["An unexpected error occurred. Please try again."]);
      }
    } catch (err) {
      setErrors(["Unable to connect to the server."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="student-form">
      {errors.length > 0 && (
        <div className="form-errors">
          <ul>
            {errors.map((err, idx) => <li key={idx}>{err}</li>)}
          </ul>
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          value={formData.name} 
          onChange={handleChange} 
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          value={formData.email} 
          onChange={handleChange} 
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="course">Course:</label>
        <input 
          type="text" 
          id="course" 
          name="course" 
          value={formData.course} 
          onChange={handleChange} 
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="semester">Semester:</label>
        <input 
          type="number" 
          id="semester" 
          name="semester" 
          min="1"
          value={formData.semester} 
          onChange={handleChange} 
        />
      </div>
      
      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (student ? 'Update Student' : 'Add Student')}
        </button>
        {onCancel && (
          <button type="button" className="cancel-btn" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default StudentForm;
