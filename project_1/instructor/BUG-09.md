# BUG 09: Concurrent Modification Lost Update Anomaly

## Bug Title
Lost Update Data Corruption Under Concurrent Edits Due to Missing Optimistic Locking

## Location
- Backend Entity: `src/main/java/com/sms/entity/Student.java`
- Backend DTO: `src/main/java/com/sms/dto/StudentRequestDto.java` & `StudentResponseDto.java`
- Backend Service: `src/main/java/com/sms/service/StudentServiceImpl.java` (`updateStudent` method)

## How to Reproduce
1. Open two separate browser windows (or tabs) logged in as `teacher` or `admin`.
2. Both users open student Alice Johnson (`id: 1`) for editing.
   - Initial state: Marks = `92.5`, Attendance = `96.0`, Phone = `+1-555-0101`.
3. In Window A:
   - User A changes Alice's Phone to `+1-555-9999`.
   - User A clicks **Update Student**.
   - Window A shows success: Phone is now `+1-555-9999`.
4. In Window B (which still has the stale form loaded with old phone `+1-555-0101`):
   - User B changes Alice's Marks to `98.0`.
   - User B clicks **Update Student**.
5. Refresh Window A:
   - Notice Alice's marks are `98.0`, but Alice's Phone has been reverted back to `+1-555-0101`!
   - User A's update was silently overwritten and lost without warning!

## Expected Behavior
The application should prevent blind overwrites. If User B attempts to save an update based on stale entity state while User A has already committed changes, the system should detect the concurrency conflict and return `HTTP 409 Conflict` (or prompt the user that the record was modified by another user).

## Actual Behavior
The second write silently overwrites all fields of the record, permanently destroying the concurrent changes made by the first user (the classic "Lost Update" phenomenon).

## Root Cause
1. In `Student.java`:
   There is no `@Version` column. JPA/Hibernate performs a blind update:
   `UPDATE students SET ... WHERE id = 1;`
   Without a version check (`WHERE id = 1 AND version = ?`), Hibernate does not know the entity was modified since User B retrieved it.
2. In `StudentServiceImpl.java`:
   The `updateStudent` method replaces all fields of the existing entity with the incoming DTO fields, even fields that User B did not intend to touch.

## Incorrect Code Explanation
In multi-user enterprise web applications, stateless REST updates without optimistic concurrency control permit concurrent users to overwrite each other's work without detection.

## Correct Solution
1. **In `Student.java`**:
   Add an optimistic locking version field:
   ```java
   @Version
   private Long version;

   public Long getVersion() {
       return version;
   }

   public void setVersion(Long version) {
       this.version = version;
   }
   ```
2. **In `StudentRequestDto.java` & `StudentResponseDto.java`**:
   Include `version` in DTO transfers:
   ```java
   private Long version;
   ```
3. **In `StudentServiceImpl.java`**:
   Verify entity version or let JPA automatically manage it:
   When User B submits an outdated version number, Hibernate detects `version != current_version` and throws `OptimisticLockException` (which Spring translates to `ObjectOptimisticLockingFailureException`).
4. **In `GlobalExceptionHandler.java`**:
   Handle `OptimisticLockException` / `ObjectOptimisticLockingFailureException` and return `HTTP 409 Conflict`:
   ```java
   @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
   public ResponseEntity<ErrorResponseDto> handleOptimisticLock(HttpServletRequest request) {
       return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponseDto(
               HttpStatus.CONFLICT.value(),
               "Conflict",
               "This record was modified by another user. Please refresh and try again.",
               request.getRequestURI()
       ));
   }
   ```

## Why the Solution Works
JPA's `@Version` mechanism automatically appends `AND version = ?` to the update query. If another transaction has already incremented the version, the update row count is 0, causing Hibernate to roll back and throw an optimistic lock exception, safely protecting data integrity.

## Test Case
```java
@Test
void testStudentEntityHasVersionAnnotation() {
    boolean hasVersion = false;
    for (Field f : Student.class.getDeclaredFields()) {
        if (f.isAnnotationPresent(Version.class)) {
            hasVersion = true;
            break;
        }
    }
    assertTrue(hasVersion, "Student entity must implement @Version for optimistic locking");
}
```

## Expected Test Result
Before fix: `hasVersion` is false (test fails).  
After fix: `hasVersion` is true (test passes).

## Suggested AI Prompts
- **Good Prompt**: "Two teachers editing the same student record can overwrite each other's changes. For example, if Teacher A updates phone number and Teacher B updates marks, Teacher B's submit wipes out Teacher A's phone update. How can we implement optimistic concurrency locking in Spring Boot Data JPA using `@Version` and DTOs?"
- **Bad Prompt**: "Fix data overwrite."

## Common Incorrect AI Solutions
- AI might suggest pessimistic locking (`LockModeType.PESSIMISTIC_WRITE`) which blocks database transactions and causes deadlocks in stateless REST APIs.

## How to Verify AI-Generated Fix
1. Simulate concurrent update using two requests with the same original version.
2. The first request succeeds.
3. The second request is rejected with HTTP 409 Conflict.
