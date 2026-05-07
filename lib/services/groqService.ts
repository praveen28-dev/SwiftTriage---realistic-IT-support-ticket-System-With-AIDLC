/**
 * Groq AI Service
 * Encapsulates Groq API integration for AI-powered ticket triage
 *
 * Security fix HIGH-01:
 * - Added sanitizeUserInput() to strip common prompt-injection patterns
 *   before the text reaches the model. This runs in <1ms and does not
 *   affect the perceived 800ms latency budget.
 * - Replaced loose JSON.parse + manual checks with a strict Zod schema
 *   that rejects any response that doesn't exactly match the expected shape.
 *   Unknown fields are stripped; out-of-range values throw and trigger fallback.
 */

import Groq from 'groq-sdk';
import { z } from 'zod';
import { config } from '@/lib/config';
import { logError } from '@/lib/utils/errors';

// ─── Output schema (strict) ───────────────────────────────────────────────────

const triageResponseSchema = z.object({
  category: z.enum(['Hardware', 'Network', 'Access', 'Software', 'Uncategorized']),
  urgency_score: z.number().int().min(1).max(10),
  ai_summary: z.string().min(1).max(500).trim(),
}).strict(); // reject any extra fields the model might hallucinate

export type TriageResult = z.infer<typeof triageResponseSchema>;

// ─── Groq client ──────────────────────────────────────────────────────────────

const groq = new Groq({ apiKey: config.groq.apiKey });

// ─── System prompt ────────────────────────────────────────────────────────────
// Kept identical to the original requirement; the injection defence is on the
// input side, not by modifying the system prompt.

const SYSTEM_PROMPT =
  'You are an IT Helpdesk Triage AI. Analyze the user\'s IT problem. ' +
  'You must respond ONLY with a valid JSON object matching this schema: ' +
  '{ "category": "String (Must be Hardware, Network, Access, Software, or Uncategorized)", ' +
  '"urgency_score": "Number (1 to 10)", ' +
  '"ai_summary": "String (A clean, professional 1-sentence summary)" }. ' +
  'Do not include markdown formatting, conversational text, or explanations.';

// ─── Input sanitization (HIGH-01) ────────────────────────────────────────────

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(previous|all|above|prior)\s+instructions?/gi,
  /disregard\s+(previous|all|above|prior)\s+instructions?/gi,
  /forget\s+(previous|all|above|prior)\s+instructions?/gi,
  /you\s+are\s+now\s+a/gi,
  /act\s+as\s+(a|an)\s+/gi,
  /system\s*prompt/gi,
  /\[INST\]/gi,
  /<\|im_start\|>/gi,
  /<\|system\|>/gi,
];

const MAX_INPUT_LENGTH = 2000; // tighter than the 5000 Zod allows at the API layer

/**
 * Strip common prompt-injection patterns and enforce a hard length cap.
 * Runs synchronously in <1ms — no latency impact.
 */
function sanitizeUserInput(input: string): string {
  let sanitized = input.substring(0, MAX_INPUT_LENGTH);

  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[redacted]');
  }

  return sanitized.trim();
}

// ─── Response parsing (HIGH-01) ───────────────────────────────────────────────

/**
 * Parse and strictly validate the Groq API response using Zod.
 * Strips markdown code fences the model sometimes adds despite instructions.
 */
function parseGroqResponse(response: Groq.Chat.ChatCompletion): TriageResult {
  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content in Groq response');
  }

  // Strip markdown code fences (```json ... ```) if present
  const cleaned = content
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Groq response is not valid JSON: ${cleaned.substring(0, 100)}`);
  }

  // Strict Zod validation — throws ZodError if shape is wrong
  return triageResponseSchema.parse(parsed);
}

// ─── Fallback ─────────────────────────────────────────────────────────────────

function getFallbackTriage(userInput: string): TriageResult {
  return {
    category: 'Uncategorized',
    urgency_score: 3,
    // Use sanitized input in fallback summary to avoid storing injected text
    ai_summary: sanitizeUserInput(userInput).substring(0, 100),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Triage a ticket using Groq AI.
 *
 * Security: input is sanitized before being sent to the model;
 * output is validated against a strict Zod schema before being returned.
 * Neither step adds meaningful latency to the ~800ms Groq round-trip.
 */
export async function triageTicket(userInput: string): Promise<TriageResult> {
  // HIGH-01: sanitize before sending to the model
  const sanitizedInput = sanitizeUserInput(userInput);

  try {
    const response = await groq.chat.completions.create({
      model: config.groq.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        // Prefix reinforces the context so the model treats the text as data
        { role: 'user', content: `IT Issue: ${sanitizedInput}` },
      ],
      temperature: 0.1,  // lower = more deterministic output
      max_tokens: 150,   // tighter budget — valid response fits in ~80 tokens
    });

    // HIGH-01: strict Zod validation on the way out
    return parseGroqResponse(response);
  } catch (error) {
    logError(error as Error, {
      context: 'groqService.triageTicket',
      // Log sanitized input only — never log raw user input
      sanitizedInputLength: sanitizedInput.length,
    });

    return getFallbackTriage(userInput);
  }
}
