/**
 * GEMINI PRODUCT BRAIN - Core Type Definitions
 * All interfaces for the multi-agent orchestration system
 */

import { z } from 'zod';

// ============================================
// AGENT TYPES
// ============================================

export type AgentRole =
    | 'ux-strategist'
    | 'ui-architect'
    | 'content-writer'
    | 'ab-optimizer';

export type AgentStatus =
    | 'idle'
    | 'thinking'
    | 'executing'
    | 'complete'
    | 'error';

export interface AgentContext {
    role: AgentRole;
    objective: string;
    constraints: string[];
    previousOutputs: AgentOutput[];
    sharedMemory: Record<string, unknown>;
}

export interface AgentOutput {
    agentRole: AgentRole;
    timestamp: string;
    thinking: string;
    decision: string;
    artifacts: Artifact[];
    tokens?: DesignTokenSet;
    nextAgent?: AgentRole;
    confidence: number; // 0-1
}

export interface Artifact {
    type: 'json' | 'code' | 'markdown' | 'figma-node';
    name: string;
    content: string;
    metadata?: Record<string, unknown>;
}

// ============================================
// DESIGN TOKEN TYPES
// ============================================

export const ColorTokenSchema = z.object({
    value: z.string().regex(/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/),
    type: z.literal('color'),
    description: z.string().optional(),
    a11y: z.object({
        contrastRatio: z.number().optional(),
        wcagLevel: z.enum(['AA', 'AAA', 'fail']).optional(),
    }).optional(),
});

export const SpacingTokenSchema = z.object({
    value: z.string().regex(/^\d+(\.\d+)?(px|rem|em)$/),
    type: z.literal('spacing'),
    description: z.string().optional(),
});

export const TypographyTokenSchema = z.object({
    value: z.object({
        fontFamily: z.string(),
        fontSize: z.string(),
        fontWeight: z.union([z.string(), z.number()]),
        lineHeight: z.string(),
        letterSpacing: z.string().optional(),
    }),
    type: z.literal('typography'),
    description: z.string().optional(),
});

export const ShadowTokenSchema = z.object({
    value: z.string(),
    type: z.literal('shadow'),
    description: z.string().optional(),
});

export const BorderRadiusTokenSchema = z.object({
    value: z.string(),
    type: z.literal('borderRadius'),
    description: z.string().optional(),
});

export const DesignTokenSetSchema = z.object({
    $schema: z.string().optional(),
    $metadata: z.object({
        generatedBy: z.string(),
        timestamp: z.string(),
        version: z.string(),
    }).optional(),
    colors: z.record(z.string(), ColorTokenSchema).optional(),
    spacing: z.record(z.string(), SpacingTokenSchema).optional(),
    typography: z.record(z.string(), TypographyTokenSchema).optional(),
    shadows: z.record(z.string(), ShadowTokenSchema).optional(),
    borderRadius: z.record(z.string(), BorderRadiusTokenSchema).optional(),
});

export type ColorToken = z.infer<typeof ColorTokenSchema>;
export type SpacingToken = z.infer<typeof SpacingTokenSchema>;
export type TypographyToken = z.infer<typeof TypographyTokenSchema>;
export type ShadowToken = z.infer<typeof ShadowTokenSchema>;
export type BorderRadiusToken = z.infer<typeof BorderRadiusTokenSchema>;
export type DesignTokenSet = z.infer<typeof DesignTokenSetSchema>;

// ============================================
// ORCHESTRATOR TYPES
// ============================================

export interface OrchestrationPlan {
    id: string;
    objective: string;
    createdAt: string;
    stages: OrchestrationStage[];
    status: 'pending' | 'running' | 'complete' | 'failed';
    currentStage: number;
}

export interface OrchestrationStage {
    order: number;
    agent: AgentRole;
    input: string;
    dependencies: number[]; // indices of stages this depends on
    output?: AgentOutput;
    status: AgentStatus;
}

export interface OrchestrationResult {
    plan: OrchestrationPlan;
    outputs: AgentOutput[];
    finalTokens: DesignTokenSet;
    generatedCode?: string;
    metrics: OrchestrationMetrics;
}

export interface OrchestrationMetrics {
    totalDurationMs: number;
    tokenCount: number;
    agentCalls: number;
    validationPassed: boolean;
    a11yScore?: number;
}

// ============================================
// INPUT TYPES
// ============================================

export interface ProductBrief {
    productName: string;
    description: string;
    targetAudience: string;
    brandVoice: 'formal' | 'casual' | 'playful' | 'technical' | 'luxury';
    colorPreferences?: string[];
    competitors?: string[];
    constraints?: string[];
}

export interface FeedbackData {
    source: 'zendesk' | 'appstore' | 'playstore' | 'transcript' | 'survey';
    entries: FeedbackEntry[];
}

export interface FeedbackEntry {
    id: string;
    text: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
    category?: string;
    timestamp?: string;
}

// ============================================
// CONFIG TYPES
// ============================================

export interface GeminiConfig {
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
}

export interface SystemConfig {
    gemini: GeminiConfig;
    outputFormat: 'json' | 'css' | 'tailwind';
    verboseMode: boolean;
    selfHealingEnabled: boolean;
}
