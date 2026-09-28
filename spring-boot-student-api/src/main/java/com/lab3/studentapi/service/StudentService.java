package com.lab3.studentapi.service;

import com.lab3.studentapi.model.Student;
import com.lab3.studentapi.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {
    private final StudentRepository repository;

    public StudentService(StudentRepository repository) {
        this.repository = repository;
    }

    public List<Student> getAll() {
        return repository.findAll();
    }

    public Student getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new StudentNotFoundException(id));
    }

    public Student create(Student student) {
        if (repository.existsByEmail(student.getEmail(), null)) {
            throw new DuplicateEmailException(student.getEmail());
        }
        student.setId(null);
        return repository.save(student);
    }

    public Student update(Long id, Student incoming) {
        Student existing = getById(id);

        if (repository.existsByEmail(incoming.getEmail(), id)) {
            throw new DuplicateEmailException(incoming.getEmail());
        }

        existing.setName(incoming.getName());
        existing.setEmail(incoming.getEmail());
        existing.setCourse(incoming.getCourse());
        existing.setSemester(incoming.getSemester());
        return repository.save(existing);
    }

    public void delete(Long id) {
        getById(id);
        repository.deleteById(id);
    }

    public static class StudentNotFoundException extends RuntimeException {
        public StudentNotFoundException(Long id) {
            super("No student exists with id " + id);
        }
    }

    public static class DuplicateEmailException extends RuntimeException {
        public DuplicateEmailException(String email) {
            super("Email already exists: " + email);
        }
    }
}
