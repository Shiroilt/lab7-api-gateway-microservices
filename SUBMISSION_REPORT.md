# LAB 3 — RESTful Web Services Submission

## Objective

Build a resource-oriented Student Management REST API with CRUD operations, validation, error handling, Postman testing and OpenAPI/Swagger documentation, while learning equivalent REST behavior in Express.js and Spring Boot.

## Implementation

### Express.js
Complete CRUD is implemented using an in-memory array:
- GET `/students`
- GET `/students/:id`
- POST `/students`
- PUT `/students/:id`
- PATCH `/students/:id`
- DELETE `/students/:id`

### Spring Boot
The equivalent architecture is implemented:
`StudentController → StudentService → StudentRepository`

GET and POST are the required equivalent endpoints; PUT and DELETE are also included for completeness.

## Validation and errors

Both implementations reject invalid student data with HTTP 400. Missing IDs return 404. Unexpected failures are handled with HTTP 500.

## OpenAPI / Swagger

Both projects expose interactive Swagger UI and an OpenAPI JSON endpoint.

## Testing

A Postman collection is included with positive CRUD requests and negative tests for invalid IDs and invalid request bodies.

## API design conclusion

The API is resource-oriented because URIs identify Student resources and HTTP methods communicate the operation. The status codes clearly communicate success and failure.

## Scope compliance

No database integration is included. Lab 3 uses in-memory data as required by the assignment.
