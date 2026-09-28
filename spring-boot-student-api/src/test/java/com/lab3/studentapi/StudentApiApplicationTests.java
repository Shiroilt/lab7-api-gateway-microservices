package com.lab3.studentapi;

import com.lab3.studentapi.model.Student;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class StudentApiApplicationTests {

    @LocalServerPort
    int port;

    @Autowired
    TestRestTemplate restTemplate;

    @Test
    void getStudentsReturns200() {
        ResponseEntity<String> response =
            restTemplate.getForEntity("http://localhost:" + port + "/students", String.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().contains("Aarav Patel"));
    }

    @Test
    void postStudentReturns201() {
        Student student = new Student(null, "Test Student", "test@example.com", "Computer Science", 2);
        ResponseEntity<Student> response =
            restTemplate.postForEntity("http://localhost:" + port + "/students", student, Student.class);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().getId());
    }

    @Test
    void invalidStudentReturns400() {
        Student student = new Student(null, "", "bad", "Computer Science", -2);
        ResponseEntity<String> response =
            restTemplate.postForEntity("http://localhost:" + port + "/students", student, String.class);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}
