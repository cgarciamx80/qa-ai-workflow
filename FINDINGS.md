# QA AI Workflow — Eval A Findings

## Evaluation Question

When an LLM-powered pipeline generates test cases from a user story, how good are those test cases? Specifically: do they trace back to acceptance criteria, test one thing at a time, and produce verifiable expected results?

## Setup

**Target:** The qa-ai-workflow pipeline output (`output/pipeline-result.json`) generated from a TodoMVC user story with 5 acceptance criteria.

**Input story:**
> As a user, I can add, complete, and delete todos so I can track my tasks.

**Acceptance criteria (5 total):**
1. User can add a new todo by typing and pressing Enter
2. User can mark a todo as complete by clicking the checkbox
3. User can delete a todo with the delete button
4. Completed todos show with a strikethrough
5. Todo count updates correctly after each action

**Pipeline output:** 8 test cases (TC-001 to TC-008), all executed via Playwright against the live TodoMVC demo with 8/8 passing.

**Judge:** claude-haiku-4-5-20251001 via `src/eval/run_eval.ts`

**Dimensions scored (1-5 each):**
- `ac_traceability` — does the test case clearly trace to one or more acceptance criteria?
- `atomicity` — does the test case test exactly one thing?
- `verifiability` — is the expected result specific, measurable, and unambiguous?

## Results

| TC | Title | Trace | Atomic | Verify | Avg |
|----|-------|-------|--------|--------|-----|
| TC-001 | Add a new todo by typing text and pressing Enter | 5 | 4 | 5 | 4.7 |
| TC-002 | Mark a todo as complete using the checkbox | 5 | 3 | 4 | 4.0 |
| TC-003 | Delete a todo using the delete button | 5 | 4 | 5 | 4.7 |
| TC-004 | Todo count updates correctly after adding, completing, and deleting todos | 5 | **2** | 4 | 3.7 |
| TC-005 | Attempt to add a todo with an empty input field | 3 | 4 | 3 | 3.3 |
| TC-006 | Attempt to add a todo with only whitespace characters | 3 | 4 | 3 | 3.3 |
| TC-007 | Add a todo with a very long text string | 3 | 3 | **2** | 2.7 |
| TC-008 | Unmark a completed todo to restore it to active state | **2** | 3 | 4 | 3.0 |

**Dimension averages:**

| Dimension | Avg |
|-----------|-----|
| ac_traceability | 3.9 |
| atomicity | 3.4 |
| verifiability | 3.8 |
| overall | 3.7 |

**Coverage score: 5/5** (all 5 acceptance criteria covered, no gaps)

## Key Findings

### Finding 1 — TC-004 violates atomicity (score: 2/5)

TC-004 chains three distinct behaviors into a single test: add a todo, mark it complete, then delete it. The judge scored this 2/5 for atomicity because these are three separate behaviors that should each have their own test case. The test still passes in Playwright because all three actions work correctly, but the test is testing the interaction between them rather than any one behavior in isolation. This makes failure diagnosis harder and makes the test more fragile as a regression guard.

### Finding 2 — TC-008 has no explicit AC backing it (traceability: 2/5)

TC-008 tests unmarking a completed todo (toggling the checkbox back to active). This is a real and important behavior, but none of the 5 acceptance criteria mention it explicitly. AC-2 says "User can mark a todo as complete" but does not describe the reverse action. The pipeline inferred the behavior from the story context and generated a useful edge case test, but without an explicit AC anchor, this is technically a test for an undocumented requirement.

### Finding 3 — TC-007 has an ambiguous expected result (verifiability: 2/5)

TC-007 tests a very long text input (500+ characters). The expected result says the application "either accepts the long todo and displays it without breaking the UI layout, or enforces a character limit with appropriate user feedback." This is two valid outcomes instead of one. A tester cannot determine pass or fail without knowing which behavior the application is designed to have. The test passes in Playwright only because the implementation accepts long strings, but the expected result as written cannot be mechanically verified.

### Finding 4 — Edge case tests have weaker AC traceability by design

TC-005 (empty input), TC-006 (whitespace input), and TC-007 (long input) all scored 3/5 on traceability. None of the 5 acceptance criteria explicitly cover negative or boundary inputs. The pipeline generated these defensively, which is good QA instinct, but they represent requirements that were not in scope based on what was specified. In a real project, these would prompt a conversation about whether the ACs are complete.

## Meta-Finding

The pipeline produces high coverage (5/5) and the core happy-path test cases are strong (TC-001, TC-002, TC-003 average 4.5/5). The quality degradation appears at two predictable edges: multi-step integration tests that compound behaviors (TC-004) and edge cases that are not grounded in explicit acceptance criteria (TC-007, TC-008).

This pattern is consistent with how LLMs generate test cases: they prioritize coverage breadth over test isolation, and they infer behaviors that are plausible but not specified. In a QA review workflow, these are the exact two categories that need human review before execution.

## Limitations

- Single story, single pipeline run. Results are illustrative rather than statistically generalizable.
- The judge (haiku) is a smaller model evaluating output from a larger model (sonnet). There may be systematic scoring bias.
- Playwright passing does not validate the expected result as written. TC-007 passed in execution even though its expected result is ambiguous, because the implementation happened to match one of the two stated outcomes.
- Coverage is scored holistically by the judge, not computed mechanically from AC-to-TC mapping.

## Eval Infrastructure

| Component | Location |
|-----------|----------|
| Judge script | `src/eval/run_eval.ts` |
| Pipeline output | `output/pipeline-result.json` |
| Eval results | `output/eval-results.json` |
| Run command | `npm run eval` |
| Judge model | claude-haiku-4-5-20251001 |
