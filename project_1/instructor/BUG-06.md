# BUG 06: Pagination Last Page Truncation (Off-by-One)

## Bug Title
Total Pages Calculated via Integer Division Cuts Off Remaining Records

## Location
- Backend DTO: `src/main/java/com/sms/dto/PageResponseDto.java` (constructor)

## How to Reproduce
1. Start the application with the default 25 seed students.
2. Navigate to the **Students** page.
3. Observe the pagination bar at the bottom:
   - Text says: *"Showing 1 to 10 of 25 results"*
   - Page buttons available: `1` and `2` (Page `3` is missing!).
   - "Next" arrow button is enabled.
4. Click **Page 2**:
   - Table displays students 11 to 20.
   - Text says: *"Showing 11 to 20 of 25 results"*.
   - Notice the "Next" button is now DISABLED, and there is no button for Page 3!
5. The remaining 5 students (students 21 to 25) can never be navigated to in the UI!

## Expected Behavior
For 25 total elements with page size 10, there must be $\lceil 25 / 10 \rceil = 3$ total pages. Students 21 to 25 must be accessible on Page 3.

## Actual Behavior
Only 2 total pages are computed, leaving the final 5 students inaccessible.

## Root Cause
In `PageResponseDto.java`, line 21:
```java
public PageResponseDto(List<T> content, int pageNumber, int pageSize, long totalElements) {
    this.content = content;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.totalElements = totalElements;
    // Calculation logic for total pages
    this.totalPages = pageSize > 0 ? (int) (totalElements / pageSize) : 0;
    this.first = pageNumber <= 1;
    this.last = pageNumber >= this.totalPages;
}
```
`totalElements / pageSize` performs integer division in Java.
When `totalElements = 25` and `pageSize = 10`, `25 / 10 = 2`. The fractional remainder `0.5` is discarded rather than rounded up.

## Incorrect Code Explanation
The developer used simple integer division instead of ceiling division (`Math.ceil`) to compute total pages.

## Correct Solution
```java
public PageResponseDto(List<T> content, int pageNumber, int pageSize, long totalElements) {
    this.content = content;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.totalElements = totalElements;
    this.totalPages = pageSize > 0 ? (int) Math.ceil((double) totalElements / pageSize) : 0;
    this.first = pageNumber <= 1;
    this.last = pageNumber >= this.totalPages;
}
```
Or alternatively using integer arithmetic:
```java
this.totalPages = pageSize > 0 ? (int) ((totalElements + pageSize - 1) / pageSize) : 0;
```

## Why the Solution Works
Using `Math.ceil((double) totalElements / pageSize)` ensures that any non-zero remainder creates an additional final page for the trailing records.

## Test Case
```java
@Test
void testTotalPagesCalculationWithRemainder() {
    PageResponseDto<String> page = new PageResponseDto<>(List.of("a"), 1, 10, 25);
    assertEquals(3, page.getTotalPages());
}
```

## Expected Test Result
Before fix: `page.getTotalPages()` returns 2 (test fails).  
After fix: `page.getTotalPages()` returns 3 (test passes).

## Suggested AI Prompts
- **Good Prompt**: "In our Spring Boot REST API, `GET /api/students/page?page=1&size=10` returns `totalElements: 25` but `totalPages: 2`. Here is `PageResponseDto.java`. Why is `totalPages` 2 instead of 3?"
- **Bad Prompt**: "Fix pagination."

## Common Incorrect AI Solutions
- AI might modify `StudentServiceImpl` or Spring Data's `PageRequest` without noticing the manual calculation in the custom `PageResponseDto` class.

## How to Verify AI-Generated Fix
1. Open the UI: buttons `1`, `2`, and `3` appear.
2. Click button `3`: students 21 through 25 (Wendy, Xavier, Yvonne, etc.) appear.
3. Pagination text shows: *"Showing 21 to 25 of 25 results"*.
