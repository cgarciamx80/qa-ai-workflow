import type { TestPlan, TestResult, BugReport } from "../types.js";

export const MOCK_TEST_PLAN: TestPlan = {
  summary:
    "Test plan for the TodoMVC todo list management feature, covering core CRUD operations, UI state transitions, and edge cases.",
  scope:
    "All interactions within the TodoMVC application at https://demo.playwright.dev/todomvc, including add, complete, delete, and filter operations.",
  strategy:
    "Execute tests in isolation using a fresh browser context per test. Prioritize happy-path flows first, followed by edge cases and negative scenarios. Use semantic selectors to remain resilient to minor DOM changes.",
  testCases: [
    {
      id: "TC-001",
      title: "Add a new todo item",
      priority: "high",
      type: "functional",
      steps: [
        "Navigate to https://demo.playwright.dev/todomvc",
        "Click the 'What needs to be done?' input field",
        "Type 'Buy groceries'",
        "Press Enter",
      ],
      expectedResult:
        "The todo 'Buy groceries' appears in the list and the todo count shows '1 item left'.",
    },
    {
      id: "TC-002",
      title: "Mark a todo as complete",
      priority: "high",
      type: "functional",
      steps: [
        "Navigate to https://demo.playwright.dev/todomvc",
        "Add a todo item 'Read a book'",
        "Click the checkbox next to 'Read a book'",
      ],
      expectedResult:
        "The todo text has a strikethrough style and the item count shows '0 items left'.",
    },
    {
      id: "TC-003",
      title: "Delete a todo item",
      priority: "high",
      type: "functional",
      steps: [
        "Navigate to https://demo.playwright.dev/todomvc",
        "Add a todo item 'Write tests'",
        "Hover over the todo item to reveal the delete button",
        "Click the '×' delete button",
      ],
      expectedResult: "The todo 'Write tests' is removed from the list and the list is empty.",
    },
    {
      id: "TC-004",
      title: "Todo count updates after each action",
      priority: "medium",
      type: "functional",
      steps: [
        "Navigate to https://demo.playwright.dev/todomvc",
        "Add three todos: 'Task A', 'Task B', 'Task C'",
        "Verify count shows '3 items left'",
        "Complete 'Task A'",
        "Verify count shows '2 items left'",
        "Delete 'Task B'",
        "Verify count shows '1 item left'",
      ],
      expectedResult: "The item counter accurately reflects the number of incomplete todos at each step.",
    },
    {
      id: "TC-005",
      title: "Add todo with maximum length input",
      priority: "medium",
      type: "edge",
      steps: [
        "Navigate to https://demo.playwright.dev/todomvc",
        "Type a 200-character string into the input field",
        "Press Enter",
      ],
      expectedResult:
        "The todo is created and the full text is displayed without truncation or error.",
    },
    {
      id: "TC-006",
      title: "Submit empty todo — no item created",
      priority: "medium",
      type: "negative",
      steps: [
        "Navigate to https://demo.playwright.dev/todomvc",
        "Click the todo input field without typing anything",
        "Press Enter",
      ],
      expectedResult: "No todo item is added to the list and the list remains empty.",
    },
  ],
};

export const MOCK_TEST_RESULTS: TestResult[] = [
  {
    testId: "TC-001",
    title: "[TC-001] Add a new todo item",
    status: "passed",
    duration: 843,
  },
  {
    testId: "TC-002",
    title: "[TC-002] Mark a todo as complete",
    status: "passed",
    duration: 1102,
  },
  {
    testId: "TC-003",
    title: "[TC-003] Delete a todo item",
    status: "failed",
    duration: 3021,
    error:
      "TimeoutError: locator.click: Timeout 5000ms exceeded.\n" +
      "Call log:\n" +
      "  - waiting for locator('.todo-list li').filter({ hasText: 'Write tests' }).locator('button.destroy')\n" +
      "  - element is not visible — hover may not have triggered correctly\n" +
      "    at src/agents/../tests/generated.spec.ts:38:18",
  },
  {
    testId: "TC-004",
    title: "[TC-004] Todo count updates after each action",
    status: "passed",
    duration: 2310,
  },
  {
    testId: "TC-005",
    title: "[TC-005] Add todo with maximum length input",
    status: "passed",
    duration: 754,
  },
  {
    testId: "TC-006",
    title: "[TC-006] Submit empty todo — no item created",
    status: "skipped",
    duration: 0,
  },
];

