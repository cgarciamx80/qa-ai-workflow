# QA AI Workflow

Simulates a real QA workflow by converting requirements into executable tests and structured defect reports using AI.

An AI-assisted QA pipeline that takes a user story and produces a test plan, structured test cases, Playwright tests, executed results, and bug reports, following a requirements-first methodology.

Built as a portfolio project to demonstrate how AI can augment real-world QA engineering, not replace the thinking behind it.

---

## Why This Exists

Most QA automation tools generate tests from code. This project takes a different approach:

> **Tests should be generated from requirements and user intent, not from what the developer happened to build.**

If a developer implements the wrong behavior, tests generated from their code will validate the wrong behavior. This pipeline starts from acceptance criteria, the same way a QA engineer should.

---

## How It Works

```
User Story (JSON)
      ↓
  Test Plan        → AI generates scope, strategy, risk assessment
      ↓
  Test Cases       → AI generates atomic, verifiable cases from AC
      ↓
  Playwright       → AI generates and executes .spec.ts tests
      ↓
  Results          → Pass / Fail / Skipped with durations
      ↓
  Bug Reports      → AI analyzes failures, files bugs in JIRA or ADO format
      ↓
  REPORT.md        → Clean markdown summary of the full run
      ↓
  LLM-as-Judge     → Second AI layer scores each test case for quality
      ↓
  eval-results.json → Traceability, atomicity, verifiability scores per TC
```

Each stage produces a structured output. Everything lands in `output/`.

---

## Features

| Feature | Description |
|---|---|
| `--mock` mode | Full pipeline run with zero API calls, for development and demos |
| `--story` flag | Load any user story from a JSON file |
| Markdown report | Human-readable `output/REPORT.md` with tables, results, and bug reports |
| Structured test cases | Typed by category: functional, negative, edge, regression |
| Bug reports | Generated in both JIRA and Azure DevOps format |
| Requirements-first | Tests derived from acceptance criteria, not code diffs |
| LLM-as-judge eval | Second AI layer scores each generated test case on traceability, atomicity, and verifiability |

---

## How to Run

### Prerequisites

```bash
node >= 18
npm install
npx playwright install chromium
```

### Setup

```bash
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
```

### Run with mock mode (no API key needed)

```bash
npm start -- --mock
```

### Run with a custom user story

```bash
npm start -- --story ./input/story.json --mock
```

### Run with real AI (requires API key and credits)

```bash
npm start -- --story ./input/story.json
```

### Run the eval layer (scores generated test cases for quality)

```bash
npm run eval
```

Reads `output/pipeline-result.json` and scores each test case using a second AI call. Results saved to `output/eval-results.json`. See [`FINDINGS.md`](./FINDINGS.md) for an example run with analysis.

---

## Sample Output

After a pipeline run, `output/REPORT.md` contains the full summary. Example from a TodoMVC run (8 test cases generated, 8/8 passing):

```
# QA Report — Todo list management
Generated: 2026-06-06 22:47:16 UTC

## Summary
Passed: 8 | Failed: 0 | Skipped: 0 | Bugs filed: 0

## Execution Results
| ID     | Title                                          | Status    | Duration |
|--------|------------------------------------------------|-----------|----------|
| TC-001 | Add a new todo by typing text and pressing Enter | passed   | 4363ms   |
| TC-002 | Mark a todo as complete using the checkbox      | passed   | 1367ms   |
| TC-003 | Delete a todo using the delete button           | passed   | 1474ms   |
| TC-004 | Todo count updates correctly                    | passed   | 1546ms   |
| TC-005 | Attempt to add a todo with empty input          | passed   | 1149ms   |
| ...    | ...                                             | ...       | ...      |
```

After running `npm run eval`, `output/eval-results.json` contains per-test-case quality scores:

```
=== QA EVAL RESULTS ===

ID      Trace   Atomic   Verify   Avg
TC-001  5       4        5        4.7
TC-002  5       3        4        4.0
TC-003  5       4        5        4.7
TC-004  5       2        4        3.7   ← atomicity issue: tests 3 behaviors in one case
TC-007  3       3        2        2.7   ← verifiability issue: two alternative expected results
TC-008  2       3        4        3.0   ← traceability issue: behavior not in acceptance criteria

avg_ac_traceability: 3.9
avg_atomicity:       3.4
avg_verifiability:   3.8
overall_avg:         3.7
coverage_score:      5/5
```

See [`FINDINGS.md`](./FINDINGS.md) for the full analysis.

---

## Methodology

This project follows a **requirements-first QA approach** documented in [`docs/AI_QA_PLAYBOOK.md`](./docs/AI_QA_PLAYBOOK.md).

Key principles:

- **AC first:** every test case references a specific acceptance criterion
- **No code-first testing:** implementation details are only used for edge cases and regression risk
- **Atomic test cases:** each test verifies exactly one thing, no OR conditions
- **Honest automation:** tests are flagged when they cannot be reliably automated
- **Traceable outputs:** acceptance criteria → test case → execution result → bug report

This reflects how QA should work in teams where requirements and design decisions drive quality, not just the code that was written.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript + Node.js |
| Test execution | Playwright |
| AI engine | Claude API (Anthropic) |
| Output format | Markdown + JSON |
| CLI | Native `process.argv` |
| Runtime | `tsx` (no compile step needed) |

---

## Project Structure

```
qa-ai-workflow/
├── src/
│   ├── agents/
│   │   ├── planner.ts          # AI → test plan + test cases
│   │   ├── codeGen.ts          # AI → Playwright spec
│   │   └── analyzer.ts         # AI → results analysis + bug reports
│   ├── eval/
│   │   └── run_eval.ts         # LLM-as-judge: scores generated test cases
│   ├── runner/
│   │   └── playwrightRunner.ts # Executes tests, parses results
│   ├── report/
│   │   └── markdownReport.ts   # Generates REPORT.md
│   ├── mocks/
│   │   └── mockData.ts         # Hardcoded responses for mock mode
│   ├── config.ts               # Centralized configuration
│   ├── types.ts                # Shared TypeScript interfaces
│   └── pipeline.ts             # Orchestrates all stages
├── input/
│   └── story.json              # Example user story input
├── output/
│   ├── REPORT.md               # Pipeline output: results and bug reports
│   └── eval-results.json       # Eval output: per-test-case quality scores
├── tests/
│   └── generated.spec.ts       # AI-generated Playwright tests
├── FINDINGS.md                 # Analysis of an example eval run
└── .env.example
```

---

## What This Demonstrates

- Ability to design QA systems, not just execute tests
- Strong understanding of requirements-driven testing
- Experience combining manual QA methodology with automation
- Practical use of AI APIs in a structured, typed pipeline
- End-to-end thinking: from acceptance criteria to filed bug reports
- LLM evaluation design: building rubric-based judges to measure AI output quality

---

## Author

**Carlos García**, Senior QA Engineer with 20+ years in software quality, test strategy, and AI-assisted workflows.

- [holteck.com](https://holteck.com)
- [GitHub](https://github.com/cgarciamx80)
- [LinkedIn](https://linkedin.com/in/carlos-garcia-aiqa)
