package com.lab3.studentapi.controller;

import com.lab3.studentapi.model.Student;
import com.lab3.studentapi.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/students")
@Tag(name = "Students", description = "Student REST operations")
public class StudentController {
    private final StudentService service;

    public StudentController(StudentService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "List all students")
    @ApiResponse(responseCode = "200", description = "Students returned successfully")
    public ResponseEntity<List<Student>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get one student")
    @ApiResponse(responseCode = "200", description = "Student found")
    @ApiResponse(responseCode = "404", description = "Student not found")
    public ResponseEntity<Student> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @Operation(summary = "Create a student")
    @ApiResponse(responseCode = "201", description = "Student created")
    @ApiResponse(responseCode = "400", description = "Invalid request")
    public ResponseEntity<Student> create(@Valid @RequestBody Student student) {
        Student created = service.create(student);
        return ResponseEntity.created(URI.create("/students/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a student")
    @ApiResponse(responseCode = "200", description = "Student updated")
    @ApiResponse(responseCode = "400", description = "Invalid request")
    @ApiResponse(responseCode = "404", description = "Student not found")
    public ResponseEntity<Student> update(@PathVariable Long id, @Valid @RequestBody Student student) {
        return ResponseEntity.ok(service.update(id, student));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a student")
    @ApiResponse(responseCode = "204", description = "Student deleted")
    @ApiResponse(responseCode = "404", description = "Student not found")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
