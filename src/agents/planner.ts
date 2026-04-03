import Anthropic from "@anthropic-ai/sdk";
import type { UserStory, TestPlan } from "../types.js";
import { CONFIG } from "../config.js";

const client = new Anthropic();

export async function generateTestPlan(story: UserStory): Promise<TestPlan> {
  const response = await client.messages.create({
    model: CONFIG.model,
    max_tokens: CONFIG.maxTokens.planner,
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            scope: { type: "string" },
            strategy: { type: "string" },
            testCases: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                  type: { type: "string", enum: ["functional", "edge", "negative"] },
                  steps: { type: "array", items: { type: "string" } },
                  expectedResult: { type: "string" },
                },
                required: ["id", "title", "priority", "type", "steps", "expectedResult"],
                additionalProperties: false,
              },
            },
          },
          required: ["summary", "scope", "strategy", "testCases"],
          additionalProperties: false,
        },
      },
    },
    messages: [
      {
        role: "user",
        content: `You are a senior QA engineer. Generate a detailed test plan for this user story.

USER STORY:
Title: ${story.title}
Description: ${story.description}
Acceptance Criteria:
${story.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Generate 5-8 test cases covering happy path, edge cases, and negative scenarios.`,
      },
    ],
  });

  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("[Planner] No text block returned from API");
  }

  return JSON.parse(block.text) as TestPlan;
}
