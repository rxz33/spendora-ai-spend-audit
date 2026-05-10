import { NextResponse } from "next/server";
import OpenAI from "openai";

interface SummaryData {
  totalMonthlySavings: number;
}

function generateFallbackSummary(
  data: SummaryData
) {
  if (data.totalMonthlySavings < 100) {
    return `Your current AI tooling stack appears relatively well optimized for your current team size and usage patterns. While immediate savings opportunities are limited, periodic reviews are recommended as pricing and tooling capabilities evolve.`;
  }

  return `Your audit identified approximately $${data.totalMonthlySavings} in potential monthly savings through vendor consolidation, plan optimization, and reduced subscription overlap. Several opportunities exist to improve operational efficiency while maintaining similar AI capabilities for your workflows.`;
}

export async function POST(req: Request) {
  const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });

  try {
    const data = await req.json();

    const prompt = `
You are an experienced AI procurement auditor writing a short client-facing audit note for a startup team.

Your job is to sound like a pragmatic human operator reviewing real software spend, not a marketing assistant.

Write one concise paragraph.

Voice and tone:
- operational
- financially literate
- specific
- calm
- honest
- non-salesy
- no buzzwords

What good output sounds like:
- mentions the biggest savings opportunity first
- notes if there is vendor overlap, redundant tooling, or plan inefficiency
- explains trade-offs briefly
- sounds credible to a founder, engineering manager, or ops lead
- acknowledges when savings are limited

Rules:
- do not invent facts that are not in the audit data
- do not exaggerate savings
- do not use phrases like "game-changing", "unlock", "supercharge", or "transform"
- avoid repeating the exact same structure every time
- keep it under 120 words
- return only the paragraph, with no heading or bullets

Audit Data:
${JSON.stringify(data, null, 2)}
`;

    const completion =
      await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.4,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

    const summary =
      completion.choices[0]?.message
        ?.content ||
      generateFallbackSummary(data);

    return NextResponse.json({
      summary,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      summary:
        "Your audit identified optimization opportunities across your AI tooling stack, including plan efficiency improvements and reduced subscription overlap.",
    });
  }
}
