#!/usr/bin/env node
/**
 * GEMINI PRODUCT BRAIN - CLI Interface
 * Keyboard-first interface for multi-agent orchestration
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import Table from 'cli-table3';
import boxen from 'boxen';
import { createOrchestrator } from '../agents/orchestrator.js';
import { uxStrategist } from '../agents/ux-strategist.js';
import { uiArchitect } from '../agents/ui-architect.js';
import { contentWriter } from '../agents/content-writer.js';
import { wireframeArchitect } from '../agents/wireframe-architect.js';
import { validateConfig, printConfig } from '../core/config.js';
import { validateWireframe, type WireframeDocument } from '../figma/wireframe-schema.js';
import { createFigmaConnector } from '../figma/figma-connector.js';
import { tailwindGenerator } from '../figma/tailwind-generator.js';
import type { ProductBrief, AgentRole, AgentOutput, DesignTokenSet } from '../core/types.js';
import { writeFileSync } from 'fs';

const program = new Command();

// ASCII Art Banner
const banner = `
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ██████╗ ██████╗ ██████╗     ██████╗ ██████╗  █████╗ ██╗███╗ ║
║  ██╔════╝ ██╔══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗██║████╗║
║  ██║  ███╗██████╔╝██████╔╝    ██████╔╝██████╔╝███████║██║██║██║
║  ██║   ██║██╔═══╝ ██╔══██╗    ██╔══██╗██╔══██╗██╔══██║██║██║██║
║  ╚██████╔╝██║     ██████╔╝    ██████╔╝██║  ██║██║  ██║██║██║██║
║   ╚═════╝ ╚═╝     ╚═════╝     ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝╚═╝
║                                                               ║
║            Gemini Product Brain v1.0.0                        ║
║            Multi-Agent Design Orchestration                   ║
╚═══════════════════════════════════════════════════════════════╝
`;

function printBanner(): void {
    console.log(chalk.cyan(banner));
}

function printStatus(status: string, color: 'green' | 'yellow' | 'red' | 'blue' = 'blue'): void {
    const colors = {
        green: chalk.green,
        yellow: chalk.yellow,
        red: chalk.red,
        blue: chalk.blue,
    };
    console.log(colors[color](`[STATUS: ${status}]`));
}

function printAgentOutput(output: AgentOutput): void {
    console.log('\n' + boxen(
        chalk.bold(`Agent: ${output.agentRole.toUpperCase()}`) + '\n\n' +
        chalk.dim('Thinking:') + '\n' + output.thinking.slice(0, 200) + '...\n\n' +
        chalk.dim('Decision:') + '\n' + output.decision.slice(0, 300) + '\n\n' +
        chalk.dim(`Confidence: ${(output.confidence * 100).toFixed(0)}%`) + '\n' +
        chalk.dim(`Artifacts: ${output.artifacts.length}`),
        {
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: 'cyan',
        }
    ));
}

function printTokensSummary(tokens: DesignTokenSet): void {
    const table = new Table({
        head: [chalk.cyan('Token Type'), chalk.cyan('Count')],
        style: { head: [], border: [] },
    });

    if (tokens.colors) table.push(['Colors', Object.keys(tokens.colors).length]);
    if (tokens.spacing) table.push(['Spacing', Object.keys(tokens.spacing).length]);
    if (tokens.typography) table.push(['Typography', Object.keys(tokens.typography).length]);
    if (tokens.shadows) table.push(['Shadows', Object.keys(tokens.shadows).length]);
    if (tokens.borderRadius) table.push(['Border Radius', Object.keys(tokens.borderRadius).length]);

    console.log('\n' + chalk.bold('Generated Design Tokens:'));
    console.log(table.toString());
}

program
    .name('gpb')
    .description('Gemini Product Brain - Multi-Agent Design Orchestration')
    .version('1.0.0');

// Main orchestrate command
program
    .command('orchestrate')
    .alias('run')
    .description('Run the full multi-agent orchestration pipeline')
    .option('-i, --interactive', 'Interactive mode with prompts')
    .option('-p, --product <name>', 'Product name')
    .option('-d, --description <text>', 'Product description')
    .option('-a, --audience <target>', 'Target audience')
    .option('-v, --voice <type>', 'Brand voice: formal|casual|playful|technical|luxury')
    .option('--verbose', 'Verbose output')
    .action(async (options) => {
        printBanner();
        printStatus('ANALYZING');

        // Validate config first
        const configCheck = validateConfig();
        if (!configCheck.valid) {
            console.log(chalk.red('\n❌ Configuration Error:'));
            configCheck.errors.forEach(e => console.log(chalk.red(`   • ${e}`)));
            console.log(chalk.yellow('\n💡 Run: cp .env.example .env && edit .env'));
            process.exit(1);
        }

        let brief: ProductBrief;

        if (options.interactive) {
            // Interactive mode
            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'productName',
                    message: 'Product name:',
                    default: 'My Product',
                },
                {
                    type: 'input',
                    name: 'description',
                    message: 'Brief description:',
                    default: 'A modern web application',
                },
                {
                    type: 'input',
                    name: 'targetAudience',
                    message: 'Target audience:',
                    default: 'Tech-savvy professionals aged 25-45',
                },
                {
                    type: 'list',
                    name: 'brandVoice',
                    message: 'Brand voice:',
                    choices: ['formal', 'casual', 'playful', 'technical', 'luxury'],
                    default: 'casual',
                },
                {
                    type: 'input',
                    name: 'colorPreferences',
                    message: 'Color preferences (comma-separated, optional):',
                },
            ]);

            brief = {
                productName: answers.productName,
                description: answers.description,
                targetAudience: answers.targetAudience,
                brandVoice: answers.brandVoice,
                colorPreferences: answers.colorPreferences ? answers.colorPreferences.split(',').map((c: string) => c.trim()) : undefined,
            };
        } else {
            // CLI args mode
            brief = {
                productName: options.product || 'Demo Product',
                description: options.description || 'A modern SaaS application',
                targetAudience: options.audience || 'Tech professionals',
                brandVoice: options.voice || 'casual',
            };
        }

        console.log('\n' + chalk.dim('─'.repeat(60)));
        console.log(chalk.bold('\n📋 Product Brief:'));
        console.log(chalk.dim(`   Product: ${brief.productName}`));
        console.log(chalk.dim(`   Audience: ${brief.targetAudience}`));
        console.log(chalk.dim(`   Voice: ${brief.brandVoice}`));
        console.log(chalk.dim('─'.repeat(60)) + '\n');

        printStatus('EXECUTING', 'yellow');

        const orchestrator = createOrchestrator({
            verbose: options.verbose,
            onStageStart: (stage) => {
                console.log(chalk.blue(`\n▶ Starting agent: ${stage.agent}`));
            },
            onStageComplete: (stage, output) => {
                console.log(chalk.green(`✓ ${stage.agent} complete (${(output.confidence * 100).toFixed(0)}% confidence)`));
            },
            onError: (error, stage) => {
                console.log(chalk.red(`✗ ${stage.agent} failed: ${error.message}`));
            },
        });

        const spinner = ora('Orchestrating agents...').start();

        try {
            const result = await orchestrator.execute(brief);
            spinner.stop();

            printStatus('COMPLETE', 'green');

            // Print each agent output
            for (const output of result.outputs) {
                printAgentOutput(output);
            }

            // Print tokens summary
            printTokensSummary(result.finalTokens);

            // Print metrics
            console.log('\n' + chalk.bold('📊 Metrics:'));
            const metricsTable = new Table({
                style: { head: [], border: [] },
            });
            metricsTable.push(
                ['Duration', `${result.metrics.totalDurationMs}ms`],
                ['Agent Calls', result.metrics.agentCalls],
                ['Tokens Generated', result.metrics.tokenCount],
                ['Validation', result.metrics.validationPassed ? '✓ Passed' : '✗ Failed']
            );
            console.log(metricsTable.toString());

            // Output JSON to stdout for piping
            if (!options.verbose) {
                console.log('\n' + chalk.dim('─'.repeat(60)));
                console.log(chalk.bold('\n📦 Final Tokens (copy/paste ready):'));
                console.log(chalk.dim('─'.repeat(60)));
                console.log(JSON.stringify(result.finalTokens, null, 2));
            }

        } catch (error) {
            spinner.stop();
            printStatus('ERROR', 'red');
            console.log(chalk.red(`\n❌ Error: ${(error as Error).message}`));
            if (options.verbose) {
                console.log(chalk.dim((error as Error).stack));
            }
            process.exit(1);
        }
    });

// Single agent command
program
    .command('agent <role>')
    .description('Run a single agent (ux-strategist | ui-architect | content-writer)')
    .argument('<objective>', 'The objective for the agent')
    .option('--json', 'Output only JSON')
    .action(async (role: string, objective: string, options) => {
        printBanner();

        const configCheck = validateConfig();
        if (!configCheck.valid) {
            console.log(chalk.red('❌ Missing GEMINI_API_KEY'));
            process.exit(1);
        }

        const agents: Record<string, { execute: (objective: string, previous?: AgentOutput[]) => Promise<AgentOutput> }> = {
            'ux-strategist': uxStrategist,
            'ui-architect': uiArchitect,
            'content-writer': contentWriter,
            'wireframe': wireframeArchitect,
        };

        const agent = agents[role];
        if (!agent) {
            console.log(chalk.red(`❌ Unknown agent: ${role}`));
            console.log(chalk.dim('Available: ux-strategist, ui-architect, content-writer, wireframe'));
            process.exit(1);
        }

        const spinner = ora(`Running ${role}...`).start();

        try {
            const output = await agent.execute(objective);
            spinner.stop();

            if (options.json) {
                // Output only JSON artifacts
                for (const artifact of output.artifacts) {
                    if (artifact.type === 'json') {
                        console.log(artifact.content);
                    }
                }
            } else {
                printAgentOutput(output);
            }
        } catch (error) {
            spinner.stop();
            console.log(chalk.red(`❌ Error: ${(error as Error).message}`));
            process.exit(1);
        }
    });

// COCO Command - Component Orchestration & Creative Operations
program
    .command('coco')
    .description('🧠 COCO - High-performance Product Design engine')
    .argument('<prompt>', 'Design brief or requirement')
    .option('-e, --essence <name>', 'Load essence pack (luxury-gold, fintech-trust, neon-cyber)')
    .option('-t, --tokens <path>', 'Path to custom design tokens JSON')
    .option('-g, --goal <objective>', 'Conversion goal (e.g., "increase signups")')
    .option('-a, --audience <target>', 'Target audience')
    .option('--analyze <design>', 'Analyze existing design JSON for optimization')
    .option('--figma', 'Generate Figma plugin code')
    .option('--tailwind', 'Generate Tailwind React component')
    .option('-o, --output <path>', 'Output directory', './output')
    .action(async (prompt: string, options) => {
        printBanner();
        console.log(chalk.cyan.bold('\n🧠 COCO v1.0 - Component Orchestration & Creative Operations\n'));
        printStatus('ANALYZING');

        const configCheck = validateConfig();
        if (!configCheck.valid) {
            console.log(chalk.red('❌ Missing GEMINI_API_KEY'));
            process.exit(1);
        }

        // Show loaded configuration
        console.log(chalk.dim('Configuration:'));
        if (options.essence) {
            console.log(chalk.dim(`  Essence: ${options.essence}`));
        }
        if (options.tokens) {
            console.log(chalk.dim(`  Tokens: ${options.tokens}`));
        }
        if (options.goal) {
            console.log(chalk.dim(`  Goal: ${options.goal}`));
        }
        if (options.audience) {
            console.log(chalk.dim(`  Audience: ${options.audience}`));
        }

        console.log(chalk.dim(`\n📋 Brief: "${prompt}"\n`));

        const spinner = ora('COCO is designing...').start();

        try {
            // Dynamic import
            const { COCOAgent } = await import('../agents/coco-agent.js');
            const { createFigmaConnector } = await import('../figma/figma-connector.js');
            const { tailwindGenerator } = await import('../figma/tailwind-generator.js');

            // Create COCO instance with configuration
            const coco = new COCOAgent({
                mode: options.analyze ? 'analyze' : 'generate',
                tokensPath: options.tokens,
                essence: options.essence,
            });

            // Load essence if specified
            if (options.essence) {
                spinner.text = `Loading ${options.essence} essence...`;
                coco.loadEssence(options.essence);
            }

            spinner.text = 'COCO is architecting your design...';

            // Execute COCO
            const output = await coco.generate(prompt, options.goal, options.audience);
            spinner.stop();

            printStatus('COMPLETE', 'green');

            // Display confidence and summary
            console.log(chalk.bold(`\n📊 Confidence: ${(output.confidence * 100).toFixed(0)}%`));

            // Extract JSON from output
            let designJson = null;
            for (const artifact of output.artifacts) {
                if (artifact.type === 'json') {
                    try {
                        designJson = JSON.parse(artifact.content);
                        break;
                    } catch {
                        continue;
                    }
                }
            }

            if (designJson) {
                // Summary table
                const nodeCount = designJson.nodes?.length || 0;
                const summaryTable = new Table({
                    head: [chalk.cyan('Property'), chalk.cyan('Value')],
                    style: { head: [], border: [] },
                });
                summaryTable.push(
                    ['Project', designJson.metadata?.project || 'Design'],
                    ['Device', designJson.layout?.device || 'desktop'],
                    ['Nodes', nodeCount],
                    ['Objective', designJson.metadata?.objective || 'N/A']
                );
                console.log('\n' + summaryTable.toString());

                // Show conversion strategy if present
                if (designJson.conversionStrategy) {
                    console.log('\n' + chalk.bold('🎯 Conversion Strategy:'));
                    console.log(chalk.dim(`   Primary CTA: ${designJson.conversionStrategy.primaryCTA?.nodeId || 'N/A'}`));
                    console.log(chalk.dim(`   Expected CTR: ${designJson.conversionStrategy.primaryCTA?.expectedCTR || 'N/A'}`));
                }

                // Output JSON
                console.log('\n' + chalk.bold('📦 COCO Output:'));
                console.log(chalk.dim('─'.repeat(60)));
                console.log(JSON.stringify(designJson, null, 2));

                // Generate additional outputs
                if (options.figma) {
                    console.log('\n' + chalk.bold('🎨 Figma Plugin Code:'));
                    console.log(chalk.dim('─'.repeat(60)));
                    // Convert COCO format to wireframe format for Figma
                    const wireframeFormat = {
                        document: {
                            name: designJson.metadata?.project || 'COCO Design',
                            pages: [{
                                id: 'page_1',
                                name: 'Desktop',
                                type: 'desktop' as const,
                                viewport: designJson.layout?.viewport || { width: 1440, height: 900 },
                                backgroundColor: '#FFFFFF',
                                nodes: designJson.nodes || []
                            }]
                        },
                        $metadata: {
                            generatedBy: 'wireframe-agent' as const,
                            timestamp: new Date().toISOString(),
                            version: '1.0.0',
                            prompt: prompt
                        }
                    };
                    const figmaConnector = createFigmaConnector();
                    console.log(figmaConnector.generatePluginCode(wireframeFormat as import('../figma/wireframe-schema.js').WireframeDocument));
                }

                if (options.tailwind) {
                    console.log('\n' + chalk.bold('⚡ Tailwind Component:'));
                    console.log(chalk.dim('─'.repeat(60)));
                    // Similar conversion for Tailwind
                    const wireframeFormat = {
                        document: {
                            name: designJson.metadata?.project || 'COCO Design',
                            description: designJson.metadata?.objective,
                            pages: [{
                                id: 'page_1',
                                name: 'Desktop',
                                type: 'desktop' as const,
                                viewport: designJson.layout?.viewport || { width: 1440, height: 900 },
                                backgroundColor: '#FFFFFF',
                                nodes: designJson.nodes || []
                            }]
                        },
                        $metadata: {
                            generatedBy: 'wireframe-agent' as const,
                            timestamp: new Date().toISOString(),
                            version: '1.0.0',
                            prompt: prompt
                        }
                    };
                    console.log(tailwindGenerator.generateReactComponent(wireframeFormat as import('../figma/wireframe-schema.js').WireframeDocument));
                }
            } else {
                // Show thinking/decision if no JSON
                console.log('\n' + chalk.bold('💭 COCO Response:'));
                console.log(output.decision);
            }

        } catch (error) {
            spinner.stop();
            printStatus('ERROR', 'red');
            console.log(chalk.red(`\n❌ Error: ${(error as Error).message}`));
            process.exit(1);
        }
    });

// Wireframe generation command
program
    .command('wireframe')
    .alias('wf')
    .description('Generate a wireframe and export to Figma/Tailwind')
    .argument('<prompt>', 'Description of the wireframe to generate')
    .option('-o, --output <path>', 'Output directory for generated files', './output')
    .option('--figma', 'Generate Figma plugin code')
    .option('--tailwind', 'Generate Tailwind React component')
    .option('--json', 'Output raw wireframe JSON')
    .action(async (prompt: string, options) => {
        printBanner();
        printStatus('ANALYZING');

        const configCheck = validateConfig();
        if (!configCheck.valid) {
            console.log(chalk.red('❌ Missing GEMINI_API_KEY'));
            process.exit(1);
        }

        console.log(chalk.dim('\n📐 Generating wireframe for:'));
        console.log(chalk.bold(`   "${prompt}"\n`));

        const spinner = ora('Wireframe Architect is drawing...').start();

        try {
            const output = await wireframeArchitect.execute(prompt);
            spinner.stop();

            // Extract wireframe JSON from artifacts
            let wireframeData: WireframeDocument | null = null;
            for (const artifact of output.artifacts) {
                if (artifact.type === 'json') {
                    try {
                        wireframeData = JSON.parse(artifact.content) as WireframeDocument;
                        break;
                    } catch {
                        continue;
                    }
                }
            }

            if (!wireframeData) {
                console.log(chalk.red('❌ No valid wireframe JSON generated'));
                console.log(chalk.dim('Agent output:'));
                console.log(output.decision);
                process.exit(1);
            }

            // Validate wireframe
            const validation = validateWireframe(wireframeData);
            if (!validation.valid) {
                console.log(chalk.yellow('⚠ Wireframe validation warnings:'));
                validation.errors?.forEach(e => console.log(chalk.yellow(`  • ${e}`)));
            }

            printStatus('COMPLETE', 'green');

            // Summary table
            const summaryTable = new Table({
                head: [chalk.cyan('Property'), chalk.cyan('Value')],
                style: { head: [], border: [] },
            });
            summaryTable.push(
                ['Document', wireframeData.document?.name || 'Wireframe'],
                ['Pages', wireframeData.document?.pages?.length || 0],
                ['Total Nodes', countNodes(wireframeData)],
                ['Design Tokens', wireframeData.designTokens ? 'Included' : 'None']
            );
            console.log('\n' + summaryTable.toString());

            // Output based on flags
            if (options.json) {
                console.log('\n' + chalk.bold('📦 Wireframe JSON:'));
                console.log(chalk.dim('─'.repeat(60)));
                console.log(JSON.stringify(wireframeData, null, 2));
            }

            if (options.figma) {
                console.log('\n' + chalk.bold('🎨 Figma Plugin Code:'));
                console.log(chalk.dim('─'.repeat(60)));
                const figmaConnector = createFigmaConnector();
                const pluginCode = figmaConnector.generatePluginCode(wireframeData);
                console.log(pluginCode);

                // Save to file
                const figmaPath = `${options.output}/figma-plugin.js`;
                try {
                    writeFileSync(figmaPath, pluginCode);
                    console.log(chalk.green(`\n✓ Saved to ${figmaPath}`));
                } catch {
                    console.log(chalk.yellow(`\n⚠ Could not save to ${figmaPath}`));
                }
            }

            if (options.tailwind) {
                console.log('\n' + chalk.bold('⚡ Tailwind React Component:'));
                console.log(chalk.dim('─'.repeat(60)));
                const reactCode = tailwindGenerator.generateReactComponent(wireframeData);
                console.log(reactCode);

                // Save to file
                const tailwindPath = `${options.output}/wireframe-component.tsx`;
                try {
                    writeFileSync(tailwindPath, reactCode);
                    console.log(chalk.green(`\n✓ Saved to ${tailwindPath}`));
                } catch {
                    console.log(chalk.yellow(`\n⚠ Could not save to ${tailwindPath}`));
                }

                // CSS variables
                const cssPath = `${options.output}/design-tokens.css`;
                const cssVars = tailwindGenerator.generateCSSVariables(wireframeData);
                try {
                    writeFileSync(cssPath, cssVars);
                    console.log(chalk.green(`✓ Saved CSS variables to ${cssPath}`));
                } catch {
                    console.log(chalk.yellow(`⚠ Could not save to ${cssPath}`));
                }
            }

            if (!options.json && !options.figma && !options.tailwind) {
                // Default: show summary and JSON
                console.log('\n' + chalk.bold('📦 Wireframe JSON (copy/paste ready):'));
                console.log(chalk.dim('─'.repeat(60)));
                console.log(JSON.stringify(wireframeData, null, 2));
                console.log(chalk.dim('\n💡 Use --figma or --tailwind to generate code'));
            }

        } catch (error) {
            spinner.stop();
            printStatus('ERROR', 'red');
            console.log(chalk.red(`❌ Error: ${(error as Error).message}`));
            process.exit(1);
        }
    });

// Helper function to count nodes
function countNodes(wireframe: WireframeDocument): number {
    let count = 0;
    function traverse(nodes: unknown[]) {
        for (const node of nodes) {
            count++;
            if ((node as { children?: unknown[] }).children) {
                traverse((node as { children: unknown[] }).children);
            }
        }
    }
    if (wireframe.document?.pages) {
        for (const page of wireframe.document.pages) {
            if (page.nodes) {
                traverse(page.nodes);
            }
        }
    }
    return count;
}

// Theme generation command
program
    .command('theme')
    .description('Generate design tokens from theme presets')
    .argument('[preset]', 'Theme preset name (modern-saas, dark-tech, fintech, ecommerce, luxury, material-you)')
    .option('--list', 'List all available presets')
    .option('--css', 'Output CSS custom properties')
    .option('--tailwind', 'Output Tailwind config')
    .option('--figma', 'Output Figma variables JSON')
    .action(async (preset: string | undefined, options) => {
        // Dynamic import to avoid loading tokens unless needed
        const { THEME_PRESETS, themeToCSS, themeToTailwindConfig, themeToFigmaVariables } = await import('../tokens/theme-generator.js');
        const { getAllDesignSystems } = await import('../tokens/design-systems.js');

        printBanner();

        if (options.list || !preset) {
            console.log(chalk.bold('\n🎨 Available Theme Presets:\n'));

            const table = new Table({
                head: [chalk.cyan('Preset'), chalk.cyan('Style'), chalk.cyan('Description')],
                style: { head: [], border: [] },
            });

            for (const [key, theme] of Object.entries(THEME_PRESETS)) {
                table.push([key, theme.style, theme.description]);
            }

            console.log(table.toString());

            console.log(chalk.bold('\n📚 Design Systems Available:\n'));
            const systems = getAllDesignSystems();
            systems.forEach(s => console.log(`  • ${s}`));

            console.log(chalk.dim('\n💡 Usage: npm run dev theme modern-saas --css'));
            return;
        }

        const theme = THEME_PRESETS[preset as keyof typeof THEME_PRESETS];
        if (!theme) {
            console.log(chalk.red(`❌ Unknown preset: ${preset}`));
            console.log(chalk.dim('Run "npm run dev theme --list" to see available presets'));
            process.exit(1);
        }

        console.log(chalk.bold(`\n🎨 Theme: ${theme.name}`));
        console.log(chalk.dim(`   Style: ${theme.style}`));
        console.log(chalk.dim(`   Base: ${theme.baseSystem}\n`));

        // Color preview table
        const colorTable = new Table({
            head: [chalk.cyan('Token'), chalk.cyan('Value')],
            style: { head: [], border: [] },
        });

        for (const [name, value] of Object.entries(theme.colors)) {
            colorTable.push([name, value]);
        }
        console.log(colorTable.toString());

        // Output based on flags
        if (options.css) {
            console.log('\n' + chalk.bold('📦 CSS Custom Properties:'));
            console.log(chalk.dim('─'.repeat(60)));
            console.log(themeToCSS(theme));
        }

        if (options.tailwind) {
            console.log('\n' + chalk.bold('⚡ Tailwind Config:'));
            console.log(chalk.dim('─'.repeat(60)));
            console.log(themeToTailwindConfig(theme));
        }

        if (options.figma) {
            console.log('\n' + chalk.bold('🎨 Figma Variables:'));
            console.log(chalk.dim('─'.repeat(60)));
            console.log(JSON.stringify(themeToFigmaVariables(theme), null, 2));
        }

        if (!options.css && !options.tailwind && !options.figma) {
            console.log(chalk.dim('\n💡 Use --css, --tailwind, or --figma to export tokens'));
        }
    });

// Figma Extract command
program
    .command('extract')
    .description('Extract design DNA from an existing Figma file')
    .argument('<file-key>', 'Figma file key (from URL: figma.com/file/FILE_KEY/...)')
    .option('-o, --output <path>', 'Output JSON file path', './design-dna.json')
    .option('--context', 'Output Gemini context string instead of JSON')
    .action(async (fileKey: string, options) => {
        printBanner();
        printStatus('ANALYZING');

        const figmaToken = process.env.FIGMA_ACCESS_TOKEN;
        if (!figmaToken) {
            console.log(chalk.red('❌ FIGMA_ACCESS_TOKEN not configured'));
            console.log(chalk.dim('Add FIGMA_ACCESS_TOKEN to your .env file'));
            console.log(chalk.dim('Get your token at: https://www.figma.com/developers/api#access-tokens'));
            process.exit(1);
        }

        console.log(chalk.dim(`\n🔍 Extracting from file: ${fileKey}\n`));

        const spinner = ora('Connecting to Figma API...').start();

        try {
            // Dynamic import
            const { FigmaExtractor } = await import('../figma/figma-extractor.js');
            const extractor = new FigmaExtractor(figmaToken);

            spinner.text = 'Fetching file metadata...';
            const dna = await extractor.extractDesignDNA(fileKey);
            spinner.stop();

            printStatus('COMPLETE', 'green');

            // Summary table
            const summaryTable = new Table({
                head: [chalk.cyan('Category'), chalk.cyan('Count')],
                style: { head: [], border: [] },
            });
            summaryTable.push(
                ['Colors', dna.colors.length],
                ['Typography', dna.typography.length],
                ['Shadows', dna.shadows.length],
                ['Spacing', dna.spacing.length],
                ['Components', dna.components.length]
            );

            console.log('\n' + chalk.bold(`📦 Design DNA from: ${dna.$metadata.fileName || fileKey}`));
            console.log(summaryTable.toString());

            // Show color preview
            if (dna.colors.length > 0) {
                console.log('\n' + chalk.bold('🎨 Colors:'));
                dna.colors.slice(0, 8).forEach(c => {
                    console.log(chalk.dim(`   ${c.name}: ${c.hex}`));
                });
                if (dna.colors.length > 8) {
                    console.log(chalk.dim(`   ... and ${dna.colors.length - 8} more`));
                }
            }

            // Show typography preview
            if (dna.typography.length > 0) {
                console.log('\n' + chalk.bold('📝 Typography:'));
                dna.typography.slice(0, 5).forEach(t => {
                    console.log(chalk.dim(`   ${t.name}: ${t.fontFamily} ${t.fontSize}px`));
                });
            }

            if (options.context) {
                // Output Gemini context
                console.log('\n' + chalk.bold('🧠 Gemini Context:'));
                console.log(chalk.dim('─'.repeat(60)));
                console.log(extractor.toGeminiContext(dna));
            } else {
                // Save to file
                extractor.saveToFile(dna, options.output);
                console.log(chalk.green(`\n✓ Saved to ${options.output}`));
                console.log(chalk.dim('💡 Use this file as context for wireframe generation'));
            }

        } catch (error) {
            spinner.stop();
            printStatus('ERROR', 'red');
            console.log(chalk.red(`\n❌ Error: ${(error as Error).message}`));

            if ((error as Error).message.includes('403')) {
                console.log(chalk.yellow('\n💡 Check that:'));
                console.log(chalk.dim('   1. Your FIGMA_ACCESS_TOKEN is valid'));
                console.log(chalk.dim('   2. You have access to this file'));
                console.log(chalk.dim('   3. The file key is correct'));
            }

            process.exit(1);
        }
    });

// Workflow Command - Multi-platform orchestration
program
    .command('workflow')
    .alias('wf-run')
    .description('🔄 Execute multi-platform workflow with Cortex')
    .argument('[workflow-id]', 'Workflow ID (full_design_pipeline, ab_optimization, code_handoff, documentation)')
    .option('--list', 'List available workflows')
    .option('--demo', 'Run demo with mock adapters')
    .action(async (workflowId: string | undefined, options) => {
        printBanner();

        // Dynamic imports
        const { Cortex, cortex } = await import('../cortex/state-machine.js');
        const { ThinkingTraceUI } = await import('../cortex/thinking-ui.js');
        const {
            MultiPlatformCoordinator,
            WORKFLOW_TEMPLATES,
            mockSlackAdapter,
            mockNotionAdapter,
            mockGitHubAdapter,
            mockAnalyticsAdapter
        } = await import('../cortex/coordinator.js');

        // Initialize UI
        const traceUI = new ThinkingTraceUI(cortex);

        if (options.list || !workflowId) {
            console.log(chalk.bold('\n🔄 Workflows Disponibles:\n'));

            const table = new Table({
                head: [chalk.cyan('ID'), chalk.cyan('Nombre'), chalk.cyan('Plataformas')],
                style: { head: [], border: [] },
            });

            for (const workflow of WORKFLOW_TEMPLATES) {
                table.push([
                    workflow.id,
                    workflow.name,
                    workflow.requiredAdapters.join(', ')
                ]);
            }

            console.log(table.toString());
            console.log(chalk.dim('\n💡 Uso: npm run dev workflow <workflow-id> --demo'));
            return;
        }

        const workflow = WORKFLOW_TEMPLATES.find(w => w.id === workflowId);
        if (!workflow) {
            console.log(chalk.red(`❌ Workflow no encontrado: ${workflowId}`));
            console.log(chalk.dim('Usa --list para ver workflows disponibles'));
            process.exit(1);
        }

        console.log(chalk.cyan.bold(`\n🔄 Ejecutando: ${workflow.name}\n`));
        console.log(chalk.dim(workflow.description));
        console.log(chalk.dim('─'.repeat(50)));

        // Initialize coordinator with mock adapters for demo
        const coordinator = new MultiPlatformCoordinator(cortex);

        if (options.demo) {
            console.log(chalk.yellow('\n⚠️  Modo demo: usando adaptadores mock\n'));
            coordinator.registerAdapter(mockSlackAdapter);
            coordinator.registerAdapter(mockNotionAdapter);
            coordinator.registerAdapter(mockGitHubAdapter);
            coordinator.registerAdapter(mockAnalyticsAdapter);

            // Also add gemini and figma as "configured"
            coordinator.registerAdapter({
                name: 'Gemini',
                surface: 'gemini',
                isConfigured: () => !!process.env.GEMINI_API_KEY,
                test: async () => true,
            });
            coordinator.registerAdapter({
                name: 'Figma',
                surface: 'figma',
                isConfigured: () => !!process.env.FIGMA_ACCESS_TOKEN || true, // Demo mode
                test: async () => true,
            });
        }

        // Create execution plan
        cortex.createExecutionPlan(workflow.name, workflow.steps);
        traceUI.renderExecutionPlan();

        // Create mock executors for demo
        const executors = new Map<string, () => Promise<unknown>>();

        for (const step of workflow.steps) {
            executors.set(step.id, async () => {
                // Simulate thinking
                cortex.think(
                    `Procesando: ${step.name}`,
                    step.action,
                    Math.random() * 100
                );

                // Simulate work
                await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

                return { success: true, step: step.id };
            });
        }

        // Set up approval handler for interactive mode
        cortex.on('approvalRequired', async (request: import('../cortex/state-machine.js').ApprovalRequest) => {
            const { default: inquirerDefault } = await import('inquirer');

            const choices = request.options.map((opt: import('../cortex/state-machine.js').ApprovalOption) => ({
                name: `[${opt.id}] ${opt.label}${opt.recommended ? ' ★' : ''} - ${opt.description}`,
                value: opt.id,
            }));

            const answer = await inquirerDefault.prompt([{
                type: 'list',
                name: 'choice',
                message: request.title,
                choices,
            }]);

            const selectedOption = request.options.find((o: import('../cortex/state-machine.js').ApprovalOption) => o.id === answer.choice);
            if (selectedOption) {
                cortex.respondToApproval(request.id, selectedOption);
            }
        });

        try {
            const result = await coordinator.executeWorkflow(workflowId, executors);

            console.log('\n');
            if (result.success) {
                console.log(chalk.green.bold('✓ Workflow completado exitosamente'));
            } else {
                console.log(chalk.yellow.bold('⚠️  Workflow completado con errores'));
            }

            console.log(chalk.dim(`\nResultados: ${result.results.size} pasos ejecutados`));

        } catch (error) {
            console.log(chalk.red.bold(`\n✗ Error: ${(error as Error).message}`));
            process.exit(1);
        }
    });

// Demo Command - Interactive showcase of all features
program
    .command('demo')
    .description('🎮 Demostración interactiva de COCO + Cortex')
    .action(async () => {
        printBanner();

        const { cortex } = await import('../cortex/state-machine.js');
        const { ThinkingTraceUI, ElegantLoader } = await import('../cortex/thinking-ui.js');

        console.log(chalk.cyan.bold('\n🎮 DEMO: COCO + Cortex en acción\n'));
        console.log(chalk.dim('Esta demo muestra el sistema de Thinking Trace y Self-Healing\n'));

        const traceUI = new ThinkingTraceUI(cortex);
        const loader = new ElegantLoader();

        // Simulate thinking trace
        console.log(chalk.bold('\n📍 Fase 1: Thinking Trace\n'));

        const thinkingSteps = [
            { msg: 'Analizando 500 reseñas de usuarios...', progress: 20 },
            { msg: 'Identificando patrón de abandono en checkout...', progress: 45 },
            { msg: 'Buscando componentes de alta conversión en la librería...', progress: 70 },
            { msg: 'Calculando posiciones óptimas para CTAs...', progress: 90 },
            { msg: 'Generando estructura de diseño...', progress: 100 },
        ];

        for (const step of thinkingSteps) {
            cortex.think(step.msg, undefined, step.progress);
            await new Promise(resolve => setTimeout(resolve, 800));
        }

        // Simulate approval request
        console.log(chalk.bold('\n📍 Fase 2: Human-in-the-Loop\n'));

        // Create a demo approval (won't wait for response in demo)
        const approvalRequest = cortex.createDesignDirectionRequest(
            'COCO ha identificado 3 posibles direcciones para tu landing page'
        );

        console.log(chalk.yellow.bold('⊙ APROBACIÓN REQUERIDA'));
        console.log(chalk.dim('═'.repeat(50)));
        console.log(chalk.bold(approvalRequest.title));
        console.log(chalk.dim(approvalRequest.description));
        console.log();

        for (const option of approvalRequest.options) {
            const recommended = option.recommended ? chalk.cyan.bold(' ★ RECOMENDADA') : '';
            console.log(chalk.bold(`  [${option.id}] ${option.label}`) + recommended);
            console.log(chalk.dim(`      ${option.description}`));
            console.log();
        }

        // Simulate self-healing
        console.log(chalk.bold('\n📍 Fase 3: Self-Healing\n'));

        cortex.think('JSON inválido detectado, intentando reparar...', 'Unexpected token at position 145', 33);
        await new Promise(resolve => setTimeout(resolve, 600));

        cortex.think('Re-generando estructura con correcciones...', 'Aplicando schema validation', 66);
        await new Promise(resolve => setTimeout(resolve, 600));

        cortex.think('Estructura reparada exitosamente', 'Self-healing completado', 100);
        await new Promise(resolve => setTimeout(resolve, 400));

        // Summary
        console.log('\n');
        console.log(boxen(
            chalk.bold('✨ Demo Completada\n\n') +
            chalk.dim('COCO está listo para generar diseños de alta conversión.\n') +
            chalk.dim('Usa ') + chalk.cyan('npm run dev coco "tu brief"') + chalk.dim(' para comenzar.'),
            {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'cyan',
            }
        ));
    });

// Config check command
program
    .command('config')
    .description('Check configuration status')
    .action(() => {
        printBanner();
        printConfig();

        const check = validateConfig();
        if (check.valid) {
            console.log(chalk.green('✓ Configuration valid'));
        } else {
            console.log(chalk.red('✗ Configuration errors:'));
            check.errors.forEach(e => console.log(chalk.red(`  • ${e}`)));
        }
    });

// Parse and run
program.parse();
