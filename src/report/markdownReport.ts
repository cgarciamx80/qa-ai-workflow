import type { PipelineResult } from "../types.js";

export function generateMarkdownReport(result: PipelineResult): string {
  const { story, plan, results, bugs } = result;
  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";
  const passed = results.filter((r) => r.status === "passed").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const skipped = results.filter((r) => r.status === "skipped").length;

  const lines: string[] = [];

  lines.push(`# QA Report — ${story.title}`);
  lines.push(`Generated: ${timestamp}`);
  lines.push("");

  lines.push("## Summary");
  lines.push(`Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped} | Bugs filed: ${bugs.length}`);
  lines.push("");

  lines.push("## Test Plan");
  lines.push(`**Scope:** ${plan.scope}`);
  lines.push("");
  lines.push(`**Strategy:** ${plan.strategy}`);
  lines.push("");

  lines.push("## Test Cases");
  lines.push("| ID | Title | Type | Priority | Expected Result |");
  lines.push("|----|-------|------|----------|-----------------|");
  for (const tc of plan.testCases) {
    lines.push(`| ${tc.id} | ${tc.title} | ${tc.type} | ${tc.priority} | ${tc.expectedResult.replace(/\|/g, "\\|")} |`);
  }
  lines.push("");

  lines.push("## Execution Results");
  lines.push("| ID | Title | Status | Duration |");
  lines.push("|----|-------|--------|----------|");
  for (const r of results) {
    const status = r.status === "passed" ? "✅ passed" : r.status === "failed" ? "❌ failed" : "⏭️ skipped";
    const duration = r.status === "skipped" ? "—" : `${r.duration}ms`;
    lines.push(`| ${r.testId} | ${r.title} | ${status} | ${duration} |`);
  }
  lines.push("");

  const failures = results.filter((r) => r.status === "failed");
  if (failures.length > 0) {
    lines.push("## Failed Tests");
    for (const f of failures) {
      lines.push(`### ${f.title}`);
      lines.push(`Error: ${f.error ?? "No error message captured."}`);
      lines.push("");
    }
  }

  if (bugs.length > 0) {
    lines.push("## Bug Reports");
    for (const bug of bugs) {
      lines.push(`### ${bug.title}`);
      lines.push(`Severity: ${bug.severity}`);
      lines.push("");
      lines.push("Steps to Reproduce:");
      bug.stepsToReproduce.forEach((step, i) => lines.push(`${i + 1}. ${step}`));
      lines.push("");
      lines.push("JIRA Format:");
      lines.push(bug.jiraFormat);
      lines.push("");
    }
  }

  return lines.join("\n");
}
