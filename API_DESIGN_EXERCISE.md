# API Design Exercise — Completed

| Resource | Endpoint | Method | Request Body | Success | Errors |
|---|---|---|---|---|---|
| Student | `/students` | GET | — | 200 | 500 |
| Student | `/students/{id}` | GET | — | 200 | 404 |
| Student | `/students` | POST | Student JSON | 201 | 400 |
| Student | `/students/{id}` | PUT/PATCH | Student JSON | 200 | 400, 404 |
| Student | `/students/{id}` | DELETE | — | 204 | 404 |

## Why are these endpoints resource-oriented?

The endpoint names identify resources rather than actions. `/students` identifies the collection of Student resources, while `/students/{id}` identifies a particular Student. The operation is expressed by the HTTP method instead of action words such as `/createStudent` or `/deleteStudent`.

## Why are these HTTP methods appropriate?

- **GET** retrieves resources and does not modify the data.
- **POST** creates a new Student in the collection, so **201 Created** is appropriate.
- **PUT** replaces/updates a Student and returns **200 OK** when successful.
- **PATCH** supports partial updates and returns **200 OK** when successful.
- **DELETE** removes a Student; **204 No Content** confirms successful deletion without a response body.
- **400 Bad Request** is used for invalid or incomplete request data.
- **404 Not Found** is used when the requested Student ID does not exist.
- **500 Internal Server Error** represents an unexpected server-side failure.
