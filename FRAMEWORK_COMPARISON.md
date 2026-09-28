# Express.js vs Spring Boot

| REST concern | Express.js | Spring Boot |
|---|---|---|
| Routing | Express route handlers | `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping` |
| Request JSON | `express.json()` | `@RequestBody` |
| Validation | Explicit checks / validation library | Spring Validation annotations |
| Business layer | Route/service functions as appropriate | Controller → Service → Repository |
| Testing | Postman | Postman |
| Documentation | OpenAPI/Swagger tooling | OpenAPI/Swagger tooling |

## Equivalent GET trace in Spring Boot

`GET /students`
→ `StudentController.getAll()`
→ `StudentService.getAll()`
→ `StudentRepository.findAll()`
→ Controller returns HTTP 200 + JSON list.

## Equivalent POST trace in Spring Boot

`POST /students`
→ `StudentController.create()`
→ `@Valid` validates the request
→ `StudentService.create()`
→ `StudentRepository.save()`
→ Controller returns HTTP 201 + created Student.

## REST vs framework

REST is the architectural style/paradigm. Express.js and Spring Boot are implementation technologies that can expose RESTful endpoints. The HTTP method, URI design, representations, validation and status-code behavior can remain equivalent even though the code structure differs.
