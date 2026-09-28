package com.lab3.studentapi.repository;

import com.lab3.studentapi.model.Student;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class StudentRepository {
    private final AtomicLong idGenerator = new AtomicLong(3);

    private final List<Student> students = new ArrayList<>(List.of(
        new Student(1L, "Aarav Patel", "aarav@example.com", "Computer Science", 5),
        new Student(2L, "Diya Shah", "diya@example.com", "Information Technology", 3),
        new Student(3L, "Rohan Mehta", "rohan@example.com", "Computer Science", 7)
    ));

    public synchronized List<Student> findAll() {
        return new ArrayList<>(students);
    }

    public synchronized Optional<Student> findById(Long id) {
        return students.stream().filter(s -> s.getId().equals(id)).findFirst();
    }

    public synchronized Student save(Student student) {
        if (student.getId() == null) {
            student.setId(idGenerator.incrementAndGet());
        }
        students.removeIf(s -> s.getId().equals(student.getId()));
        students.add(student);
        return student;
    }

    public synchronized boolean existsByEmail(String email, Long ignoreId) {
        return students.stream().anyMatch(s ->
            s.getEmail().equalsIgnoreCase(email) &&
            (ignoreId == null || !s.getId().equals(ignoreId))
        );
    }

    public synchronized void deleteById(Long id) {
        students.removeIf(s -> s.getId().equals(id));
    }
}
