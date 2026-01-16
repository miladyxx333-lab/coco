/**
 * THINKING TRACE UI
 * Elegant real-time progress display for CLI
 */

import chalk from 'chalk';
import { Cortex, ThinkingStep, ApprovalRequest, CortexError, CortexState } from './state-machine.js';

// ============================================
// VISUAL CONSTANTS
// ============================================

const ICONS = {
    thinking: '◉',
    analyzing: '◈',
    strategizing: '◇',
    designing: '◆',
    validating: '◎',
    awaiting_approval: '⊙',
    executing: '▶',
    recovering: '↻',
    complete: '✓',
    error: '✗',
    idle: '○',
} as const;

const COLORS = {
    thinking: chalk.cyan,
    analyzing: chalk.blue,
    strategizing: chalk.magenta,
    designing: chalk.yellow,
    validating: chalk.cyan,
    awaiting_approval: chalk.yellow.bold,
    executing: chalk.green,
    recovering: chalk.red,
    complete: chalk.green.bold,
    error: chalk.red.bold,
    idle: chalk.gray,
} as const;

const PHASE_LABELS = {
    idle: 'En espera',
    analyzing: 'Analizando',
    strategizing: 'Estrategizando',
    designing: 'Diseñando',
    validating: 'Validando',
    awaiting_approval: 'Esperando aprobación',
    executing: 'Ejecutando',
    recovering: 'Recuperando',
    complete: 'Completo',
    error: 'Error',
} as const;

// ============================================
// THINKING TRACE RENDERER
// ============================================

export class ThinkingTraceUI {
    private cortex: Cortex;
    private lastRender: string = '';
    private isInteractive: boolean;

    constructor(cortex: Cortex, interactive: boolean = true) {
        this.cortex = cortex;
        this.isInteractive = interactive;
        this.attachListeners();
    }

    private attachListeners(): void {
        this.cortex.on('thinking', (step: ThinkingStep) => {
            this.renderThinkingStep(step);
        });

        this.cortex.on('stateChange', ({ from, to }: { from: CortexState; to: CortexState }) => {
            this.renderStateChange(from, to);
        });

        this.cortex.on('approvalRequired', (request: ApprovalRequest) => {
            this.renderApprovalRequest(request);
        });

        this.cortex.on('error', (error: CortexError) => {
            this.renderError(error);
        });

        this.cortex.on('stepStart', (step: { id: string; name: string; surface: string }) => {
            this.renderStepStart(step);
        });

        this.cortex.on('stepComplete', (step: { id: string; name: string }) => {
            this.renderStepComplete(step);
        });
    }

    // ----------------------------------------
    // THINKING STEP RENDER
    // ----------------------------------------

    private renderThinkingStep(step: ThinkingStep): void {
        const icon = ICONS[step.phase] || ICONS.thinking;
        const color = COLORS[step.phase] || COLORS.thinking;

        // Progress bar if available
        let progressBar = '';
        if (step.progress !== undefined) {
            const filled = Math.round(step.progress / 5);
            const empty = 20 - filled;
            progressBar = chalk.gray(' [') +
                chalk.cyan('█'.repeat(filled)) +
                chalk.gray('░'.repeat(empty)) +
                chalk.gray('] ') +
                chalk.dim(`${step.progress}%`);
        }

        // Main message
        const mainLine = color(`${icon} ${step.message}`) + progressBar;

        // Detail line (if present)
        const detailLine = step.detail
            ? chalk.gray(`  └─ ${step.detail}`)
            : '';

        console.log(mainLine);
        if (detailLine) {
            console.log(detailLine);
        }
    }

    // ----------------------------------------
    // STATE CHANGE RENDER
    // ----------------------------------------

    private renderStateChange(from: CortexState, to: CortexState): void {
        const toIcon = ICONS[to] || ICONS.idle;
        const toColor = COLORS[to] || COLORS.idle;
        const toLabel = PHASE_LABELS[to] || to;

        console.log(chalk.dim('─'.repeat(50)));
        console.log(toColor(`${toIcon} Estado: ${toLabel}`));
        console.log(chalk.dim('─'.repeat(50)));
    }

    // ----------------------------------------
    // APPROVAL REQUEST RENDER
    // ----------------------------------------

    private renderApprovalRequest(request: ApprovalRequest): void {
        console.log('\n');
        console.log(chalk.yellow.bold('⊙ APROBACIÓN REQUERIDA'));
        console.log(chalk.dim('═'.repeat(50)));
        console.log(chalk.bold(request.title));
        console.log(chalk.dim(request.description));
        console.log();

        for (const option of request.options) {
            const riskColor = {
                low: chalk.green,
                medium: chalk.yellow,
                high: chalk.red,
            }[option.risk];

            const recommended = option.recommended
                ? chalk.cyan.bold(' ★ RECOMENDADA')
                : '';

            console.log(
                chalk.bold(`  [${option.id}] ${option.label}`) + recommended
            );
            console.log(
                chalk.dim(`      ${option.description}`)
            );
            console.log(
                `      Riesgo: ${riskColor(option.risk)}`
            );
            console.log();
        }

        console.log(chalk.dim('─'.repeat(50)));
        console.log(chalk.yellow('Esperando respuesta...'));
    }

