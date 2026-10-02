# BUG 07: HTTP 500 Internal Server Error for Non-Existent Student

## Bug Title
Querying Non-Existent Student ID Produces 500 Internal Server Error Instead of 404 Not Found

## Location
- Backend Service: `src/main/java/com/sms/service/StudentServiceImpl.java` (`getStudentById` method)
- Backend Exception Handler: `src/main/java/com/sms/exception/GlobalExceptionHandler.java`

## How to Reproduce
1. Log in and obtain a valid auth token.
2. Send an HTTP GET request to a non-existent student ID, for example:
   ```bash
   curl -H "Authorization: Bearer <token>" http://localhost:8080/api/students/999999
   ```
3. Inspect the HTTP status code and response payload:
   - Status code: `500 Internal Server Error`
   - Payload:
     ```json
     {
       "timestamp": "...",
       "status": 500,
       "error": "Internal Server Error",
       "message": "No value present",
       "path": "/api/students/999999"
     }
     ```

## Expected Behavior
When a requested resource ID does not exist in the database, the server must return `404 Not Found` with a clear message: `"Student not found with ID: 999999"`.

## Actual Behavior
The server crashes with an unhandled `java.util.NoSuchElementException`, caught by the generic `Exception.class` handler which returns HTTP 500.

## Root Cause
In `StudentServiceImpl.java`, line 40:
```java
@Override
public StudentResponseDto getStudentById(Long id) {
    // Retrieve student by ID
    Student student = studentRepository.findById(id).get();
    return toDto(student);
}
```
Calling `Optional.get()` when the `Optional` is empty throws `java.util.NoSuchElementException: No value present`.

In `GlobalExceptionHandler.java`, there is a handler for `ResourceNotFoundException.class` (which returns 404), but NO handler for `NoSuchElementException.class`. Consequently, `NoSuchElementException` is caught by `@ExceptionHandler(Exception.class)`, generating HTTP 500.

## Incorrect Code Explanation
Calling `.get()` directly on a Java `Optional` without checking `.isPresent()` or using `.orElseThrow(...)` is an anti-pattern that circumvents standard domain exception handling.

## Correct Solution
In `StudentServiceImpl.java`:
```java
@Override
public StudentResponseDto getStudentById(Long id) {
    Student student = studentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));
    return toDto(student);
}
```
Additionally, as defense-in-depth in `GlobalExceptionHandler.java`:
```java
@ExceptionHandler(NoSuchElementException.class)
public ResponseEntity<ErrorResponseDto> handleNoSuchElement(NoSuchElementException ex, HttpServletRequest request) {
    ErrorResponseDto error = new ErrorResponseDto(
            HttpStatus.NOT_FOUND.value(),
            "Not Found",
            "The requested resource was not found",
            request.getRequestURI()
    );
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
}
```

## Why the Solution Works
Using `.orElseThrow(() -> new ResourceNotFoundException(...))` guarantees that a custom domain exception is raised, which matches `@ExceptionHandler(ResourceNotFoundException.class)` and returns a standardized HTTP 404 Not Found response.

## Test Case
```java
@Test
@WithMockUser(username = "admin", roles = {"ADMIN"})
void testGetNonExistentStudentReturns404() throws Exception {
    mockMvc.perform(get("/api/students/999999")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.status").value(404));
}
```

## Expected Test Result
Before fix: Returns 500 (test fails).  
After fix: Returns 404 (test passes).

## Suggested AI Prompts
- **Good Prompt**: "When calling `GET /api/students/999999`, the API returns 500 Internal Server Error with message 'No value present'. Here is `StudentServiceImpl.java` and `GlobalExceptionHandler.java`. Why is this throwing 500 instead of 404, and how should it be structured according to Spring Boot best practices?"
- **Bad Prompt**: "Fix 500 error on get student."

## Common Incorrect AI Solutions
- AI might catch `Exception` inside the controller method and return `null` instead of throwing a domain exception handled by `@ControllerAdvice`.

## How to Verify AI-Generated Fix
1. Send `GET /api/students/999999`.
2. Verify HTTP status code is exactly `404`.
3. Verify JSON response body contains `"status": 404` and `"error": "Not Found"`.
