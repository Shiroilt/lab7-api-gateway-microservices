import React from 'react';

const StudentList = ({ students, onEdit, onDelete }) => {
  if (students.length === 0) {
    return <p>No students found. Add one above!</p>;
  }

  return (
    <table className="student-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Course</th>
          <th>Semester</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {students.map((student) => (
          <tr key={student.id}>
            <td>{student.id}</td>
            <td>{student.name}</td>
            <td>{student.email}</td>
            <td>{student.course}</td>
            <td>{student.semester}</td>
            <td>
              <button className="edit-btn" onClick={() => onEdit(student)}>Edit</button>
              <button className="delete-btn" onClick={() => onDelete(student.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StudentList;
