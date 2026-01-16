/**
 * MULTI-PLATFORM COORDINATOR
 * Orchestrates actions across Gemini, Figma, Slack, Notion, GitHub, etc.
 */

import { Cortex, ExecutionStep, ExecutionPlan } from './state-machine.js';

// ============================================
// PLATFORM ADAPTERS (Interfaces)
// ============================================

export interface PlatformAdapter {
    name: string;
    surface: ExecutionStep['surface'];
    isConfigured: () => boolean;
    test: () => Promise<boolean>;
}

export interface SlackAdapter extends PlatformAdapter {
    postMessage: (channel: string, message: string, blocks?: unknown[]) => Promise<string>;
    postDesignUpdate: (channel: string, designName: string, previewUrl: string) => Promise<void>;
}

export interface NotionAdapter extends PlatformAdapter {
    createPage: (databaseId: string, properties: Record<string, unknown>) => Promise<string>;
    updatePage: (pageId: string, properties: Record<string, unknown>) => Promise<void>;
    appendBlocks: (pageId: string, blocks: unknown[]) => Promise<void>;
}

export interface GitHubAdapter extends PlatformAdapter {
    createIssue: (repo: string, title: string, body: string, labels?: string[]) => Promise<string>;
    createPR: (repo: string, title: string, branch: string, baseBranch: string) => Promise<string>;
    commitFile: (repo: string, path: string, content: string, message: string) => Promise<void>;
}

export interface AnalyticsAdapter extends PlatformAdapter {
    getConversionMetrics: (viewId: string, dateRange: { start: string; end: string }) => Promise<unknown>;
    getPagePerformance: (pageUrl: string) => Promise<unknown>;
    getHeatmapData: (pageUrl: string) => Promise<unknown>;
}

// ============================================
// WORKFLOW TEMPLATES
// ============================================

export interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    steps: Omit<ExecutionStep, 'status'>[];
    requiredAdapters: ExecutionStep['surface'][];
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
    {
        id: 'full_design_pipeline',
        name: 'Pipeline de Diseño Completo',
        description: 'Investigación → Estrategia → Diseño → Entrega',
        requiredAdapters: ['analytics', 'gemini', 'figma', 'slack'],
        steps: [
            {
                id: 'step_1_research',
                name: 'Análisis de datos de usuario',
                action: 'Obtener métricas de conversión y feedback',
                surface: 'analytics',
                requiresApproval: false,
            },
            {
                id: 'step_2_strategy',
                name: 'Crear User Journey',
                action: 'Generar user journey basado en datos',
                surface: 'gemini',
                requiresApproval: true,
            },
            {
                id: 'step_3_design',
                name: 'Generar wireframes',
                action: 'Crear wireframes usando Design Tokens',
                surface: 'figma',
                requiresApproval: true,
            },
            {
                id: 'step_4_notify',
                name: 'Notificar al equipo',
                action: 'Enviar preview del diseño a Slack',
                surface: 'slack',
                requiresApproval: false,
            },
        ],
    },
    {
        id: 'ab_optimization',
        name: 'Optimización A/B',
        description: 'Análisis → Variante → Deploy',
        requiredAdapters: ['analytics', 'gemini', 'figma'],
        steps: [
            {
                id: 'step_1_analyze',
                name: 'Analizar métricas actuales',
                action: 'Obtener CTR, bounce rate, conversión',
                surface: 'analytics',
                requiresApproval: false,
            },
            {
                id: 'step_2_diagnose',
                name: 'Diagnóstico de conversión',
                action: 'Identificar problemas de UX',
                surface: 'gemini',
                requiresApproval: false,
            },
            {
                id: 'step_3_variant',
                name: 'Generar variante B',
                action: 'Crear diseño alternativo optimizado',
                surface: 'gemini',
                requiresApproval: true,
            },
            {
                id: 'step_4_export',
                name: 'Exportar a Figma',
                action: 'Crear frame con variante B',
                surface: 'figma',
                requiresApproval: false,
            },
        ],
    },
    {
        id: 'code_handoff',
        name: 'Handoff a Desarrollo',
        description: 'Diseño → Código → GitHub',
        requiredAdapters: ['gemini', 'github'],
        steps: [
            {
                id: 'step_1_generate_code',
                name: 'Generar código React',
                action: 'Convertir wireframe a componentes Tailwind',
                surface: 'gemini',
                requiresApproval: false,
            },
            {
                id: 'step_2_commit',
                name: 'Commit a repositorio',
                action: 'Crear branch y commit con componentes',
                surface: 'github',
                requiresApproval: true,
            },
            {
                id: 'step_3_pr',
                name: 'Crear Pull Request',
                action: 'Abrir PR para review',
                surface: 'github',
                requiresApproval: true,
            },
        ],
    },
    {
        id: 'documentation',
        name: 'Documentación Automática',
        description: 'Diseño → Notion → Slack',
        requiredAdapters: ['gemini', 'notion', 'slack'],
        steps: [
            {
                id: 'step_1_generate_docs',
                name: 'Generar especificación',
                action: 'Crear documentación del diseño',
                surface: 'gemini',
                requiresApproval: false,
            },
            {
                id: 'step_2_notion',
                name: 'Publicar en Notion',
                action: 'Crear página con especificación',
                surface: 'notion',
                requiresApproval: false,
            },
            {
                id: 'step_3_notify',
                name: 'Notificar stakeholders',
                action: 'Enviar link de documentación',
                surface: 'slack',
                requiresApproval: false,
            },
        ],
    },
];

