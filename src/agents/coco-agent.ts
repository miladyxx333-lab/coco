/**
 * COCO AGENT - Component Orchestration & Creative Operations
 * High-performance Product Design engine powered by Gemini
 */

import { BaseAgent } from './base-agent.js';
import type { AgentRole, AgentOutput } from '../core/types.js';
import { readFileSync, existsSync } from 'fs';

// ============================================
// COCO SYSTEM PROMPT
// ============================================

const COCO_SYSTEM_PROMPT = `
Role: Eres COCO (Component Orchestration & Creative Operations), un motor de Product Design de alto rendimiento. Tu objetivo es transformar ideas de negocio en infraestructuras de diseño escalables y rentables.

CORE LOGIC:
1. DATA-DRIVEN: No diseñas por estética, diseñas por jerarquía de información y objetivos de conversión.
2. CONSTRAINT-BASED: Solo utilizas los tokens proporcionados. NUNCA inventes valores fuera del sistema.
3. OUTPUT: Tu respuesta debe ser EXCLUSIVAMENTE un objeto JSON estructurado. No incluyas explicaciones.
4. CONEXIÓN: Una interfaz es el punto de contacto entre la conciencia del usuario y la utilidad del producto.

OUTPUT SCHEMA - RETURN ONLY THIS JSON:

\`\`\`json
{
  "metadata": {
    "project": "Nombre del Proyecto",
    "version": "1.0",
    "generatedBy": "COCO v1.0",
    "timestamp": "ISO-8601",
    "objective": "Descripción del objetivo de conversión"
  },
  "layout": {
    "device": "desktop",
    "viewport": { "width": 1440, "height": 900 },
    "grid": { "columns": 12, "gutter": 24, "margin": 120 }
  },
  "nodes": [
    {
      "id": "unique_id",
      "type": "FRAME|TEXT|RECTANGLE|BUTTON|INPUT",
      "name": "Semantic Name",
      "position": { "x": 0, "y": 0 },
      "dimensions": { "width": 100, "height": 50 },
      "props": {
        "fill": "#HEXCODE",
        "cornerRadius": 8,
        "text": "Button Text",
        "fontSize": 16,
        "fontWeight": "medium",
        "textColor": "#FFFFFF"
      },
      "children": [],
      "conversionRole": "primary_cta|secondary|info|navigation"
    }
  ],
  "conversionStrategy": {
    "primaryCTA": { "nodeId": "...", "expectedCTR": "3-5%" },
    "visualHierarchy": ["headline", "value_prop", "cta", "social_proof"]
  }
}
\`\`\`

DESIGN PRINCIPLES:
- F-Pattern for text content, Z-Pattern for landing pages
- CTAs above the fold with minimum 4.5:1 contrast ratio
- Single primary action per viewport
- Progress indicators for multi-step flows
- Whitespace as a focus tool

POSITIONING RULES:
- Navbar: y=0, height=72px
- Hero: y=72, height=500-700px
- Sections: 80-120px vertical spacing
- Content max-width: 1200px (centered with 120px margins)
- Cards in grid: gap=24px

BUTTON SPECS:
- Primary: fill from tokens.primary, white text, 8-12px radius
- Height: 44-56px for touch targets
- Padding: 16-24px horizontal

ACCESSIBILITY:
- WCAG 2.1 AA minimum
- All interactive elements with focus states
- Semantic naming for screen readers
`;

// ============================================
// COCO MODES
// ============================================

export type COCOMode = 'generate' | 'analyze' | 'iterate' | 'optimize';

export interface COCOConfig {
    mode: COCOMode;
    tokensPath?: string;  // Path to design_tokens.json
    metricsPath?: string; // Path to analytics data
    baseDesign?: string;  // Path to existing design JSON
    essence?: string;     // Essence pack name (luxury, fintech, etc.)
}

// ============================================
// COCO AGENT CLASS
// ============================================

export class COCOAgent extends BaseAgent {
    role: AgentRole = 'ui-architect';
    systemPrompt: string;

    private config: COCOConfig;
    private tokensContext: string = '';

    constructor(config: COCOConfig = { mode: 'generate' }) {
        super();
        this.config = config;
        this.systemPrompt = this.buildSystemPrompt();
    }

