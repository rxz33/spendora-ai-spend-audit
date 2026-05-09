import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

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
  try {
    const data = await req.json();

    const prompt = `
You are an AI infrastructure procurement analyst.

Write a concise audit summary.

Tone:
- operational
- financially literate
- founder-friendly
- honest
- non-salesy

Audit Data:
${JSON.stringify(data, null, 2)}

Requirements:
- mention major savings
- mention overlap issues
- mention optimization opportunities
- avoid hype
- max 120 words
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