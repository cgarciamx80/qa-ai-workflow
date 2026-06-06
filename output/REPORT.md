# QA Report — Todo list management
Generated: 2026-06-06 22:47:16 UTC

## Summary
Passed: 8 | Failed: 0 | Skipped: 0 | Bugs filed: 0

## Test Plan
**Scope:** In scope: Adding todos via keyboard input, marking todos as complete via checkbox, deleting todos via delete button, strikethrough styling on completed todos, and dynamic todo count updates. Out of scope: Backend persistence, user authentication, and multi-device sync.

**Strategy:** Testing will follow a black-box approach targeting the UI interactions described in the acceptance criteria. We will cover the happy path for each core action, edge cases around input boundaries and state transitions, and negative scenarios to ensure the app handles invalid or unexpected inputs gracefully. Tests are ordered by priority to enable early detection of critical failures.

## Test Cases
| ID | Title | Type | Priority | Expected Result |
|----|-------|------|----------|-----------------|
| TC-001 | Add a new todo by typing text and pressing Enter | functional | high | A new todo item 'Buy groceries' appears in the list, the input field is cleared, and the todo count increments by 1. |
| TC-002 | Mark a todo as complete using the checkbox | functional | high | The checkbox becomes checked, the todo text 'Read a book' displays with a strikethrough style, and the todo count updates to reflect the completed state if applicable. |
| TC-003 | Delete a todo using the delete button | functional | high | The 'Go for a walk' todo is removed from the list and the todo count decrements by 1. |
| TC-004 | Todo count updates correctly after adding, completing, and deleting todos | functional | high | The todo count accurately reflects the number of todos after each action: 0 initially, 3 after adding, adjusts after completing and deleting, and shows correct final count throughout all state transitions. |
| TC-005 | Attempt to add a todo with an empty input field | negative | medium | No new todo is added to the list, the todo count remains unchanged, and the application does not display an error or crash. |
| TC-006 | Attempt to add a todo with only whitespace characters | negative | medium | No new todo is added to the list, the input is treated as blank, the todo count remains unchanged, and the input field is cleared or retains focus. |
| TC-007 | Add a todo with a very long text string | edge | medium | The application either accepts the long todo and displays it without breaking the UI layout, or enforces a character limit with appropriate user feedback. The todo count updates correctly and no crash occurs. |
| TC-008 | Unmark a completed todo to restore it to active state | edge | low | The checkbox becomes unchecked, the strikethrough styling is removed from 'Write report', and the todo count correctly reflects the todo as active again. |

## Execution Results
| ID | Title | Status | Duration |
|----|-------|--------|----------|
| TC-001 | [TC-001] Add a new todo by typing text and pressing Enter | ✅ passed | 4363ms |
| TC-002 | [TC-002] Mark a todo as complete using the checkbox | ✅ passed | 1367ms |
| TC-003 | [TC-003] Delete a todo using the delete button | ✅ passed | 1474ms |
| TC-004 | [TC-004] Todo count updates correctly after adding, completing, and deleting todos | ✅ passed | 1546ms |
| TC-005 | [TC-005] Attempt to add a todo with an empty input field | ✅ passed | 1149ms |
| TC-006 | [TC-006] Attempt to add a todo with only whitespace characters | ✅ passed | 1331ms |
| TC-007 | [TC-007] Add a todo with a very long text string | ✅ passed | 1159ms |
| TC-008 | [TC-008] Unmark a completed todo to restore it to active state | ✅ passed | 1210ms |
