/**
 * CORTEX - Control Orchestration & Real-Time Execution
 * State management and coordination layer for COCO
 */

import EventEmitter from 'events';

// ============================================
// STATE MACHINE
// ============================================

export type CortexState =
    | 'idle'
    | 'analyzing'
    | 'strategizing'
    | 'designing'
    | 'validating'
    | 'awaiting_approval'
    | 'executing'
    | 'recovering'
    | 'complete'
    | 'error';

export interface ThinkingStep {
    timestamp: string;
    phase: CortexState;
    message: string;
    detail?: string;
    progress?: number; // 0-100
    duration?: number; // ms
}

export interface ApprovalRequest {
    id: string;
    type: 'design_direction' | 'token_usage' | 'destructive_action' | 'external_api';
    title: string;
    description: string;
    options: ApprovalOption[];
    timeout?: number; // ms
    createdAt: string;
}

export interface ApprovalOption {
    id: 'A' | 'B' | 'C' | 'approve' | 'deny' | 'modify';
    label: string;
    description: string;
    risk: 'low' | 'medium' | 'high';
    recommended?: boolean;
}

export interface CortexError {
    code: string;
    message: string;
    recoverable: boolean;
    suggestedActions: string[];
    technicalDetail?: string;
    retryCount: number;
    maxRetries: number;
}

export interface ExecutionPlan {
    id: string;
    name: string;
    steps: ExecutionStep[];
    currentStep: number;
    status: 'pending' | 'running' | 'paused' | 'complete' | 'failed';
    startedAt?: string;
    completedAt?: string;
}

export interface ExecutionStep {
    id: string;
    name: string;
    action: string;
    surface: 'gemini' | 'figma' | 'slack' | 'notion' | 'github' | 'analytics' | 'local';
    status: 'pending' | 'running' | 'complete' | 'failed' | 'skipped';
    output?: unknown;
    error?: CortexError;
    requiresApproval?: boolean;
}

// ============================================
// CORTEX CLASS
// ============================================

export class Cortex extends EventEmitter {
    private state: CortexState = 'idle';
    private thinkingLog: ThinkingStep[] = [];
    private pendingApprovals: Map<string, ApprovalRequest> = new Map();
    private executionPlan: ExecutionPlan | null = null;
    private retryCount: number = 0;
    private maxRetries: number = 3;

    constructor() {
        super();
    }

    // ----------------------------------------
    // STATE MANAGEMENT
    // ----------------------------------------

    getState(): CortexState {
        return this.state;
    }

    private setState(newState: CortexState): void {
        const oldState = this.state;
        this.state = newState;
        this.emit('stateChange', { from: oldState, to: newState });
    }

    // ----------------------------------------
    // THINKING TRACE (Real-time Progress)
    // ----------------------------------------

    think(message: string, detail?: string, progress?: number): void {
        const step: ThinkingStep = {
            timestamp: new Date().toISOString(),
            phase: this.state,
            message,
            detail,
            progress,
        };

        this.thinkingLog.push(step);
        this.emit('thinking', step);
    }

    getThinkingLog(): ThinkingStep[] {
        return [...this.thinkingLog];
    }

    clearThinkingLog(): void {
        this.thinkingLog = [];
    }

    // ----------------------------------------
    // HUMAN-IN-THE-LOOP (Permission System)
    // ----------------------------------------

    async requestApproval(request: Omit<ApprovalRequest, 'id' | 'createdAt'>): Promise<ApprovalOption> {
        const approval: ApprovalRequest = {
            ...request,
            id: `approval_${Date.now()}`,
            createdAt: new Date().toISOString(),
        };

        this.pendingApprovals.set(approval.id, approval);
        this.setState('awaiting_approval');
        this.emit('approvalRequired', approval);

        // Wait for response
        return new Promise((resolve, reject) => {
            const timeout = request.timeout || 60000; // Default 60s

            const timer = setTimeout(() => {
                this.pendingApprovals.delete(approval.id);
                reject(new Error('Approval timeout'));
            }, timeout);

            this.once(`approval_${approval.id}`, (response: ApprovalOption) => {
                clearTimeout(timer);
                this.pendingApprovals.delete(approval.id);
                this.setState('executing');
                resolve(response);
            });
        });
    }

    respondToApproval(approvalId: string, response: ApprovalOption): void {
        if (this.pendingApprovals.has(approvalId)) {
            this.emit(`approval_${approvalId}`, response);
        }
    }

    getPendingApprovals(): ApprovalRequest[] {
        return Array.from(this.pendingApprovals.values());
    }

    // ----------------------------------------
    // DESIGN DIRECTION OPTIONS
    // ----------------------------------------

