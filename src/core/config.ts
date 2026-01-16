/**
 * GEMINI PRODUCT BRAIN - Configuration Manager
 * Centralized config with environment variable loading
 */

import { config as dotenvConfig } from 'dotenv';
import type { SystemConfig, GeminiConfig } from './types.js';

// Load environment variables
dotenvConfig();

function getEnvVar(key: string, defaultValue?: string): string {
    const value = process.env[key];
    if (!value && defaultValue === undefined) {
        throw new Error(`❌ Missing required environment variable: ${key}`);
    }
    return value || defaultValue || '';
}

function getEnvNumber(key: string, defaultValue: number): number {
    const value = process.env[key];
    return value ? parseFloat(value) : defaultValue;
}

function getEnvBoolean(key: string, defaultValue: boolean): boolean {
    const value = process.env[key];
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true';
}

export const geminiConfig: GeminiConfig = {
    apiKey: getEnvVar('GEMINI_API_KEY', ''),
    model: getEnvVar('GEMINI_MODEL', 'gemini-1.5-pro'),
    temperature: getEnvNumber('GEMINI_TEMPERATURE', 0.7),
    maxTokens: getEnvNumber('GEMINI_MAX_TOKENS', 8192),
};

export const systemConfig: SystemConfig = {
    gemini: geminiConfig,
    outputFormat: (getEnvVar('OUTPUT_FORMAT', 'json') as 'json' | 'css' | 'tailwind'),
    verboseMode: getEnvBoolean('VERBOSE_MODE', false),
    selfHealingEnabled: true,
};

export function validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!geminiConfig.apiKey) {
        errors.push('GEMINI_API_KEY is not configured');
    }

    if (geminiConfig.temperature < 0 || geminiConfig.temperature > 2) {
        errors.push('GEMINI_TEMPERATURE must be between 0 and 2');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

export function printConfig(): void {
    console.log('\n┌─────────────────────────────────────────┐');
    console.log('│       SYSTEM CONFIGURATION              │');
    console.log('├─────────────────────────────────────────┤');
    console.log(`│ Model:       ${geminiConfig.model.padEnd(25)}│`);
    console.log(`│ Temperature: ${String(geminiConfig.temperature).padEnd(25)}│`);
    console.log(`│ Max Tokens:  ${String(geminiConfig.maxTokens).padEnd(25)}│`);
    console.log(`│ Output:      ${systemConfig.outputFormat.padEnd(25)}│`);
    console.log(`│ Verbose:     ${String(systemConfig.verboseMode).padEnd(25)}│`);
    console.log(`│ API Key:     ${geminiConfig.apiKey ? '✓ Configured'.padEnd(25) : '✗ Missing'.padEnd(25)}│`);
    console.log('└─────────────────────────────────────────┘\n');
}
