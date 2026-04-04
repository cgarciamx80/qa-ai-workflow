# Project Context — qa-ai-workflow

This file is the internal brain of this project.
Upload it at the start of any AI conversation to restore full context instantly.
Do NOT commit sensitive information here. This file is safe to commit.

---

## What This Project Is

An AI-assisted QA pipeline built as a GitHub portfolio project.
It takes a user story and runs it through a 4-stage pipeline:

```
User Story (JSON)
      ↓
  Stage 1: Test Plan + Test Cases     → Claude API (planner.ts)
      ↓
  Stage 2: Playwright spec generated  → Claude API (codeGen.ts)
      ↓
  Stage 3: Tests executed             → Playwright (playwrightRunner.ts)
      ↓
  Stage 4: Results analyzed + bugs    → Claude API (analyzer.ts)
      ↓
  REPORT.md + pipeline-result.json   → output/
```

---

## Author

**Carlos García**
QA Engineer with real-world experience using AI-assisted QA workflows daily.
Works with enterprise QA tools professionally (e.g., Azure DevOps). Building this portfolio to demonstrate
requirements-first QA methodology combined with AI and automation.

GitHub: https://github.com/cgarciamx80
Repo: https://github.com/cgarciamx80/qa-ai-workflow

---

## Tech Stack

- Node.js + TypeScript
- Playwright (test execution)
- Claude API via @anthropic-ai/sdk
- tsx (no compile step)
- Native process.argv for CLI

---

## Current State (as of 2026-04-04)

### What works right now
- `npm start -- --mock` → full pipeline, zero API calls
- `npm start -- --story ./input/story.json --mock` → loads story from file
- `npm start -- --story ./input/story.json` → real API run (needs credits)
- `output/REPORT.md` → markdown report generated after every run
- `output/pipeline-result.json` → full structured output
- `tests/generated.spec.ts` → AI-generated Playwright spec

### What exists in the repo
```
src/
  agents/
    planner.ts         # Stage 1 → TestPlan + TestCase[] via JSON Schema
    codeGen.ts         # Stage 2 → Playwright .spec.ts generation
    analyzer.ts        # Stage 4 → Results → BugReport[] via JSON Schema
  runner/
    playwrightRunner.ts # Stage 3 → spawnSync Playwright, parses JSON output
  report/
    markdownReport.ts  # Generates output/REPORT.md from PipelineResult
  mocks/
    mockData.ts        # Hardcoded realistic responses for mock mode
  config.ts            # Central config → model, paths, token budgets, mockMode
  types.ts             # All TypeScript interfaces
  pipeline.ts          # Orchestrator → runs all 4 stages in sequence
input/
  story.json           # Example user story (login flow)
output/
  REPORT.md            # Sample report committed to repo
docs/
  AI_QA_PLAYBOOK.md    # Sanitized methodology document
README.md              # Portfolio-facing documentation
CONTEXT.md             # This file
```

---

## Key Architecture Decisions

### Why JSON Schema for AI output (planner + analyzer)
Instead of prompting the AI to "return JSON", we use `output_config.format.json_schema`
in the API call. This enforces the exact shape server-side before the response arrives.
Matches TypeScript types exactly. Eliminates runtime parsing errors.

### Why no JSON Schema for codeGen
Code generation can't be schema-validated. Constraints go into the prompt as explicit
rules instead. Output is sanitized with regex to strip markdown fences.

### Why spawnSync in playwrightRunner
Tests must finish before analysis begins. Sync is intentional. Uses spawnSync over
execSync for argument safety (no shell injection risk with separate args array).

### Why config.ts uses `as const`
Enforces literal types throughout. `model: "claude-sonnet-4-20250514"` not
`model: string`. Compiler catches typos immediately.

### Why output is written after each stage
If stage 3 crashes, stages 1 and 2 output are already saved. Nothing is lost.

### Mock mode design
`CONFIG.mockMode` flag checked at the top of each agent function.
Zero API calls when true. Same pipeline flow, same file outputs, same console logs
with `[MOCK]` prefix. Switch to false with `--mock` flag removed.

