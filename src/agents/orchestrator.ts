/**
 * ORCHESTRATOR - Multi-Agent Coordination Engine
 * Coordinates the execution pipeline across all specialized agents
 */

import { randomUUID } from 'crypto';
import type {
    AgentRole,
    AgentOutput,
    OrchestrationPlan,
    OrchestrationStage,
    OrchestrationResult,
    OrchestrationMetrics,
    DesignTokenSet,
    ProductBrief,
} from '../core/types.js';
import { DesignTokenSetSchema } from '../core/types.js';
import { uxStrategist } from './ux-strategist.js';
import { uiArchitect } from './ui-architect.js';
import { contentWriter } from './content-writer.js';
import { BaseAgent } from './base-agent.js';

// Agent registry
const agents: Record<AgentRole, BaseAgent> = {
    'ux-strategist': uxStrategist,
    'ui-architect': uiArchitect,
    'content-writer': contentWriter,
    'ab-optimizer': uxStrategist, // Placeholder - can create dedicated agent
};

// Default pipeline order
const DEFAULT_PIPELINE: AgentRole[] = [
    'ux-strategist',
    'ui-architect',
    'content-writer',
];

export interface OrchestratorConfig {
    pipeline?: AgentRole[];
    verbose?: boolean;
    onStageStart?: (stage: OrchestrationStage) => void;
    onStageComplete?: (stage: OrchestrationStage, output: AgentOutput) => void;
    onError?: (error: Error, stage: OrchestrationStage) => void;
}

export class Orchestrator {
    private config: OrchestratorConfig;

    constructor(config: OrchestratorConfig = {}) {
        this.config = {
            pipeline: DEFAULT_PIPELINE,
            verbose: false,
            ...config,
        };
    }

    /**
     * Create an orchestration plan from a product brief
     */
    createPlan(brief: ProductBrief): OrchestrationPlan {
        const pipeline = this.config.pipeline || DEFAULT_PIPELINE;

        const stages: OrchestrationStage[] = pipeline.map((agent, index) => ({
            order: index,
            agent,
            input: this.createAgentInput(agent, brief),
            dependencies: index > 0 ? [index - 1] : [],
            status: 'idle',
        }));

        return {
            id: randomUUID(),
            objective: `Design system for: ${brief.productName}`,
            createdAt: new Date().toISOString(),
            stages,
            status: 'pending',
            currentStage: 0,
        };
    }

    /**
     * Execute the full orchestration pipeline
     */
    async execute(brief: ProductBrief): Promise<OrchestrationResult> {
        const startTime = Date.now();
        const plan = this.createPlan(brief);
        plan.status = 'running';

        const outputs: AgentOutput[] = [];
        let finalTokens: DesignTokenSet = {};

        for (let i = 0; i < plan.stages.length; i++) {
            const stage = plan.stages[i];
            plan.currentStage = i;
            stage.status = 'thinking';

            this.config.onStageStart?.(stage);

            try {
                // Build context from previous outputs
                const previousOutputs = outputs.slice();

                // Create full prompt with brief context
                const fullPrompt = this.buildStagePrompt(stage, brief, previousOutputs);

                // Execute agent
                const agent = agents[stage.agent];
                const output = await agent.execute(fullPrompt, previousOutputs);

                // Extract tokens if UI Architect
                if (stage.agent === 'ui-architect') {
                    finalTokens = this.extractTokens(output);
                }

                stage.output = output;
                stage.status = 'complete';
                outputs.push(output);

                this.config.onStageComplete?.(stage, output);

            } catch (error) {
                stage.status = 'error';
                plan.status = 'failed';
                this.config.onError?.(error as Error, stage);
                throw error;
            }
        }

        plan.status = 'complete';

        const metrics: OrchestrationMetrics = {
            totalDurationMs: Date.now() - startTime,
            tokenCount: this.countTokens(finalTokens),
            agentCalls: outputs.length,
            validationPassed: this.validateTokens(finalTokens),
        };

        return {
            plan,
            outputs,
            finalTokens,
            metrics,
        };
    }

    /**
     * Execute a single agent in isolation
     */
    async executeSingleAgent(
        role: AgentRole,
        objective: string,
        previousOutputs: AgentOutput[] = []
    ): Promise<AgentOutput> {
        const agent = agents[role];
        if (!agent) {
            throw new Error(`Unknown agent role: ${role}`);
        }
        return agent.execute(objective, previousOutputs);
    }

    private createAgentInput(agent: AgentRole, brief: ProductBrief): string {
        const baseContext = `
Product: ${brief.productName}
Description: ${brief.description}
Target Audience: ${brief.targetAudience}
Brand Voice: ${brief.brandVoice}
${brief.colorPreferences ? `Color Preferences: ${brief.colorPreferences.join(', ')}` : ''}
${brief.competitors ? `Competitors: ${brief.competitors.join(', ')}` : ''}
${brief.constraints ? `Constraints: ${brief.constraints.join(', ')}` : ''}
`.trim();

        return baseContext;
    }

    private buildStagePrompt(
        stage: OrchestrationStage,
        brief: ProductBrief,
        previousOutputs: AgentOutput[]
    ): string {
        let prompt = stage.input;

        if (previousOutputs.length > 0) {
            prompt += '\n\n--- PREVIOUS AGENT DECISIONS ---\n';
            for (const output of previousOutputs) {
                prompt += `\n[${output.agentRole.toUpperCase()}]: ${output.decision}\n`;
            }
        }

        return prompt;
    }

    private extractTokens(output: AgentOutput): DesignTokenSet {
        for (const artifact of output.artifacts) {
            if (artifact.type === 'json') {
                try {
                    const parsed = JSON.parse(artifact.content);
                    // Try to validate as design tokens
                    const result = DesignTokenSetSchema.safeParse(parsed);
                    if (result.success) {
                        return result.data;
                    }
                    // Return anyway if it looks like tokens
                    if (parsed.colors || parsed.spacing || parsed.typography) {
                        return parsed as DesignTokenSet;
                    }
                } catch {
                    continue;
                }
            }
        }
        return {};
    }

    private validateTokens(tokens: DesignTokenSet): boolean {
        const result = DesignTokenSetSchema.safeParse(tokens);
        return result.success;
    }

    private countTokens(tokens: DesignTokenSet): number {
        let count = 0;
        if (tokens.colors) count += Object.keys(tokens.colors).length;
        if (tokens.spacing) count += Object.keys(tokens.spacing).length;
        if (tokens.typography) count += Object.keys(tokens.typography).length;
        if (tokens.shadows) count += Object.keys(tokens.shadows).length;
        if (tokens.borderRadius) count += Object.keys(tokens.borderRadius).length;
        return count;
    }
}

// Export singleton instance
export const orchestrator = new Orchestrator();

// Export factory for custom configs
export function createOrchestrator(config: OrchestratorConfig): Orchestrator {
    return new Orchestrator(config);
}
