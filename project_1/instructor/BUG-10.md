# BUG 10: JPQL Injection in Dynamic Department Filter

## Bug Title
Dynamic JPQL Concatenation in Department Filter Allows Query Injection

## Location
- Backend Repository: `src/main/java/com/sms/repository/StudentCustomRepositoryImpl.java` (`filterByDepartmentAndYear` method)
- Backend Controller: `src/main/java/com/sms/controller/StudentController.java` (`GET /api/students/filter-by-department`)

## How to Reproduce
1. Log in and acquire a valid Bearer token.
2. Normal search for Department "Computer Science":
   ```bash
   curl -H "Authorization: Bearer <token>" "http://localhost:8080/api/students/filter-by-department?dept=Computer%20Science"
   ```
   Returns only students enrolled in Computer Science (6 records).
3. Now test with a non-destructive JPQL injection payload:
   ```bash
   curl -H "Authorization: Bearer <token>" "http://localhost:8080/api/students/filter-by-department?dept=Computer%20Science'%20OR%20'1'='1"
   ```
4. Observe the response:
   - Instead of filtering to Computer Science, the response returns ALL 25 students across Mechanical, Civil, Electronics, and IT departments!
5. Test another payload:
   ```bash
   curl -H "Authorization: Bearer <token>" "http://localhost:8080/api/students/filter-by-department?dept=' OR s.passed = false OR '1'='"
   ```
   Arbitrary JPQL predicates can be injected into the query structure!

## Expected Behavior
Search parameters must be treated strictly as literal data values via parameterized queries or JPA Criteria API, preventing any user input from altering query grammar or semantics.

## Actual Behavior
User-supplied input is directly concatenated into a JPQL query string, allowing attackers to inject boolean expressions and bypass filtering restrictions.

## Root Cause
In `StudentCustomRepositoryImpl.java`:
```java
@Override
public List<Student> filterByDepartmentAndYear(String department, Integer year) {
    StringBuilder jpql = new StringBuilder("SELECT s FROM Student s WHERE 1=1");

    if (department != null && !department.trim().isEmpty()) {
        jpql.append(" AND s.department = '").append(department).append("'");
    }
    if (year != null) {
        jpql.append(" AND s.year = ").append(year);
    }
    jpql.append(" ORDER BY s.id ASC");

    return entityManager.createQuery(jpql.toString(), Student.class).getResultList();
}
```
`jpql.append(" AND s.department = '").append(department).append("'")` embeds untrusted input directly into the query string without parameter binding or escaping.

## Incorrect Code Explanation
String concatenation of query strings in persistence layers bypasses lexical analysis separation between code and data, leading directly to SQL/JPQL Injection vulnerabilities (OWASP Top 10 A03:2021-Injection).

## Correct Solution
Use parameterized JPQL queries with named parameters:
```java
@Override
public List<Student> filterByDepartmentAndYear(String department, Integer year) {
    StringBuilder jpql = new StringBuilder("SELECT s FROM Student s WHERE 1=1");
    Map<String, Object> params = new HashMap<>();

    if (department != null && !department.trim().isEmpty()) {
        jpql.append(" AND s.department = :department");
        params.put("department", department.trim());
    }
    if (year != null) {
        jpql.append(" AND s.year = :year");
        params.put("year", year);
    }
    jpql.append(" ORDER BY s.id ASC");

    TypedQuery<Student> query = entityManager.createQuery(jpql.toString(), Student.class);
    params.forEach(query::setParameter);

    return query.getResultList();
}
```
Or refactor to use JPA CriteriaBuilder:
```java
CriteriaBuilder cb = entityManager.getCriteriaBuilder();
CriteriaQuery<Student> cq = cb.createQuery(Student.class);
Root<Student> root = cq.from(Student.class);
List<Predicate> predicates = new ArrayList<>();

if (department != null && !department.trim().isEmpty()) {
    predicates.add(cb.equal(root.get("department"), department.trim()));
}
if (year != null) {
    predicates.add(cb.equal(root.get("year"), year));
}
cq.where(predicates.toArray(new Predicate[0]));
return entityManager.createQuery(cq).getResultList();
```

## Why the Solution Works
Parameterized queries guarantee that parameters are transmitted to the persistence engine strictly as typed values, making it syntactically impossible for user input to break out of literal strings into query keywords.

## Test Case
```java
@Test
void testJpqlInjectionPayloadIsTreatedAsLiteral() {
    String maliciousDept = "Computer Science' OR '1'='1";
    List<Student> result = studentCustomRepository.filterByDepartmentAndYear(maliciousDept, null);
    // Should return 0 results because no department is literally named "Computer Science' OR '1'='1"
    assertEquals(0, result.size());
}
```

## Expected Test Result
Before fix: Returns 25 students (test fails).  
After fix: Returns 0 students (test passes).

## Suggested AI Prompts
- **Good Prompt**: "In `StudentCustomRepositoryImpl.java`, the method `filterByDepartmentAndYear` constructs a dynamic query using `StringBuilder.append()`. When passing `dept=Computer Science' OR '1'='1`, it returns all records. Explain the vulnerability and refactor the method to use safe parameterized query binding with `TypedQuery.setParameter()`."
- **Bad Prompt**: "Fix SQL injection."

## Common Incorrect AI Solutions
- AI might suggest regex sanitization or replacing single quotes (`department.replace("'", "''")`) instead of adopting industry-standard parameterized queries.

## How to Verify AI-Generated Fix
1. Execute query with injection string `Computer Science' OR '1'='1'`: Returns 0 records.
2. Execute query with legitimate value `Computer Science`: Returns exactly 6 records.
