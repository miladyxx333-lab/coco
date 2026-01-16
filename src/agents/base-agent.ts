/**
 * BASE AGENT - Abstract class for all specialized agents
 */

import type { AgentRole, AgentContext, AgentOutput, Artifact } from '../core/types.js';
import { generateWithContext } from '../core/gemini-client.js';

export abstract class BaseAgent {
    abstract role: AgentRole;
    abstract systemPrompt: string;

    protected createContext(objective: string, previousOutputs: AgentOutput[] = []): AgentContext {
        return {
            role: this.role,
            objective,
            constraints: this.getConstraints(),
            previousOutputs,
            sharedMemory: {},
        };
    }

    protected abstract getConstraints(): string[];

    protected parseArtifacts(text: string): Artifact[] {
        const artifacts: Artifact[] = [];

        // Extract JSON blocks
        const jsonMatches = text.matchAll(/```json\s*([\s\S]*?)```/g);
        for (const match of jsonMatches) {
            artifacts.push({
                type: 'json',
                name: `output-${artifacts.length + 1}.json`,
                content: match[1].trim(),
            });
        }

        // Extract code blocks
        const codeMatches = text.matchAll(/```(tsx?|jsx?|css)\s*([\s\S]*?)```/g);
        for (const match of codeMatches) {
            artifacts.push({
                type: 'code',
                name: `component-${artifacts.length + 1}.${match[1]}`,
                content: match[2].trim(),
            });
        }

        return artifacts;
    }

    async execute(objective: string, previousOutputs: AgentOutput[] = []): Promise<AgentOutput> {
        const startTime = Date.now();

        const contextData = {
            previousAgentOutputs: previousOutputs.map(o => ({
                agent: o.agentRole,
                decision: o.decision,
                artifacts: o.artifacts.map(a => ({ type: a.type, name: a.name })),
            })),
        };

        const response = await generateWithContext(
            this.systemPrompt,
            objective,
            previousOutputs.length > 0 ? contextData : undefined
        );

        const artifacts = this.parseArtifacts(response.text);

        // Extract thinking and decision from response
        const thinkingMatch = response.text.match(/\[THINKING\]([\s\S]*?)(?=\[|$)/i);
        const decisionMatch = response.text.match(/\[DECISION\]([\s\S]*?)(?=\[|```|$)/i);

        return {
            agentRole: this.role,
            timestamp: new Date().toISOString(),
            thinking: thinkingMatch?.[1]?.trim() || 'Analysis complete.',
            decision: decisionMatch?.[1]?.trim() || response.text.slice(0, 500),
            artifacts,
            confidence: this.calculateConfidence(artifacts, response.text),
        };
    }

    private calculateConfidence(artifacts: Artifact[], responseText: string): number {
        let score = 0.5; // Base confidence

        // Has structured artifacts
        if (artifacts.length > 0) score += 0.2;

        // Has JSON token output
        if (artifacts.some(a => a.type === 'json')) score += 0.15;

        // Has code output
        if (artifacts.some(a => a.type === 'code')) score += 0.1;

        // Response length indicates thoroughness
        if (responseText.length > 1000) score += 0.05;

        return Math.min(score, 1);
    }
}
