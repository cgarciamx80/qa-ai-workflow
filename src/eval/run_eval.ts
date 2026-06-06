import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TEST_CASE_PROMPT = `You are evaluating the quality of an AI-generated test case for a software QA pipeline.

User story acceptance criteria:
{acceptanceCriteria}

Test case to evaluate:
ID: {id}
Title: {title}
Type: {type}
Priority: {priority}
Steps: {steps}
Expected Result: {expectedResult}

Score this test case on three dimensions (1-5 each):

1. ac_traceability: Does this test case clearly trace back to one or more acceptance criteria?
   5 = directly maps to a specific AC with clear connection
   3 = loosely related to an AC
   1 = no clear connection to any AC

2. atomicity: Does this test case test exactly one thing?
   5 = tests exactly one behavior, completely atomic
   3 = mostly one thing but slightly broad
   1 = tests multiple unrelated behaviors

3. verifiability: Is the expected result specific, measurable, and unambiguous?
   5 = crystal clear pass/fail criteria, no interpretation needed
   3 = mostly clear but some ambiguity
   1 = vague or subjective expected result

Return ONLY valid JSON in this exact format:
{"ac_traceability": <1-5>, "atomicity": <1-5>, "verifiability": <1-5>, "reasoning": "<one sentence>"}`;

const COVERAGE_PROMPT = `You are evaluating whether a set of AI-generated test cases adequately covers all acceptance criteria.

Acceptance criteria:
{acceptanceCriteria}

Test cases generated:
{testCaseSummary}

Score overall coverage (1-5):
5 = every AC has at least one direct test case
3 = most ACs covered but some gaps
1 = major coverage gaps

Return ONLY valid JSON in this exact format:
{"coverage_score": <1-5>, "uncovered_acs": ["<ac if any>"], "reasoning": "<one sentence>"}`;

interface TestCase {
  id: string;
  title: string;
  type: string;
  priority: string;
  steps: string[];
  expectedResult: string;
}

interface PipelineResult {
  story: {
    acceptanceCriteria: string[];
  };
  plan: {
    testCases: TestCase[];
  };
}

interface TestCaseScore {
  id: string;
  title: string;
  ac_traceability: number;
  atomicity: number;
  verifiability: number;
  avg_score: number;
  reasoning: string;
}

function extractJson(text: string): string {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`No JSON found in response: ${text}`);
  return match[0];
}

async function scoreTestCase(
  testCase: TestCase,
  acceptanceCriteria: string[]
): Promise<TestCaseScore> {
  const prompt = TEST_CASE_PROMPT
    .replace("{acceptanceCriteria}", acceptanceCriteria.map((ac, i) => `${i + 1}. ${ac}`).join("\n"))
    .replace("{id}", testCase.id)
    .replace("{title}", testCase.title)
    .replace("{type}", testCase.type)
    .replace("{priority}", testCase.priority)
    .replace("{steps}", testCase.steps.map((s, i) => `${i + 1}. ${s}`).join("\n"))
    .replace("{expectedResult}", testCase.expectedResult);

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [{ role: "user", content: prompt }],
  });

  const text = (response.content[0] as { text: string }).text;
  const scores = JSON.parse(extractJson(text));

  const avg = Math.round(
    ((scores.ac_traceability + scores.atomicity + scores.verifiability) / 3) * 10
  ) / 10;

  return {
    id: testCase.id,
    title: testCase.title,
    ac_traceability: scores.ac_traceability,
    atomicity: scores.atomicity,
    verifiability: scores.verifiability,
    avg_score: avg,
    reasoning: scores.reasoning,
  };
}

async function scoreCoverage(
  testCases: TestCase[],
  acceptanceCriteria: string[]
): Promise<{ coverage_score: number; uncovered_acs: string[]; reasoning: string }> {
  const summary = testCases
    .map((tc) => `${tc.id}: ${tc.title}`)
    .join("\n");

  const prompt = COVERAGE_PROMPT
    .replace("{acceptanceCriteria}", acceptanceCriteria.map((ac, i) => `${i + 1}. ${ac}`).join("\n"))
    .replace("{testCaseSummary}", summary);

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [{ role: "user", content: prompt }],
  });

  const text = (response.content[0] as { text: string }).text;
  return JSON.parse(extractJson(text));
}

