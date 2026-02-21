import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

// ─── Schema for the structured Epic the AI must return ────────────────────────
const EpicSchema = z.object({
  title: z.string().describe('Short title for the engineering epic (e.g. "Redis SETNX Distributed Lock")'),
  strategy: z.string().describe('1-2 sentence description of the chosen technical strategy'),
  components: z
    .array(z.string())
    .describe('List of concrete system components involved (e.g. ["Redis Cluster", "API Gateway", "DLQ"])'),
  riskLevel: z
    .enum(['low', 'medium', 'high', 'critical'])
    .describe('Overall risk level of the approved approach'),
  estimatedComplexity: z
    .enum(['low', 'medium', 'high'])
    .describe('Engineering complexity to implement the strategy'),
});

// ─── POST /api/synthesize ─────────────────────────────────────────────────────
export async function POST(request: Request) {
  let body: { userCommand?: string; history?: Array<{ sender: string; text: string }> };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { userCommand = '', history = [] } = body;

  // Format the conversation history into a readable transcript
  const transcript = history
    .map(m => `${m.sender.toUpperCase()}: ${m.text}`)
    .join('\n');

  const prompt = `You are a technical program manager analyzing an engineering war room conversation about a high-concurrency race condition.

CONVERSATION TRANSCRIPT:
${transcript}

CTO DIRECTIVE: "${userCommand}"

Extract a structured Epic from this conversation. Focus on:
- The race condition problem (Redis inventory oversell)
- The chosen solution (Redis SETNX distributed lock with 500ms TTL)
- The components that will be affected

Return a concise, actionable Epic.`;

  try {
    const { object } = await generateObject({
      model: anthropic('claude-opus-4-6'),
      schema: EpicSchema,
      prompt,
    });

    return NextResponse.json({ epic: object });
  } catch (error) {
    console.error('[/api/synthesize] generateObject failed:', error);
    return NextResponse.json(
      { error: 'AI synthesis failed', epic: null },
      { status: 500 }
    );
  }
}