// ============================================
// COORDINATOR CLASS
// ============================================

export class MultiPlatformCoordinator {
    private cortex: Cortex;
    private adapters: Map<ExecutionStep['surface'], PlatformAdapter> = new Map();

    constructor(cortex: Cortex) {
        this.cortex = cortex;
    }

    /**
     * Register a platform adapter
     */
    registerAdapter(adapter: PlatformAdapter): void {
        this.adapters.set(adapter.surface, adapter);
        this.cortex.think(
            `Adaptador registrado: ${adapter.name}`,
            adapter.isConfigured() ? 'Configurado' : 'Pendiente de configuración'
        );
    }

    /**
     * Check which adapters are ready
     */
    async checkReadiness(): Promise<Map<ExecutionStep['surface'], boolean>> {
        const status = new Map<ExecutionStep['surface'], boolean>();

        for (const [surface, adapter] of this.adapters) {
            if (adapter.isConfigured()) {
                try {
                    const ok = await adapter.test();
                    status.set(surface, ok);
                } catch {
                    status.set(surface, false);
                }
            } else {
                status.set(surface, false);
            }
        }

        return status;
    }

    /**
     * Get available workflows based on configured adapters
     */
    getAvailableWorkflows(): WorkflowTemplate[] {
        return WORKFLOW_TEMPLATES.filter(workflow => {
            return workflow.requiredAdapters.every(surface => {
                const adapter = this.adapters.get(surface);
                return adapter && adapter.isConfigured();
            });
        });
    }

    /**
     * Execute a workflow
     */
    async executeWorkflow(
        workflowId: string,
        executors: Map<string, () => Promise<unknown>>
    ): Promise<{ success: boolean; results: Map<string, unknown> }> {
        const workflow = WORKFLOW_TEMPLATES.find(w => w.id === workflowId);
        if (!workflow) {
            throw new Error(`Workflow ${workflowId} not found`);
        }

        // Check required adapters
        for (const surface of workflow.requiredAdapters) {
            const adapter = this.adapters.get(surface);
            if (!adapter || !adapter.isConfigured()) {
                throw new Error(`Adapter for ${surface} not configured`);
            }
        }

        this.cortex.think(
            `Iniciando workflow: ${workflow.name}`,
            workflow.description,
            0
        );

        // Create execution plan
        this.cortex.createExecutionPlan(workflow.name, workflow.steps);

        // Execute
        const result = await this.cortex.executePlan(executors);

        return {
            success: result.success,
            results: result.results,
        };
    }
}

// ============================================
// MOCK ADAPTERS (For testing without real APIs)
// ============================================

export const mockSlackAdapter: SlackAdapter = {
    name: 'Slack (Mock)',
    surface: 'slack',
    isConfigured: () => !!process.env.SLACK_BOT_TOKEN,
    test: async () => true,
    postMessage: async (channel, message) => {
        console.log(`[SLACK] #${channel}: ${message}`);
        return 'mock_ts_12345';
    },
    postDesignUpdate: async (channel, designName, previewUrl) => {
        console.log(`[SLACK] #${channel}: New design "${designName}" - ${previewUrl}`);
    },
};

export const mockNotionAdapter: NotionAdapter = {
    name: 'Notion (Mock)',
    surface: 'notion',
    isConfigured: () => !!process.env.NOTION_API_KEY,
    test: async () => true,
    createPage: async (databaseId, properties) => {
        console.log(`[NOTION] Creating page in ${databaseId}`);
        return 'mock_page_id';
    },
    updatePage: async (pageId, properties) => {
        console.log(`[NOTION] Updating page ${pageId}`);
    },
    appendBlocks: async (pageId, blocks) => {
        console.log(`[NOTION] Appending ${blocks.length} blocks to ${pageId}`);
    },
};

export const mockGitHubAdapter: GitHubAdapter = {
    name: 'GitHub (Mock)',
    surface: 'github',
    isConfigured: () => !!process.env.GITHUB_TOKEN,
    test: async () => true,
    createIssue: async (repo, title, body, labels) => {
        console.log(`[GITHUB] Issue in ${repo}: ${title}`);
        return 'https://github.com/mock/issue/1';
    },
    createPR: async (repo, title, branch, baseBranch) => {
        console.log(`[GITHUB] PR in ${repo}: ${branch} -> ${baseBranch}`);
        return 'https://github.com/mock/pr/1';
    },
    commitFile: async (repo, path, content, message) => {
        console.log(`[GITHUB] Commit to ${repo}: ${path} - ${message}`);
    },
};

export const mockAnalyticsAdapter: AnalyticsAdapter = {
    name: 'Analytics (Mock)',
    surface: 'analytics',
    isConfigured: () => !!process.env.ANALYTICS_KEY,
    test: async () => true,
    getConversionMetrics: async (viewId, dateRange) => {
        return {
            conversionRate: 3.2,
            bounceRate: 45.5,
            avgSessionDuration: 180,
        };
    },
    getPagePerformance: async (pageUrl) => {
        return {
            pageviews: 10500,
            uniqueVisitors: 8200,
            avgTimeOnPage: 65,
        };
    },
    getHeatmapData: async (pageUrl) => {
        return {
            clickZones: [
                { element: '#cta-button', clicks: 320 },
                { element: '#nav-pricing', clicks: 180 },
            ],
        };
    },
};
