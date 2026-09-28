# Sample API Responses

## GET /students — 200

```json
[
  {
    "id": 1,
    "name": "Aarav Patel",
    "email": "aarav@example.com",
    "course": "Computer Science",
    "semester": 5
  }
]
```

## POST /students — 201

```json
{
  "id": 4,
  "name": "New Student",
  "email": "newstudent@example.com",
  "course": "Computer Science",
  "semester": 5
}
```

## Invalid request — 400

```json
{
  "error": "Validation failed",
  "details": [
    "name must be a non-empty string",
    "email must be a valid email address",
    "course must be a non-empty string",
    "semester must be an integer greater than or equal to 1"
  ]
}
```

## Unknown ID — 404

```json
{
  "error": "Student not found",
  "details": [
    "No student exists with id 9999"
  ]
}
```