function pad(str: string, len: number): string {
  return str.padEnd(len);
}

function printResults(scores: TestCaseScore[], coverage: { coverage_score: number; uncovered_acs: string[]; reasoning: string }) {
  console.log("\n=== QA EVAL RESULTS ===\n");

  console.log("--- TEST CASE SCORES ---");
  console.log(`${pad("ID", 8)}${pad("Trace", 8)}${pad("Atomic", 9)}${pad("Verify", 9)}${pad("Avg", 6)}Reasoning`);
  console.log("-".repeat(90));

  for (const s of scores) {
    console.log(
      `${pad(s.id, 8)}${pad(String(s.ac_traceability), 8)}${pad(String(s.atomicity), 9)}${pad(String(s.verifiability), 9)}${pad(String(s.avg_score), 6)}${s.reasoning}`
    );
  }

  const avgTraceability = Math.round(scores.reduce((sum, s) => sum + s.ac_traceability, 0) / scores.length * 10) / 10;
  const avgAtomicity = Math.round(scores.reduce((sum, s) => sum + s.atomicity, 0) / scores.length * 10) / 10;
  const avgVerifiability = Math.round(scores.reduce((sum, s) => sum + s.verifiability, 0) / scores.length * 10) / 10;
  const overallAvg = Math.round((avgTraceability + avgAtomicity + avgVerifiability) / 3 * 10) / 10;

  console.log("\n--- SUMMARY ---");
  console.log(`  avg_ac_traceability: ${avgTraceability}`);
  console.log(`  avg_atomicity:       ${avgAtomicity}`);
  console.log(`  avg_verifiability:   ${avgVerifiability}`);
  console.log(`  overall_avg:         ${overallAvg}`);

  console.log("\n--- COVERAGE ---");
  console.log(`  coverage_score: ${coverage.coverage_score}/5`);
  console.log(`  uncovered_acs:  ${coverage.uncovered_acs.length === 0 ? "none" : coverage.uncovered_acs.join(", ")}`);
  console.log(`  reasoning:      ${coverage.reasoning}`);

  const lowTraceability = scores.filter((s) => s.ac_traceability <= 2);
  if (lowTraceability.length > 0) {
    console.log("\n--- FINDINGS ---");
    console.log("Low AC traceability (score <= 2) — test cases not clearly tied to acceptance criteria:");
    for (const s of lowTraceability) {
      console.log(`  ${s.id}: ${s.title}`);
    }
  }
}

async function main() {
  const resultPath = path.join(process.cwd(), "output", "pipeline-result.json");

  if (!fs.existsSync(resultPath)) {
    console.error("No pipeline-result.json found. Run the pipeline first.");
    process.exit(1);
  }

  const pipelineResult: PipelineResult = JSON.parse(fs.readFileSync(resultPath, "utf-8"));
  const { acceptanceCriteria } = pipelineResult.story;
  const { testCases } = pipelineResult.plan;

  console.log(`Running QA eval on ${testCases.length} test cases...\n`);

  const scores: TestCaseScore[] = [];
  for (const tc of testCases) {
    process.stdout.write(`  Scoring ${tc.id}...`);
    const score = await scoreTestCase(tc, acceptanceCriteria);
    scores.push(score);
    console.log(` done (avg: ${score.avg_score})`);
  }

  console.log("\n  Scoring coverage...");
  const coverage = await scoreCoverage(testCases, acceptanceCriteria);

  printResults(scores, coverage);

  const evalOutput = { scores, coverage, timestamp: new Date().toISOString() };
  const outputPath = path.join(process.cwd(), "output", "eval-results.json");
  fs.writeFileSync(outputPath, JSON.stringify(evalOutput, null, 2));
  console.log(`\nEval results saved to output/eval-results.json`);
}

main().catch(console.error);
