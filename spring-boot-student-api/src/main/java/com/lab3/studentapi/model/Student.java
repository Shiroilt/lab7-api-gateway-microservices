package com.lab3.studentapi.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class Student {
    private Long id;

    @NotBlank(message = "name must not be blank")
    private String name;

    @NotBlank(message = "email must not be blank")
    @Email(message = "email must be valid")
    private String email;

    @NotBlank(message = "course must not be blank")
    private String course;

    @NotNull(message = "semester is required")
    @Min(value = 1, message = "semester must be at least 1")
    private Integer semester;

    public Student() {}

    public Student(Long id, String name, String email, String course, Integer semester) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.course = course;
        this.semester = semester;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
}