    private buildSystemPrompt(): string {
        let prompt = COCO_SYSTEM_PROMPT;

        // Load tokens if provided
        if (this.config.tokensPath && existsSync(this.config.tokensPath)) {
            try {
                const tokens = JSON.parse(readFileSync(this.config.tokensPath, 'utf-8'));
                this.tokensContext = `
DESIGN TOKENS (USE THESE EXACT VALUES):
${JSON.stringify(tokens, null, 2)}
`;
                prompt += this.tokensContext;
            } catch {
                console.warn('Could not load tokens file');
            }
        }

        // Add mode-specific instructions
        switch (this.config.mode) {
            case 'analyze':
                prompt += `
MODE: ANALYZE
You are analyzing existing designs for conversion optimization.
Identify issues and propose specific improvements with A/B variants.
`;
                break;
            case 'iterate':
                prompt += `
MODE: ITERATE
You are modifying an existing design based on feedback.
Preserve the overall structure, only change what's requested.
`;
                break;
            case 'optimize':
                prompt += `
MODE: OPTIMIZE
You are creating A/B variants for conversion testing.
Generate alternative designs with specific hypothesis for each change.
`;
                break;
            default:
                prompt += `
MODE: GENERATE
Create complete, production-ready design infrastructure from scratch.
`;
        }

        return prompt;
    }

    /**
     * Load essence pack (premium token library)
     */
    loadEssence(essenceName: string): void {
        const essencePath = `./essences/${essenceName}.json`;
        if (existsSync(essencePath)) {
            const essence = JSON.parse(readFileSync(essencePath, 'utf-8'));
            this.tokensContext = `
ESSENCE: ${essence.name}
${JSON.stringify(essence.tokens, null, 2)}
`;
            this.systemPrompt = this.buildSystemPrompt();
        }
    }

    /**
     * Execute COCO with business context
     */
    async generate(
        brief: string,
        conversionGoal?: string,
        targetAudience?: string
    ): Promise<AgentOutput> {
        let fullPrompt = brief;

        if (conversionGoal) {
            fullPrompt += `\n\nCONVERSION GOAL: ${conversionGoal}`;
        }

        if (targetAudience) {
            fullPrompt += `\nTARGET AUDIENCE: ${targetAudience}`;
        }

        if (this.tokensContext) {
            fullPrompt += `\n\n${this.tokensContext}`;
        }

        return this.execute(fullPrompt);
    }

    /**
     * Analyze existing design for optimization opportunities
     */
    async analyzeForConversion(
        designJson: object,
        metrics?: { ctr?: number; bounceRate?: number; conversionRate?: number }
    ): Promise<AgentOutput> {
        const analysisPrompt = `
ANALYZE THIS DESIGN FOR CONVERSION OPTIMIZATION:

Current Design:
${JSON.stringify(designJson, null, 2)}

${metrics ? `Current Metrics:
- Click-through rate: ${metrics.ctr || 'unknown'}%
- Bounce rate: ${metrics.bounceRate || 'unknown'}%
- Conversion rate: ${metrics.conversionRate || 'unknown'}%` : ''}

Provide:
1. Identified issues with hierarchy and CTA visibility
2. Proposed changes with expected impact
3. A/B variant JSON ready for testing
`;

        return this.execute(analysisPrompt);
    }

    /**
     * Create A/B variant
     */
    async createVariant(
        baseDesign: object,
        hypothesis: string
    ): Promise<AgentOutput> {
        const variantPrompt = `
CREATE A/B VARIANT:

Base Design (Variant A):
${JSON.stringify(baseDesign, null, 2)}

Hypothesis to test: ${hypothesis}

Generate Variant B that tests this hypothesis.
Explain the expected impact in the conversionStrategy field.
`;

        return this.execute(variantPrompt);
    }

    protected getConstraints(): string[] {
        return [
            'Valid JSON output only',
            'Use only provided tokens',
            'Conversion-focused design',
            'WCAG 2.1 AA compliance',
            'Mobile-first responsive',
        ];
    }
}

// ============================================
// FACTORY FUNCTIONS
// ============================================

export function createCOCO(config?: COCOConfig): COCOAgent {
    return new COCOAgent(config);
}

export const coco = new COCOAgent({ mode: 'generate' });
