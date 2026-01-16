/**
 * Cortex Module - Public API
 * Control Orchestration & Real-Time Execution
 */

export {
    Cortex,
    cortex,
    type CortexState,
    type ThinkingStep,
    type ApprovalRequest,
    type ApprovalOption,
    type CortexError,
    type ExecutionPlan,
    type ExecutionStep,
} from './state-machine.js';

export {
    ThinkingTraceUI,
    ElegantLoader,
    renderLatencyIndicator,
} from './thinking-ui.js';

export {
    MultiPlatformCoordinator,
    WORKFLOW_TEMPLATES,
    mockSlackAdapter,
    mockNotionAdapter,
    mockGitHubAdapter,
    mockAnalyticsAdapter,
    type PlatformAdapter,
    type SlackAdapter,
    type NotionAdapter,
    type GitHubAdapter,
    type AnalyticsAdapter,
    type WorkflowTemplate,
} from './coordinator.js';

export {
    DesignPsychologyEngine,
    psychologyEngine,
    PSYCHOLOGY_PROFILES,
    type PsychologyRule,
    type ProductTypeProfile,
} from './psychology-engine.js';