export const MOCK_ANALYSIS =
  "The test suite executed 6 test cases against the TodoMVC application with an overall pass rate of 67% (4 passed, 1 failed, 1 skipped). " +
  "Core happy-path flows for adding and completing todos are stable, indicating the primary user journey is functioning as expected. " +
  "The skipped test for empty-input validation (TC-006) was not executed in this run and should be included in the next cycle to ensure negative-path coverage.\n\n" +
  "The single failure in TC-003 points to a fragile hover-triggered interaction for the delete button. " +
  "The destroy button in TodoMVC is only visible on CSS :hover, and the Playwright locator did not reliably trigger that state before attempting the click. " +
  "This is a test-reliability issue rather than a product defect, but it surfaces a real usability risk: keyboard-only and touch users may also struggle to access the delete action. " +
  "Recommended actions: (1) fix the test to use page.hover() explicitly before locating the button, (2) raise a UX story to add an always-visible delete affordance for accessibility compliance.";

export const MOCK_BUGS: BugReport[] = [
  {
    title: "Delete button not reliably clickable via hover — potential accessibility gap",
    severity: "minor",
    stepsToReproduce: [
      "Navigate to https://demo.playwright.dev/todomvc",
      "Add a todo item 'Write tests'",
      "Without manually hovering with the mouse, attempt to click the destroy (×) button via automation or keyboard",
    ],
    expectedBehavior:
      "The delete button should be reachable and clickable without requiring a precise CSS hover state, in line with WCAG 2.1 success criterion 2.1.1 (Keyboard).",
    actualBehavior:
      "The destroy button is hidden until the parent list item receives a CSS :hover event. Automated clicks and keyboard navigation cannot reliably trigger this state, causing interaction failures.",
    environment: "Chromium 124 · TodoMVC React · https://demo.playwright.dev/todomvc · macOS 14 / Windows 11",
    jiraFormat:
      "h2. Bug Report\n" +
      "*Summary:* Delete button not reliably clickable via hover — potential accessibility gap\n" +
      "*Severity:* Minor\n" +
      "*Affects:* https://demo.playwright.dev/todomvc\n\n" +
      "h3. Steps to Reproduce\n" +
      "# Navigate to https://demo.playwright.dev/todomvc\n" +
      "# Add a todo item 'Write tests'\n" +
      "# Without manually hovering with the mouse, attempt to click the destroy (×) button via automation or keyboard\n\n" +
      "*Expected:* The delete button should be reachable without requiring a CSS hover state.\n" +
      "*Actual:* The destroy button remains hidden, causing the click to fail.\n" +
      "*Environment:* Chromium 124 · TodoMVC React · macOS 14 / Windows 11",
    azureFormat:
      "**Title:** Delete button not reliably clickable via hover — potential accessibility gap\n" +
      "**Severity:** 4 - Low\n" +
      "**Repro Steps:**\n" +
      "1. Navigate to https://demo.playwright.dev/todomvc\n" +
      "2. Add a todo item 'Write tests'\n" +
      "3. Without manually hovering with the mouse, attempt to click the destroy (×) button via automation or keyboard\n\n" +
      "**Expected Result:** Delete button is reachable without CSS hover.\n" +
      "**Actual Result:** Button is not visible; click fails with a timeout.\n" +
      "**System Info:** Chromium 124 · TodoMVC React · macOS 14 / Windows 11",
  },
];
