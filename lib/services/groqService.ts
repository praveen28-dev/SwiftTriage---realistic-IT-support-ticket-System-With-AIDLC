/**
 * Groq AI Service
 * Encapsulates Groq API integration for AI-powered ticket triage
 */

import Groq from 'groq-sdk';
import { config } from '@/lib/config';
import { logError } from '@/lib/utils/errors';

export interface TriageResult {
  category: 'Hardware' | 'Network' | 'Access' | 'Software' | 'Uncategorized';
  urgency_score: number; // 1-5
  ai_summary: string;
}

// Initialize Groq client
const groq = new Groq({
  apiKey: config.groq.apiKey,
});

// System prompt (exact as specified in requirements)
const SYSTEM_PROMPT = `You are an IT Helpdesk Triage AI. Analyze the user's IT problem. You must respond ONLY with a valid JSON object matching this schema: { "category": "String (Must be Hardware, Network, Access, Software, or Uncategorized)", "urgency_score": "Number (1 to 5)", "ai_summary": "String (A clean, professional 1-sentence summary)" }. Do not include markdown formatting, conversational text, or explanations.`;

/**
 * Build the system prompt for Groq API
 * @returns System prompt string
 */
function buildSystemPrompt(): string {
  return SYSTEM_PROMPT;
}

/**
 * Parse and validate Groq API response
 * @param response - Raw response from Groq API
 * @returns Validated triage result
 * @throws Error if response is invalid
 */
function parseGroqResponse(response: any): TriageResult {
  try {
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in Groq response');
    }

    // Parse JSON response
    const parsed = JSON.parse(content);

    // Validate structure
    if (
      !parsed.category ||
      typeof parsed.urgency_score !== 'number' ||
      !parsed.ai_summary
    ) {
      throw new Error('Invalid Groq response structure');
    }

    return {
      category: parsed.category,
      urgency_score: parsed.urgency_score,
      ai_summary: parsed.ai_summary,
    };
  } catch (error) {
    throw new Error(`Failed to parse Groq response: ${error}`);
  }
}

/**
 * Get fallback triage result when Groq API fails
 * @param userInput - Original user input
 * @returns Fallback triage result
 */
function getFallbackTriage(userInput: string): TriageResult {
  return {
    category: 'Uncategorized',
    urgency_score: 3,
    ai_summary: userInput.substring(0, 100),
  };
}

/**
 * Triage a ticket using Groq AI
 * @param userInput - The user's IT issue description
 * @returns Triage result with category, urgency, and summary
 */
export async function triageTicket(
  userInput: string
): Promise<TriageResult> {
  try {
    // Call Groq API
    const response = await groq.chat.completions.create({
      model: config.groq.model, // llama3-8b-8192
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: userInput },
      ],
      temperature: 0.3, // Low temperature for consistent categorization
      max_tokens: 200,
    });

    // Parse and validate response
    const result = parseGroqResponse(response);
    return result;
  } catch (error) {
    // Log error
    logError(error as Error, {
      context: 'groqService.triageTicket',
      userInput,
    });

    // Return fallback triage
    return getFallbackTriage(userInput);
  }
}
