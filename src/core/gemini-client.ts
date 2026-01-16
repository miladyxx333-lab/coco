/**
 * GEMINI PRODUCT BRAIN - Gemini API Client
 * Reusable client with structured output support
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { geminiConfig } from './config.js';

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

export function initializeGemini(): GenerativeModel {
    if (!geminiConfig.apiKey) {
        throw new Error('❌ GEMINI_API_KEY not configured. Copy .env.example to .env and add your key.');
    }

    if (!genAI) {
        genAI = new GoogleGenerativeAI(geminiConfig.apiKey);
    }

    if (!model) {
        model = genAI.getGenerativeModel({
            model: geminiConfig.model,
            generationConfig: {
                temperature: geminiConfig.temperature,
                maxOutputTokens: geminiConfig.maxTokens,
            },
        });
    }

    return model;
}

export interface GeminiResponse {
    text: string;
    tokenCount?: number;
    finishReason?: string;
}

export async function generateContent(prompt: string): Promise<GeminiResponse> {
    const model = initializeGemini();

    const result = await model.generateContent(prompt);
    const response = result.response;

    return {
        text: response.text(),
        finishReason: response.candidates?.[0]?.finishReason,
    };
}

export async function generateStructuredOutput<T>(
    prompt: string,
    parseResponse: (text: string) => T
): Promise<{ data: T; raw: string }> {
    const response = await generateContent(prompt);

    // Extract JSON from response (handles markdown code blocks)
    let jsonStr = response.text;
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
    }

    try {
        const data = parseResponse(jsonStr);
        return { data, raw: response.text };
    } catch (error) {
        throw new Error(`Failed to parse structured output: ${error}`);
    }
}

export async function generateWithContext(
    systemPrompt: string,
    userPrompt: string,
    context?: Record<string, unknown>
): Promise<GeminiResponse> {
    const fullPrompt = `
${systemPrompt}

${context ? `CONTEXT:\n${JSON.stringify(context, null, 2)}\n` : ''}

USER REQUEST:
${userPrompt}
`.trim();

    return generateContent(fullPrompt);
}
