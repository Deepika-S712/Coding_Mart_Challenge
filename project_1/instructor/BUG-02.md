# BUG 02: Case-Sensitive Email Prefix Search Mismatch

## Bug Title
Student Search Fails for Email Domain or Substring Queries

## Location
- `src/main/java/com/sms/repository/StudentRepository.java` (`searchStudents` method `@Query`)

## How to Reproduce
1. Log in to the application and navigate to the **Students** page.
2. Search for `"Alice"` or `"STU1001"`: Alice Johnson appears in the search results.
3. Now search for `"dundermifflin.edu"` or `"university.edu"` or `"scott"`:
   - Expected: Students matching the email domain or name should be returned (e.g., Michael Scott has email `michael.scott@dundermifflin.edu`).
   - Actual: 0 students are returned!
4. Search for uppercase email `"ALICE.JOHNSON"`: 0 students are returned.

## Expected Behavior
Searching by email should be case-insensitive and match substrings anywhere in the email address (e.g. searching `"university.edu"` or `"dunder"` should match all corresponding students).

## Actual Behavior
Email searching only matches from the exact start of the email string and is case-sensitive, causing domain and substring searches to return 0 results.

## Root Cause
In `StudentRepository.java`:
```java
@Query("SELECT s FROM Student s WHERE " +
       "(:query IS NULL OR :query = '' OR " +
       "LOWER(s.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
       "LOWER(s.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
       "LOWER(s.studentId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
       "s.email LIKE CONCAT(:query, '%')) " +
       "AND (:department IS NULL OR :department = '' OR s.department = :department)")
Page<Student> searchStudents(@Param("query") String query,
                            @Param("department") String department,
                            Pageable pageable);
```
Notice the email predicate:
`s.email LIKE CONCAT(:query, '%')`
1. It lacks `LOWER(s.email)` and `LOWER(:query)`.
2. It uses `CONCAT(:query, '%')` (prefix match only) instead of `CONCAT('%', :query, '%')` (substring match).

## Incorrect Code Explanation
The developer wrapped `firstName`, `lastName`, and `studentId` with `LOWER()` and `%...%`, but for `s.email`, they wrote a prefix-only expression without case conversion.

## Correct Solution
```java
@Query("SELECT s FROM Student s WHERE " +
       "(:query IS NULL OR :query = '' OR " +
       "LOWER(s.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
       "LOWER(s.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
       "LOWER(s.studentId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
       "LOWER(s.email) LIKE LOWER(CONCAT('%', :query, '%'))) " +
       "AND (:department IS NULL OR :department = '' OR s.department = :department)")
```

## Why the Solution Works
Using `LOWER(s.email) LIKE LOWER(CONCAT('%', :query, '%'))` ensures that:
1. Searches are case-insensitive.
2. Matches occur anywhere within the email string, including domain names, user handles, and middle portions.

## Test Case
```java
@Test
void testSearchByEmailDomainSubstring() {
    PageResponseDto<StudentResponseDto> result = studentService.searchStudents("dundermifflin.edu", null, 1, 10);
    assertFalse(result.getContent().isEmpty());
    assertEquals("michael.scott@dundermifflin.edu", result.getContent().get(0).getEmail());
}
```

## Expected Test Result
Before fix: Returns 0 results.  
After fix: Returns 1 result (Michael Scott).

## Suggested AI Prompts
- **Good Prompt**: "In our Spring Boot JPA repository, `searchStudents` finds students by first name and ID, but searching by email domain (e.g. 'dundermifflin.edu' or '@university.edu') returns 0 results. Here is the `@Query` definition in `StudentRepository.java`. Please compare how the `email` field is queried versus `firstName`."
- **Bad Prompt**: "Why is search broken?"

## Common Incorrect AI Solutions
- AI might suggest removing JPA `@Query` and switching to complicated Specifications or Elasticsearch when the fix only requires adding `LOWER()` and `%` wildcards.

## How to Verify AI-Generated Fix
1. Perform search with `"dundermifflin.edu"`: Michael Scott appears.
2. Perform search with uppercase `"ALICE"`: Alice Johnson appears.
3. Perform search with `"STU1001"`: Still works as before (no regression).