---

## Core Methodology (Requirements-First)

From `docs/AI_QA_PLAYBOOK.md` — this is the philosophy baked into this project:

**Source hierarchy for test generation:**
1. Acceptance Criteria → what should be built
2. Prototypes / Design docs → what it should look like
3. Stakeholder comments → clarifications
4. Product conventions → implicit standards
5. PR diff / code → LAST, only for edge cases and regression

**Never generate tests from code diffs.** If the developer built the wrong thing,
tests from their code validate the wrong thing.

**Test case rules:**
- Atomic — one thing per test
- Verifiable — clear pass/fail
- Independent — no shared state
- No OR conditions — "verify X or Y" = two tests
- Reusable — valid for regression, not just first-time

---

## TypeScript Interfaces (current types.ts)

```typescript
UserStory        → title, description, acceptanceCriteria[]
TestCase         → id, title, priority, type, steps[], expectedResult
TestPlan         → summary, scope, strategy, testCases[]
TestResult       → testId, title, status, duration, error?, screenshot?
BugReport        → title, severity, stepsToReproduce[], expectedBehavior,
                   actualBehavior, environment, jiraFormat, azureFormat
PipelineResult   → story, plan, results[], analysis, bugs[]
```

---

## What's Planned Next

### Phase 2 — Smarter test cases (next priority)
- Add `risk: "high"|"medium"|"low"` to TestCase
- Add `acReference: string` to TestCase (links back to specific AC item)
- Add `playwrightFeasible: boolean` to TestCase (honest automation flagging)
- Update planner prompt to embed playbook methodology rules
- Update REPORT.md to show risk, AC reference, automatable columns

### Phase 3 — Multi-format output
- `--format jira` flag
- `--format ado` flag
- Separate bug report files per format

### Phase 4 — AC Sufficiency Check
- Validate story has enough AC before running pipeline
- Warn (not block) if AC is insufficient
- Suggest missing elements

### Phase 5 — Real run + polish (needs API credits)
- Run real pipeline, replace mock outputs with real ones
- Add screenshot to README
- Record demo GIF

### Phase 6 — PR Integration (optional, advanced)
- Read from GitHub PR description
- Read from ADO work item
- Post results back as PR comment

---

## Working Approach

**Two-AI workflow:**
- claude.ai (this chat) → planning, architecture, understanding, generating prompts
- Claude Code (VS Code) → executing, building, modifying files

**Rule:** Always verify in real terminal (CMD on Windows), not just Claude Code's
internal bash output. Claude Code saying "it works" ≠ it actually works.

**Windows note:** Use CMD for running npm commands. Git Bash and PowerShell have
Node.js PATH issues on this machine.

**Second opinion practice:** Key decisions are validated through multiple
perspectives before implementation.

---

## Decisions Already Made (do not revisit)

- Tech stack: Node.js + TypeScript (not Python) — Playwright is JS-native
- Demo app: https://demo.playwright.dev/todomvc — publicly accessible, no auth
- No mega-project — two focused pieces: portfolio project + playbook document
- AC validator will warn, not block — blocking kills demo reliability
- Screenshot added to README after real API run, not before
- Company name (previous employer) replaced with "platform" in all public docs
- `output/` excluded from git except `output/REPORT.md` (sample committed)

---

## Resume Bullets (draft)

```
• Built an AI-assisted QA workflow using Claude API and Playwright that
  generates test plans, structured test cases, and bug reports from user stories

• Designed a requirements-first QA methodology and integrated it into an
  automated pipeline, ensuring test generation is based on acceptance criteria
  rather than implementation details

• Developed a QA automation framework that produces traceable outputs from
  acceptance criteria through test execution and defect reporting
  (JIRA / Azure DevOps formats)
```

---

## How to Use This File

**At the start of a new claude.ai conversation:**
Upload this file and say:
"Here is my project context. Please read it before we continue."

**At the start of a Claude Code session:**
Reference it when giving prompts:
"Read CONTEXT.md first, then..."

**After major changes:**
Ask Claude to update the relevant sections and recommit.
