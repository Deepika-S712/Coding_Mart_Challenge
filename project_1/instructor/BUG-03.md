# BUG 03: Attendance Field Validation Copy-Paste Flaw

## Bug Title
Invalid Student Attendance (> 100%) Accepted Due to Validation Logic Error

## Location
- Frontend: `frontend/src/components/StudentFormModal.jsx` (`validate` function)
- Backend: `src/main/java/com/sms/dto/StudentRequestDto.java` (field validation annotations)

## How to Reproduce
1. Log in and open the **Students** page.
2. Click **Register New Student**.
3. Fill out all required fields with valid data.
4. Set **Marks** to `85` (valid).
5. Set **Attendance %** to `150` (invalid, exceeds 100%).
6. Click **Save Student**.
7. Notice that:
   - The frontend form does NOT block submission.
   - The backend accepts the request and returns HTTP 201 Created.
   - The student is registered with 150% attendance!
8. Now try editing the student: change Marks to `105` and Attendance to `150`. Notice that NOW an attendance error appears!

## Expected Behavior
Attendance must be strictly constrained between 0% and 100%. If a user enters `150%`, the UI must show an error: `"Attendance must be between 0 and 100%"`, and the backend must reject the payload with HTTP 400 Bad Request.

## Actual Behavior
Attendance values greater than 100% are accepted as long as Marks is <= 100.

## Root Cause
1. **Frontend Flaw (`StudentFormModal.jsx`)**:
   ```javascript
   if (formData.marks !== '' && formData.marks !== null) {
     const marksNum = Number(formData.marks);
     if (isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
       newErrors.marks = 'Marks must be between 0 and 100';
     }
   }

   if (formData.attendance !== '' && formData.attendance !== null) {
     const attNum = Number(formData.attendance);
     // Copy-paste error: checked Number(formData.marks) > 100 instead of attNum > 100
     if (isNaN(attNum) || attNum < 0 || Number(formData.marks) > 100) {
       newErrors.attendance = 'Attendance must be between 0 and 100%';
     }
   }
   ```
2. **Backend Flaw (`StudentRequestDto.java`)**:
   ```java
   @Min(value = 0, message = "Attendance cannot be negative")
   private Double attendance;
   ```
   The developer included `@Max(100)` on `marks` but forgot `@Max(100)` on `attendance`.

## Incorrect Code Explanation
A classic developer copy-paste oversight: the block for validating `marks` was copied for `attendance`. The variable `marksNum` was updated to `attNum` on the left side of the check, but `Number(formData.marks) > 100` was left unchanged on the right side.

## Correct Solution
1. **In `frontend/src/components/StudentFormModal.jsx`**:
   ```javascript
   if (formData.attendance !== '' && formData.attendance !== null) {
     const attNum = Number(formData.attendance);
     if (isNaN(attNum) || attNum < 0 || attNum > 100) {
       newErrors.attendance = 'Attendance must be between 0 and 100%';
     }
   }
   ```
2. **In `src/main/java/com/sms/dto/StudentRequestDto.java`**:
   ```java
   @Min(value = 0, message = "Attendance cannot be negative")
   @Max(value = 100, message = "Attendance cannot exceed 100")
   private Double attendance;
   ```

## Why the Solution Works
Both frontend client-side validation and backend DTO constraint validation independently enforce `0 <= attendance <= 100`.

## Test Case
```java
@Test
void testAttendanceGreaterThan100ShouldFailValidation() {
    Validator validator = Validation.buildDefaultValidatorFactory().getValidator();
    StudentRequestDto dto = new StudentRequestDto();
    dto.setAttendance(150.0);
    Set<ConstraintViolation<StudentRequestDto>> violations = validator.validate(dto);
    assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("attendance")));
}
```

## Expected Test Result
Before fix: Test fails (no constraint violation on attendance).  
After fix: Test passes (constraint violation reported).

## Suggested AI Prompts
- **Good Prompt**: "When submitting our React student form with marks=80 and attendance=150, no validation error is shown and the backend saves 150% attendance. Inspect `StudentFormModal.jsx`'s `validate()` function and `StudentRequestDto.java` to find why 150% is permitted."
- **Bad Prompt**: "Form validation is broken, fix it."

## Common Incorrect AI Solutions
- Fixing only the frontend while ignoring the backend DTO, leaving the REST API vulnerable to direct invalid payload injection.

## How to Verify AI-Generated Fix
1. Open form in browser, type `105` in attendance: Error shows immediately.
2. Use curl/Postman to POST `{ "attendance": 150.0, ... }`: Server returns HTTP 400 Bad Request with field validation error.