    // ----------------------------------------
    // ERROR RENDER
    // ----------------------------------------

    private renderError(error: CortexError): void {
        console.log('\n');
        console.log(chalk.red.bold('✗ INCONSISTENCIA DETECTADA'));
        console.log(chalk.dim('═'.repeat(50)));
        console.log(chalk.white(error.message));
        console.log();

        if (error.recoverable) {
            console.log(chalk.yellow(`Intento ${error.retryCount}/${error.maxRetries}`));
            console.log();
        }

        console.log(chalk.bold('Acciones sugeridas:'));
        error.suggestedActions.forEach((action, i) => {
            console.log(chalk.dim(`  ${i + 1}. ${action}`));
        });

        console.log(chalk.dim('─'.repeat(50)));

        if (error.technicalDetail) {
            console.log(chalk.dim(`Detalle técnico: ${error.technicalDetail}`));
        }
    }

    // ----------------------------------------
    // STEP RENDERS
    // ----------------------------------------

    private renderStepStart(step: { id: string; name: string; surface: string }): void {
        const surfaceIcon = this.getSurfaceIcon(step.surface);
        console.log(chalk.blue(`▶ ${surfaceIcon} ${step.name}`));
    }

    private renderStepComplete(step: { id: string; name: string }): void {
        console.log(chalk.green(`✓ ${step.name} completado`));
    }

    private getSurfaceIcon(surface: string): string {
        const icons: Record<string, string> = {
            gemini: '🧠',
            figma: '🎨',
            slack: '💬',
            notion: '📝',
            github: '🐙',
            analytics: '📊',
            local: '💾',
        };
        return icons[surface] || '⚙️';
    }

    // ----------------------------------------
    // EXECUTION PLAN RENDER
    // ----------------------------------------

    renderExecutionPlan(): void {
        const plan = this.cortex.getExecutionPlan();
        if (!plan) return;

        console.log('\n');
        console.log(chalk.bold.cyan('╔════════════════════════════════════════════════╗'));
        console.log(chalk.bold.cyan(`║  PLAN DE EJECUCIÓN: ${plan.name.padEnd(26)}║`));
        console.log(chalk.bold.cyan('╠════════════════════════════════════════════════╣'));

        plan.steps.forEach((step, i) => {
            const statusIcon = {
                pending: chalk.gray('○'),
                running: chalk.yellow('◉'),
                complete: chalk.green('✓'),
                failed: chalk.red('✗'),
                skipped: chalk.gray('⊘'),
            }[step.status];

            const surfaceIcon = this.getSurfaceIcon(step.surface);
            const isCurrent = i === plan.currentStep && plan.status === 'running';
            const line = `${statusIcon} ${surfaceIcon} ${step.name}`;

            console.log(
                chalk.cyan('║  ') +
                (isCurrent ? chalk.bold.yellow(line) : line).padEnd(55) +
                chalk.cyan('║')
            );
        });

        console.log(chalk.bold.cyan('╚════════════════════════════════════════════════╝'));
        console.log();
    }
}

// ============================================
// ELEGANT LOADING ANIMATION
// ============================================

export class ElegantLoader {
    private frames: string[] = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    private currentFrame: number = 0;
    private interval: NodeJS.Timeout | null = null;
    private message: string = '';

    start(message: string): void {
        this.message = message;
        this.currentFrame = 0;

        this.interval = setInterval(() => {
            const frame = this.frames[this.currentFrame];
            process.stdout.write(`\r${chalk.cyan(frame)} ${chalk.dim(this.message)}`);
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
        }, 80);
    }

    update(message: string): void {
        this.message = message;
    }

    succeed(message: string): void {
        this.stop();
        console.log(`\r${chalk.green('✓')} ${message}`);
    }

    fail(message: string): void {
        this.stop();
        console.log(`\r${chalk.red('✗')} ${message}`);
    }

    stop(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            process.stdout.write('\r' + ' '.repeat(this.message.length + 10) + '\r');
        }
    }
}

// ============================================
// LATENCY INDICATOR
// ============================================

export function renderLatencyIndicator(durationMs: number): string {
    if (durationMs < 500) {
        return chalk.green('●') + chalk.dim(' <0.5s');
    } else if (durationMs < 2000) {
        return chalk.yellow('●') + chalk.dim(` ${(durationMs / 1000).toFixed(1)}s`);
    } else if (durationMs < 5000) {
        return chalk.yellow('●●') + chalk.dim(` ${(durationMs / 1000).toFixed(1)}s`);
    } else {
        return chalk.red('●●●') + chalk.dim(` ${(durationMs / 1000).toFixed(1)}s`);
    }
}
