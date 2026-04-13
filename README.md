# QA AI Workflow

Simulates a real QA workflow by converting requirements into executable tests and structured defect reports using AI.

An AI-assisted QA pipeline that takes a user story and produces a test plan, structured test cases, Playwright tests, executed results, and bug reports — following a requirements-first methodology.

Built as a portfolio project to demonstrate how AI can augment real-world QA engineering, not replace the thinking behind it.

---

## Why This Exists

Most QA automation tools generate tests from code. This project takes a different approach:

> **Tests should be generated from requirements and user intent — not from what the developer happened to build.**

If a developer implements the wrong behavior, tests generated from their code will validate the wrong behavior. This pipeline starts from acceptance criteria, the same way a QA engineer should.

---

## My Role

I designed and built this AI-assisted QA workflow as a personal portfolio project to demonstrate how modern QA practices can be accelerated with AI while maintaining strong requirements-first methodology.

My focus was on:
- Defining the end-to-end QA process and methodology
- Creating the requirements-first playbook that drives all test generation
- Designing the structured pipeline and output formats (Jira & Azure DevOps)
- Using AI (Claude) as an intelligent assistant to accelerate test plan creation, structured test cases, and bug reporting — always guided by QA methodology and requirements-first validation

The architecture, QA logic, and decision-making were driven by my 18+ years of real-world QA leadership experience.

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
```

Each stage produces a structured output. Everything lands in `output/`.

---

## Features

| Feature | Description |
|---|---|
| `--mock` mode | Full pipeline run with zero API calls — for development and demos |
| `--story` flag | Load any user story from a JSON file |
| Markdown report | Human-readable `output/REPORT.md` with tables, results, and bug reports |
| Structured test cases | Typed by category: functional, negative, edge, regression |
| Bug reports | Generated in both JIRA and Azure DevOps format |
| Requirements-first | Tests derived from acceptance criteria, not code diffs |

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

---

## Sample Output

After a run, `output/REPORT.md` contains:

```
# QA Report — Todo list management
Generated: 2026-04-04 00:34:11 UTC

## Summary
Passed: 4 | Failed: 1 | Skipped: 1 | Bugs filed: 1

## Test Cases
| ID     | Title                    | Type       | Priority |
|--------|--------------------------|------------|----------|
| TC-001 | Add a new todo item      | functional | high     |
| TC-002 | Mark a todo as complete  | functional | high     |
| TC-003 | Delete a todo item       | functional | high     |
| TC-006 | Submit empty todo        | negative   | medium   |

## Execution Results
| ID     | Title                    | Status      | Duration |
|--------|--------------------------|-------------|----------|
| TC-001 | Add a new todo item      | ✅ passed   | 843ms    |
| TC-002 | Mark a todo as complete  | ✅ passed   | 1102ms   |
| TC-003 | Delete a todo item       | ❌ failed   | 3021ms   |
| TC-006 | Submit empty todo        | ⏭️ skipped  | —        |

## Bug Reports
### Delete button not reliably clickable via hover
Severity: minor
Steps to Reproduce:
1. Navigate to the app
2. Add a todo item
3. Attempt to click the destroy button without hover
```

See [`output/REPORT.md`](./output/REPORT.md) for the full sample.

---

## Methodology

This project follows a **requirements-first QA approach** documented in [`docs/AI_QA_PLAYBOOK.md`](./docs/AI_QA_PLAYBOOK.md).

Key principles:

- **AC first** — every test case references a specific acceptance criterion
- **No code-first testing** — implementation details are only used for edge cases and regression risk
- **Atomic test cases** — each test verifies exactly one thing, no OR conditions
- **Honest automation** — tests are flagged when they cannot be reliably automated
- **Traceable outputs** — acceptance criteria → test case → execution result → bug report

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
│   └── REPORT.md               # Sample pipeline output
├── tests/
│   └── generated.spec.ts       # AI-generated Playwright tests
└── .env.example
```

---

## What This Demonstrates

- Ability to design QA systems, not just execute tests
- Strong understanding of requirements-driven testing
- Experience combining manual QA methodology with automation
- Practical use of AI APIs in a structured, typed pipeline
- End-to-end thinking: from acceptance criteria to filed bug reports

---

## Scope of This Project

This repository demonstrates a practical **AI-assisted QA workflow** built by a Senior QA Lead.

**What this project shows:**
- Requirements-first test design and methodology
- AI-assisted generation of test plans and structured test cases
- Practical use of Playwright as a supporting tool
- End-to-end traceability from user story → test execution → analysis → bug reporting
- Clean, reproducible QA artifacts (Markdown reports + structured JSON)

**What this project is NOT:**
- A production-grade automation framework
- A demonstration of deep Playwright or test automation framework engineering
- An attempt to replace QA decision-making with AI (QA logic remains human-driven)
- An advanced Playwright engineering project
- An example of building complex test automation architectures from scratch

It is a working proof-of-concept that shows how a senior QA professional can leverage AI to work faster and smarter while keeping quality and methodology at the center.

---

## Author

**Carlos García**
QA Engineer | AI-assisted testing | Playwright | Azure DevOps | Claude

[GitHub](https://github.com/cgarciamx80)
