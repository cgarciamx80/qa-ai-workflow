# AI-Assisted QA Playbook
## Requirements-First Testing for Modern QA Workflows

This document defines a structured QA methodology for AI-assisted testing workflows. It captures best practices, guardrails, and decision-making patterns used to ensure that testing is driven by requirements and user intent — not by implementation details.

This playbook reflects how QA can be performed in modern environments where AI is used to support (but not replace) QA thinking.

---

## 1. Core Principle: Test What Should Be Built

The most important rule in QA:

> **Never generate test cases solely from implementation details or code changes.**

Code represents what was built — not necessarily what should have been built.

Testing based only on code leads to false validation of incorrect behavior.

---

## Source Hierarchy for Test Design

| Priority | Source | Purpose |
|----------|--------|--------|
| 1 | Acceptance Criteria (AC) | Defines expected behavior |
| 2 | Prototypes / Designs | Defines UI and interaction expectations |
| 3 | Stakeholder Input | Clarifies edge cases and corrections |
| 4 | Product Conventions | Defines consistent system behavior |
| 5 | Implementation (Code / PR) | Used only for edge cases and regression risks |

---

## 2. The Implementation Trap

A common mistake in QA is starting from implementation.

This leads to:
- validating incorrect behavior  
- missing requirement gaps  
- false confidence in test coverage  

Correct approach:

Requirements → Test Design → Validation  

NOT:

Implementation → Test Design → Validation  

---

## 3. QA Test Design Process

### Step 1: Gather Context

Before writing any test:

- Read acceptance criteria  
- Review design artifacts (mockups, prototypes)  
- Review stakeholder comments  
- Understand product conventions  

---

### Step 2: Write Test Cases

Each test must be:

- Atomic (tests one thing)  
- Verifiable (clear pass/fail)  
- Independent  
- Reusable for regression  
- Free of OR conditions  

---

### Step 3: Required Test Categories

#### Functional Validation  
Derived directly from acceptance criteria  

#### Data Accuracy  
Validate correct fields, not just presence of data  

#### Negative Scenarios  
Invalid inputs, permissions, missing data  

#### Edge Cases  
Boundary conditions and rare scenarios  

#### Regression Risks  
Impact on existing features  

---

## 4. Test Execution Principles

- Validate environment and data setup  
- Capture evidence (screenshots, logs)  
- Document exact steps taken  
- Clearly compare expected vs actual results  

---

## 5. Bug Reporting Standards

A good bug report includes:

- Clear title (action + failure + impact)  
- Reproducible steps  
- Expected vs actual behavior  
- Environment details  
- Evidence (screenshots or logs)  

---

## 6. Root Cause Analysis (RCA)

Before assigning blame:

- Verify all available artifacts  
- Check designs and comments  
- Validate assumptions  

### Valid RCA Categories

- QA Miss  
- Requirement Gap  
- Implementation Error  
- Convention Violation  
- Environment/Data Issue  

Avoid deflecting responsibility when information was available.

---

## 7. Implementation Review (QA Perspective)

Implementation details are useful for:

- Identifying regression risks  
- Discovering edge cases  
- Understanding system impact  

They should NOT be used to define expected behavior.

---

## 8. Common Pitfalls

| Pitfall | Risk | Prevention |
|--------|------|-----------|
| Testing from code | Validates wrong behavior | Start from requirements |
| Testing presence only | Misses incorrect data | Validate exact values |
| Ignoring designs | Misses UI expectations | Always review prototypes |
| Skipping context | Missing scenarios | Review full requirement context |
| Poor RCA | Misdiagnosis | Verify before concluding |

---

## 9. QA Workflow Summary

Requirement → Context Review → Test Design → Execution → Validation → Reporting  

---

## 10. AI Integration in QA

AI can assist with:

- Generating test plans  
- Creating structured test cases  
- Suggesting automation scripts  
- Analyzing test results  
- Drafting bug reports  

However:

> **AI must follow QA methodology — not replace QA thinking.**

---

## 11. Checklist Validation

Before finalizing testing:

- All acceptance criteria are covered  
- Test cases are atomic and clear  
- Edge cases are included  
- Data accuracy is validated  
- Environment setup is confirmed  

---

## 12. Positioning

This playbook is not a rigid framework.

It is a structured approach that reflects:

- Real-world QA practices  
- Requirements-first testing philosophy  
- Practical integration of AI into QA workflows  

It is designed to support consistency, clarity, and correctness in testing — whether executed manually or assisted by AI systems.
