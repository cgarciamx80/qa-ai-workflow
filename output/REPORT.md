# QA Report — Todo list management
Generated: 2026-04-10 01:30:51 UTC

## Summary
Passed: 5 | Failed: 3 | Skipped: 0 | Bugs filed: 3

## Test Plan
**Scope:** In scope: Adding new todos, completing todos, deleting todos, visual styling of completed todos, todo count accuracy. Out of scope: Persistence/backend storage, user authentication, drag-and-drop reordering, todo editing/updating, filtering/sorting.

**Strategy:** Testing will follow a layered approach: first validate all happy-path functional flows for adding, completing, and deleting todos; then cover edge cases such as empty input, special characters, and bulk operations; finally test negative scenarios to ensure graceful handling of invalid inputs. Manual and automated UI testing will be used, with assertions on DOM state, CSS styling, and count values.

## Test Cases
| ID | Title | Type | Priority | Expected Result |
|----|-------|------|----------|-----------------|
| TC-001 | Add a new todo by typing text and pressing Enter | functional | high | A new todo item 'Buy groceries' appears in the todo list, the input field is cleared, and the todo count increments by 1. |
| TC-002 | Mark a todo as complete by clicking the checkbox | functional | high | The todo is marked as complete, its text displays with a strikethrough style, and the active todo count decrements by 1. |
| TC-003 | Delete a todo using the delete button | functional | high | The todo item is removed from the list entirely and the todo count updates accordingly (decrements by 1). |
| TC-004 | Completed todos display with strikethrough styling | functional | high | The completed todo text has a 'text-decoration: line-through' CSS property applied, visually distinguishing it from incomplete todos. |
| TC-005 | Attempt to add an empty todo by pressing Enter with no text | negative | high | No new todo item is added to the list, the todo count remains unchanged, and optionally a validation message or visual cue is shown. |
| TC-006 | Todo count updates correctly after sequential add, complete, and delete actions | functional | high | After adding 3 todos the count is 3. After completing one, the active count shows 2 (if counting active) or total remains 3. After deleting one, the total count decrements to 2 and active count adjusts accordingly. |
| TC-007 | Add a todo with special characters and very long text | edge | medium | Both todos are added successfully. Special characters are properly escaped/rendered as plain text (no XSS execution). The long text todo is displayed correctly without breaking the UI layout, and the count increments for each added todo. |
| TC-008 | Delete all todos and verify empty state | edge | medium | After all todos are deleted, the list is empty, the todo count shows 0, and the UI displays an appropriate empty state (no orphaned elements or errors). |

## Execution Results
| ID | Title | Status | Duration |
|----|-------|--------|----------|
| TC-001 | [TC-001] Add a new todo by typing text and pressing Enter | ✅ passed | 1512ms |
| TC-002 | [TC-002] Mark a todo as complete by clicking the checkbox | ✅ passed | 1095ms |
| TC-003 | [TC-003] Delete a todo using the delete button | ❌ failed | 30067ms |
| TC-004 | [TC-004] Completed todos display with strikethrough styling | ✅ passed | 1251ms |
| TC-005 | [TC-005] Attempt to add an empty todo by pressing Enter with no text | ✅ passed | 1088ms |
| TC-006 | [TC-006] Todo count updates correctly after sequential add, complete, and delete actions | ❌ failed | 30102ms |
| TC-007 | [TC-007] Add a todo with special characters and very long text | ✅ passed | 1268ms |
| TC-008 | [TC-008] Delete all todos and verify empty state | ❌ failed | 30083ms |

## Failed Tests
### [TC-003] Delete a todo using the delete button
Error: [31mTest timeout of 30000ms exceeded.[39m

### [TC-006] Todo count updates correctly after sequential add, complete, and delete actions
Error: [31mTest timeout of 30000ms exceeded.[39m

### [TC-008] Delete all todos and verify empty state
Error: [31mTest timeout of 30000ms exceeded.[39m

## Bug Reports
### Delete todo button causes timeout - delete operation hangs indefinitely
Severity: critical

Steps to Reproduce:
1. 1. Open the Todo application
2. 2. Add a new todo item (e.g., 'Test item')
3. 3. Click the delete button associated with the newly created todo item
4. 4. Observe that the delete operation never completes and the todo remains in the list

JIRA Format:
h2. Summary
Delete todo button causes timeout - delete operation hangs indefinitely (TC-003)

h2. Description
When attempting to delete a todo item by clicking the delete button, the operation never completes, resulting in a test timeout of 30000ms being exceeded (actual duration: 30067ms).

h2. Steps to Reproduce
# Open the Todo application
# Add a new todo item (e.g., 'Test item')
# Click the delete button associated with the newly created todo item
# Observe that the delete operation never completes

h2. Expected Result
The todo item should be removed from the list promptly after clicking the delete button.

h2. Actual Result
The delete operation hangs indefinitely, causing a 30-second timeout.

h2. Priority
Critical

h2. Affected Tests
TC-003, TC-006, TC-008

### Sequential add, complete, and delete workflow fails due to delete operation timeout
Severity: critical

Steps to Reproduce:
1. 1. Open the Todo application
2. 2. Add a new todo item
3. 3. Mark the todo item as complete
4. 4. Attempt to delete the completed todo item
5. 5. Observe the todo count to verify it updates correctly

JIRA Format:
h2. Summary
Sequential add/complete/delete workflow fails due to delete operation timeout (TC-006)

h2. Description
When performing a sequential workflow of adding, completing, and deleting a todo, the process hangs during the delete step, resulting in a test timeout of 30000ms being exceeded (actual duration: 30102ms). The todo count never reflects the deletion.

h2. Steps to Reproduce
# Open the Todo application
# Add a new todo item
# Mark the todo item as complete
# Attempt to delete the completed todo item
# Observe the todo count

h2. Expected Result
The todo count should update correctly after each action, and the deletion should succeed.

h2. Actual Result
The workflow hangs at the delete step, exceeding the 30-second timeout.

h2. Priority
Critical

h2. Related
Linked to delete functionality regression — see TC-003 bug

### Delete all todos fails to reach empty state due to delete operation timeout
Severity: critical

Steps to Reproduce:
1. 1. Open the Todo application
2. 2. Add multiple todo items (e.g., 2-3 items)
3. 3. Attempt to delete all todo items one by one using the delete button
4. 4. Verify that the application displays the empty state after all items are deleted

JIRA Format:
h2. Summary
Delete all todos fails to reach empty state due to delete operation timeout (TC-008)

h2. Description
When attempting to delete all todos to verify the empty state, the delete operation hangs, resulting in a test timeout of 30000ms being exceeded (actual duration: 30083ms). The empty state is never reached.

h2. Steps to Reproduce
# Open the Todo application
# Add multiple todo items
# Attempt to delete all todo items one by one using the delete button
# Verify that the application displays the empty state

h2. Expected Result
All todo items should be deleted and the application should display the empty state.

h2. Actual Result
The delete operation hangs, exceeding the 30-second timeout. The empty state is never displayed.

h2. Priority
Critical

h2. Related
Linked to delete functionality regression — see TC-003 bug