    createDesignDirectionRequest(
        context: string
    ): Omit<ApprovalRequest, 'id' | 'createdAt'> {
        return {
            type: 'design_direction',
            title: 'Selecciona la dirección de diseño',
            description: context,
            options: [
                {
                    id: 'A',
                    label: 'Conservadora',
                    description: 'Basada estrictamente en los tokens actuales. Mínimo riesgo.',
                    risk: 'low',
                },
                {
                    id: 'B',
                    label: 'Exploratoria',
                    description: 'Propone nuevas variables de diseño. Balance riesgo/innovación.',
                    risk: 'medium',
                    recommended: true,
                },
                {
                    id: 'C',
                    label: 'Optimizada',
                    description: 'Basada en datos de conversión de competidores. Mayor potencial.',
                    risk: 'high',
                },
            ],
        };
    }

    // ----------------------------------------
    // ERROR HANDLING & SELF-HEALING
    // ----------------------------------------

    async handleError(error: Error, context: string): Promise<CortexError> {
        this.retryCount++;

        const cortexError: CortexError = {
            code: this.categorizeError(error),
            message: this.humanizeError(error, context),
            recoverable: this.isRecoverable(error),
            suggestedActions: this.getSuggestedActions(error),
            technicalDetail: error.message,
            retryCount: this.retryCount,
            maxRetries: this.maxRetries,
        };

        this.setState('recovering');
        this.emit('error', cortexError);

        return cortexError;
    }

    private categorizeError(error: Error): string {
        const message = error.message.toLowerCase();

        if (message.includes('json') || message.includes('parse')) {
            return 'INVALID_JSON';
        }
        if (message.includes('api') || message.includes('fetch') || message.includes('network')) {
            return 'API_ERROR';
        }
        if (message.includes('figma')) {
            return 'FIGMA_ERROR';
        }
        if (message.includes('token') || message.includes('auth')) {
            return 'AUTH_ERROR';
        }
        if (message.includes('rate') || message.includes('limit')) {
            return 'RATE_LIMIT';
        }
        return 'UNKNOWN_ERROR';
    }

    private humanizeError(error: Error, context: string): string {
        const code = this.categorizeError(error);

        const messages: Record<string, string> = {
            'INVALID_JSON': `He encontrado una inconsistencia en la estructura del diseño generado para "${context}". El formato no es válido para la API de Figma.`,
            'API_ERROR': `He perdido conexión con el servicio externo mientras procesaba "${context}". Esto suele ser temporal.`,
            'FIGMA_ERROR': `He encontrado un problema con la jerarquía de capas en el archivo de Figma. Puede haber conflictos con elementos existentes.`,
            'AUTH_ERROR': `No tengo permisos suficientes para completar esta acción. Verifica las credenciales de acceso.`,
            'RATE_LIMIT': `He alcanzado el límite de peticiones del servicio. Necesito esperar unos segundos antes de continuar.`,
            'UNKNOWN_ERROR': `He encontrado un problema inesperado mientras trabajaba en "${context}".`,
        };

        return messages[code] || messages['UNKNOWN_ERROR'];
    }

    private isRecoverable(error: Error): boolean {
        const code = this.categorizeError(error);
        const recoverableCodes = ['INVALID_JSON', 'API_ERROR', 'RATE_LIMIT'];
        return recoverableCodes.includes(code) && this.retryCount < this.maxRetries;
    }

    private getSuggestedActions(error: Error): string[] {
        const code = this.categorizeError(error);

        const actions: Record<string, string[]> = {
            'INVALID_JSON': [
                'Intentar regenerar el diseño automáticamente',
                'Simplificar la solicitud y reintentar',
                'Crear un nuevo Frame desde cero',
            ],
            'API_ERROR': [
                'Reintentar la conexión automáticamente',
                'Continuar sin esta funcionalidad',
                'Guardar el progreso y pausar',
            ],
            'FIGMA_ERROR': [
                'Intentar reparar la jerarquía de capas',
                'Crear un nuevo Frame limpio',
                'Exportar el diseño a un archivo separado',
            ],
            'AUTH_ERROR': [
                'Verificar y actualizar credenciales',
                'Continuar con funcionalidad limitada',
            ],
            'RATE_LIMIT': [
                'Esperar 30 segundos y reintentar',
                'Reducir la complejidad de la solicitud',
                'Pausar y continuar más tarde',
            ],
            'UNKNOWN_ERROR': [
                'Reintentar la operación',
                'Guardar el progreso actual',
                'Reportar el problema',
            ],
        };

        return actions[code] || actions['UNKNOWN_ERROR'];
    }

    canRetry(): boolean {
        return this.retryCount < this.maxRetries;
    }

    resetRetryCount(): void {
        this.retryCount = 0;
    }

    // ----------------------------------------
    // SELF-HEALING JSON VALIDATION
    // ----------------------------------------

