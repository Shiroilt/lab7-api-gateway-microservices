# Postman Testing & Evidence Guide

The supplied assignment asks for Postman evidence covering CRUD plus negative tests. The included collection is ready to import.

## Expected test results

| Test | Expected |
|---|---|
| GET `/students` | 200 |
| GET `/students/1` | 200 |
| GET `/students/9999` | 404 |
| POST `/students` with valid JSON | 201 |
| POST `/students` with invalid JSON fields | 400 |
| PUT `/students/1` with valid JSON | 200 |
| PATCH `/students/1` with valid partial JSON | 200 |
| DELETE `/students/1` | 204 |

## How to capture the required screenshots

1. Start the Express server.
2. Import `postman_collection.json` into Postman.
3. Run each request.
4. Capture screenshots showing the method, URL, response status and JSON response.
5. Open `http://localhost:3000/api-docs`.
6. Capture a Swagger UI screenshot with the Student endpoints visible.
7. Use Swagger **Try it out** on at least one endpoint and capture the result.

For Spring Boot, change the Postman `baseUrl` variable to `http://localhost:8080` and open its Swagger UI URL from the README.
