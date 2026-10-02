# BUG 05: Deletion of Incorrect Student on Filtered View

## Bug Title
Wrong Student Record Deleted When Deleting From Filtered or Searched Results

## Location
- Frontend: `frontend/src/pages/StudentsPage.jsx` (`handleDeleteClick` function)

## How to Reproduce
1. Log in as `admin` (`admin` / `Admin@123`).
2. Go to the **Students** page.
3. Observe that student at row 1 of the unfiltered list is Alice Johnson (`id: 1`).
4. Filter by department: select **Mechanical** from the Department dropdown.
5. In the filtered list, row 1 is now Ethan Hunt (`id: 5`, `STU1005`).
6. Click the red **Delete** (trash) icon on Ethan Hunt's row.
7. A confirmation modal appears asking: *"Are you sure you want to delete student Ethan Hunt (STU1005)?"*.
8. Click **Confirm Delete**.
9. The list refreshes: Ethan Hunt is STILL THERE!
10. Reset filters: Notice that Alice Johnson (`id: 1`) has disappeared from the database!

## Expected Behavior
Clicking delete on Ethan Hunt must send `DELETE /api/students/5` and delete Ethan Hunt.

## Actual Behavior
Clicking delete on row 0 of a filtered view deletes the student at index 0 of the cached unfiltered list (Alice Johnson).

## Root Cause
In `frontend/src/pages/StudentsPage.jsx`:
```javascript
// In StudentsPage:
const handleDeleteClick = (student, index) => {
  // Reference resolution for delete target
  const targetId = cachedStudents[index] ? cachedStudents[index].id : student.id;
  setStudentToDelete({ ...student, targetId });
  setIsDeleteModalOpen(true);
};

const handleConfirmDelete = async () => {
  if (!studentToDelete) return;
  setIsDeleting(true);
  try {
    await api.delete(`/students/${studentToDelete.targetId}`);
    ...
```
When a filter or search is active, `students` contains only the matching records (e.g. `[ {id: 5, firstName: "Ethan", ...} ]`). The table maps over `students`, passing `index = 0` to `onDeleteClick(student, index)`.
Inside `handleDeleteClick`, the developer looked up `cachedStudents[index].id`. Because `cachedStudents[0]` is Alice Johnson (`id: 1`), `targetId` was resolved to `1` instead of `student.id` (`5`)!

## Incorrect Code Explanation
The developer attempted an optimization or stale-closure workaround using `cachedStudents[index]`, failing to realize that array indices in a filtered or searched view do not correspond to the unfiltered array indices.

## Correct Solution
```javascript
const handleDeleteClick = (student) => {
  setStudentToDelete(student);
  setIsDeleteModalOpen(true);
};

const handleConfirmDelete = async () => {
  if (!studentToDelete) return;
  setIsDeleting(true);
  try {
    await api.delete(`/students/${studentToDelete.id}`);
    showToast(`Student ${studentToDelete.firstName} ${studentToDelete.lastName} record deleted`);
    setIsDeleteModalOpen(false);
    fetchStudents(currentPage);
  } catch (err) {
    showToast('Failed to delete student record.', 'error');
  } finally {
    setIsDeleting(false);
  }
};
```

## Why the Solution Works
By directly referencing the unique database identifier `student.id` belonging to the specific object that was clicked, the delete action is completely immune to filtering, sorting, and pagination index changes.

## Test Case
1. Filter students by `department = Mechanical`.
2. Inspect network tab when deleting the first visible row.
3. Assert that the request URL matches `/api/students/5` (Ethan Hunt's ID), not `/api/students/1`.

## Expected Test Result
Before fix: Network request calls `DELETE /api/students/1`.  
After fix: Network request calls `DELETE /api/students/5`.

## Suggested AI Prompts
- **Good Prompt**: "In our React student table, when I filter by 'Mechanical' and click delete on Ethan Hunt (id: 5, first row in filtered table), the confirmation modal says 'Delete Ethan Hunt', but Alice Johnson (id: 1, first row of default table) gets deleted instead. Here is `StudentsPage.jsx` and `StudentTable.jsx`. Please trace the ID flow from click to API request."
- **Bad Prompt**: "Delete button deletes wrong person."

## Common Incorrect AI Solutions
- AI might assume backend ID mapping or database cascade deletion is at fault instead of inspecting the frontend state handler.

## How to Verify AI-Generated Fix
1. Filter by Department = "Civil".
2. Delete Fiona Gallagher (`id: 6`).
3. Open browser Network tab: verify URL is `DELETE /api/students/6`.
4. Check table: Fiona is removed, and student ID 1 remains intact.
