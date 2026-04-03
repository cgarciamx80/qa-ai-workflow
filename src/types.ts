export interface UserStory {
  title: string;
  description: string;
  acceptanceCriteria: string[];
}

export interface TestCase {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  steps: string[];
  expectedResult: string;
  type: "functional" | "edge" | "negative";
}

export interface TestPlan {
  summary: string;
  scope: string;
  strategy: string;
  testCases: TestCase[];
}

export interface TestResult {
  testId: string;
  title: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
  error?: string;
  screenshot?: string;
}

export interface BugReport {
  title: string;
  severity: "critical" | "major" | "minor" | "trivial";
  stepsToReproduce: string[];
  expectedBehavior: string;
  actualBehavior: string;
  environment: string;
  jiraFormat: string;
  azureFormat: string;
}

export interface PipelineResult {
  story: UserStory;
  plan: TestPlan;
  results: TestResult[];
  analysis: string;
  bugs: BugReport[];
}
