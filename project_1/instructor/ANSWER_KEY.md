# Instructor Master Answer Key: 10 Intentional Bugs

> **CONFIDENTIAL — INSTRUCTOR AND EVALUATOR USE ONLY**  
> Do not distribute or commit this file to student-facing branches.

---

## 1. Executive Bug Matrix

| # | Bug Title | Layer | Primary File | Difficulty | Root Cause Summary |
|---|---|---|---|---|---|
| **01** | Login Authentication Bypass for Temporary Accounts | Backend Auth | `AuthService.java` | Beginner | `if (!user.isTemporaryPassword() \|\| request.getPassword().isEmpty())` accepts any non-empty password when `isTemporaryPassword` is true. |
| **02** | Case-Sensitive Email Prefix Search Mismatch | Backend Repository | `StudentRepository.java` | Beginner → Intermediate | `s.email LIKE CONCAT(:query, '%')` performs case-sensitive prefix matching rather than case-insensitive substring matching. |
| **03** | Attendance Field Validation Copy-Paste Flaw | Frontend & Backend DTO | `StudentFormModal.jsx` & `StudentRequestDto.java` | Intermediate | Frontend validates `marks > 100` instead of attendance due to copy-paste; backend DTO is missing `@Max(100)` on attendance. |
| **04** | Duplicate Student ID Allowed During Creation | Backend Service & Entity | `StudentServiceImpl.java` & `Student.java` | Intermediate | `if (request.getId() != null && existsByStudentId)` skips duplicate check on create (`id` is null); entity lacks `unique = true`. |
| **05** | Deletion of Incorrect Student on Filtered View | Frontend State | `StudentsPage.jsx` | Intermediate | `handleDeleteClick` resolves `targetId = cachedStudents[index].id`, mapping filtered row index to unfiltered array index. |
| **06** | Pagination Last Page Truncation (Off-by-One) | Backend DTO | `PageResponseDto.java` | Intermediate | `totalPages = (int)(totalElements / pageSize)` truncates remainder without ceiling; last page of results is inaccessible. |
| **07** | HTTP 500 Internal Server Error for Non-Existent Student | Backend Service & Global Handler | `StudentServiceImpl.java` & `GlobalExceptionHandler.java` | Intermediate → Advanced | `Optional.get()` throws unhandled `NoSuchElementException`, falling through to generic 500 handler instead of returning 404. |
| **08** | Academic Grade Boundary & Pass/Fail Logical Flaw | Backend Service | `GradingService.java` | Advanced | `marks > 70.0` assigns grade 'C' to 70.0; `marks >= 40 \|\| attendance >= 75` passes failing students with low marks. |
| **09** | Concurrent Modification Lost Update Anomaly | Database Entity & Service | `Student.java` | Advanced | Entity lacks `@Version` optimistic locking; concurrent updates overwrite entire row without conflict detection. |
| **10** | JPQL Injection in Dynamic Department Filter | Backend Security | `StudentCustomRepositoryImpl.java` | Advanced | Dynamic query builds JPQL via string concatenation: `AND s.department = '` + dept + `'`, allowing arbitrary JPQL injection. |

---

## 2. Bug Distribution Verification

- **Frontend-related**: Bugs 03, 05, 06 (3 bugs)
- **Backend-related**: Bugs 01, 02, 04, 07, 08 (5 bugs)
- **Database / Data Consistency**: Bug 09 (1 bug)
- **Security Vulnerability**: Bug 10 (1 bug)
- **Total Count**: Exactly 10 bugs.

---

## 3. How to Run Automated Bug Verification

Run the automated instructor verification test suite:

```bash
mvn test -Dtest=InstructorBugVerificationTests
```

This executes all 10 verification tests, asserting that each intentional bug is present and reproducible.
