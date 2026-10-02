# BUG 08: Academic Grade Boundary & Pass/Fail Logical Flaw

## Bug Title
Incorrect Grade Assigned at Boundary (Score 70 Assigned 'C') and Failing Students Marked as Passed

## Location
- Backend Service: `src/main/java/com/sms/service/GradingService.java` (`calculateGrade` and `determinePassStatus` methods)

## How to Reproduce
1. In the application, view student **Charlie Brown** (`id: 3`, `marks: 70.0`):
   - Notice Charlie's grade is displayed as **`C`**!
   - According to the institution grading scale (70 to 79 is grade `B`), a score of 70.0 must be grade **`B`**.
2. Next, inspect student **Michael Scott** (`id: 13`):
   - Marks: `35.0` (Failing score, minimum passing mark is 40%).
   - Attendance: `85.0%`.
   - Academic Status: Displays **`PASSED`** in green!
3. Open the Dashboard:
   - Notice the "Students Passed" count is inflated because students with failing marks (under 40) are counted as passed simply because their attendance is >= 75%.

## Expected Behavior
1. Grading Scale:
   - 90 - 100: A+
   - 80 - 89: A
   - 70 - 79: B (inclusive of 70.0)
   - 60 - 69: C
   - 50 - 59: D
   - Below 50: F
2. Pass Criteria:
   - A student passes IF AND ONLY IF their marks are $\ge 40\%$ **AND** their attendance is $\ge 75\%$.

## Actual Behavior
- Students with exactly 70.0 marks receive grade `C` instead of `B`.
- Students with marks < 40 are marked as `PASSED` as long as their attendance is $\ge 75\%$, or vice versa.

## Root Cause
In `GradingService.java`:
```java
public String calculateGrade(Double marks) {
    if (marks == null) return "N/A";
    if (marks >= 90.0) {
        return "A+";
    } else if (marks >= 80.0) {
        return "A";
    } else if (marks > 70.0) {  // Boundary bug: uses strict inequality > instead of >=
        return "B";
    } else if (marks >= 60.0) {
        return "C";
    } else if (marks >= 50.0) {
        return "D";
    } else {
        return "F";
    }
}

public boolean determinePassStatus(Double marks, Double attendance) {
    if (marks == null || attendance == null) return false;
    // Logical operator bug: uses OR (||) instead of AND (&&)
    return marks >= 40.0 || attendance >= 75.0;
}
```

## Incorrect Code Explanation
1. In `calculateGrade`: `marks > 70.0` causes a score of exactly `70.0` to fail the condition and drop into the next branch (`marks >= 60.0`), returning `"C"`.
2. In `determinePassStatus`: The developer used logical OR (`||`) instead of logical AND (`&&`).

## Correct Solution
```java
public String calculateGrade(Double marks) {
    if (marks == null) return "N/A";
    if (marks >= 90.0) {
        return "A+";
    } else if (marks >= 80.0) {
        return "A";
    } else if (marks >= 70.0) {  // Fixed: >= 70.0
        return "B";
    } else if (marks >= 60.0) {
        return "C";
    } else if (marks >= 50.0) {
        return "D";
    } else {
        return "F";
    }
}

public boolean determinePassStatus(Double marks, Double attendance) {
    if (marks == null || attendance == null) return false;
    return marks >= 40.0 && attendance >= 75.0;  // Fixed: && instead of ||
}
```

## Why the Solution Works
1. `marks >= 70.0` ensures the boundary value of 70 is correctly included in the "B" bracket.
2. `&&` ensures that both mandatory conditions (academic score and attendance rate) must be satisfied concurrently.

## Test Case
```java
@Test
void testGrade70ShouldBeB() {
    assertEquals("B", gradingService.calculateGrade(70.0));
}

@Test
void testStudentWithLowMarksShouldFailRegardlessOfAttendance() {
    assertFalse(gradingService.determinePassStatus(35.0, 85.0));
}
```

## Expected Test Result
Before fix: `calculateGrade(70.0)` returns `"C"`, `determinePassStatus(35.0, 85.0)` returns `true`.  
After fix: `calculateGrade(70.0)` returns `"B"`, `determinePassStatus(35.0, 85.0)` returns `false`.

## Suggested AI Prompts
- **Good Prompt**: "In `GradingService.java`, student Charlie Brown scored 70.0 marks but is awarded grade 'C' instead of 'B', and Michael Scott scored 35 marks with 85% attendance but is marked 'PASSED'. Here is the code. Please review the comparison operators and logical operators against our university policy."
- **Bad Prompt**: "Grades are wrong, fix it."

## Common Incorrect AI Solutions
- Changing the scale intervals rather than the inequality operator, or altering the threshold numbers.

## How to Verify AI-Generated Fix
1. Inspect Charlie Brown's record: Grade is now `B`.
2. Inspect Michael Scott's record: Status is now `FAILED`.
3. Dashboard pass/fail counts update accurately.