    async validateAndHeal<T>(
        jsonString: string,
        validator: (data: unknown) => { valid: boolean; errors?: string[] },
        healingPrompt: (errors: string[]) => Promise<string>
    ): Promise<{ data: T; healed: boolean; attempts: number }> {
        let attempts = 0;
        let currentJson = jsonString;

        while (attempts < this.maxRetries) {
            attempts++;

            try {
                const parsed = JSON.parse(currentJson);
                const validation = validator(parsed);

                if (validation.valid) {
                    return { data: parsed as T, healed: attempts > 1, attempts };
                }

                // Attempt self-healing
                this.think(
                    `Detectada inconsistencia en la estructura (intento ${attempts}/${this.maxRetries})`,
                    validation.errors?.join(', '),
                    (attempts / this.maxRetries) * 100
                );

                currentJson = await healingPrompt(validation.errors || []);

            } catch (parseError) {
                this.think(
                    'JSON inválido detectado, intentando reparar...',
                    (parseError as Error).message,
                    (attempts / this.maxRetries) * 100
                );

                // Try to extract JSON from malformed response
                const jsonMatch = currentJson.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    currentJson = jsonMatch[0];
                } else {
                    currentJson = await healingPrompt(['Invalid JSON structure']);
                }
            }
        }

        throw new Error('Unable to heal JSON after maximum attempts');
    }

    // ----------------------------------------
    // MULTI-STEP EXECUTION
    // ----------------------------------------

    createExecutionPlan(name: string, steps: Omit<ExecutionStep, 'status'>[]): ExecutionPlan {
        const plan: ExecutionPlan = {
            id: `plan_${Date.now()}`,
            name,
            steps: steps.map(s => ({ ...s, status: 'pending' as const })),
            currentStep: 0,
            status: 'pending',
        };

        this.executionPlan = plan;
        this.emit('planCreated', plan);

        return plan;
    }

    async executeStep(
        stepId: string,
        executor: () => Promise<unknown>
    ): Promise<unknown> {
        if (!this.executionPlan) {
            throw new Error('No execution plan active');
        }

        const step = this.executionPlan.steps.find(s => s.id === stepId);
        if (!step) {
            throw new Error(`Step ${stepId} not found`);
        }

        step.status = 'running';
        this.setState('executing');
        this.emit('stepStart', step);

        try {
            // Check if approval required
            if (step.requiresApproval) {
                const approval = await this.requestApproval({
                    type: 'external_api',
                    title: `Permiso requerido: ${step.name}`,
                    description: `COCO necesita ejecutar: ${step.action} en ${step.surface}`,
                    options: [
                        { id: 'approve', label: 'Aprobar', description: 'Ejecutar esta acción', risk: 'low', recommended: true },
                        { id: 'deny', label: 'Denegar', description: 'Saltar este paso', risk: 'low' },
                    ],
                });

                if (approval.id === 'deny') {
                    step.status = 'skipped';
                    this.emit('stepSkipped', step);
                    return null;
                }
            }

            const result = await executor();
            step.status = 'complete';
            step.output = result;
            this.emit('stepComplete', step);

            return result;

        } catch (error) {
            const cortexError = await this.handleError(error as Error, step.name);
            step.status = 'failed';
            step.error = cortexError;
            this.emit('stepFailed', { step, error: cortexError });

            throw cortexError;
        }
    }

    async executePlan(
        executors: Map<string, () => Promise<unknown>>
    ): Promise<{ success: boolean; results: Map<string, unknown>; errors: CortexError[] }> {
        if (!this.executionPlan) {
            throw new Error('No execution plan active');
        }

        this.executionPlan.status = 'running';
        this.executionPlan.startedAt = new Date().toISOString();

        const results = new Map<string, unknown>();
        const errors: CortexError[] = [];

        for (const step of this.executionPlan.steps) {
            const executor = executors.get(step.id);

            if (!executor) {
                step.status = 'skipped';
                continue;
            }

            try {
                const result = await this.executeStep(step.id, executor);
                if (result !== null) {
                    results.set(step.id, result);
                }
                this.executionPlan.currentStep++;

            } catch (error) {
                errors.push(error as CortexError);

                // Check if we should continue
                if (!(error as CortexError).recoverable) {
                    this.executionPlan.status = 'failed';
                    return { success: false, results, errors };
                }
            }
        }

        this.executionPlan.status = 'complete';
        this.executionPlan.completedAt = new Date().toISOString();
        this.setState('complete');

        return { success: errors.length === 0, results, errors };
    }

    getExecutionPlan(): ExecutionPlan | null {
        return this.executionPlan ? { ...this.executionPlan } : null;
    }

    // ----------------------------------------
    // CLEANUP
    // ----------------------------------------

    reset(): void {
        this.state = 'idle';
        this.thinkingLog = [];
        this.pendingApprovals.clear();
        this.executionPlan = null;
        this.retryCount = 0;
        this.emit('reset');
    }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const cortex = new Cortex();
