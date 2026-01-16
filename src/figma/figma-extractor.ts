/**
 * FIGMA EXTRACTOR
 * Extracts design DNA from existing Figma files
 * Styles, Variables, Components → JSON for Gemini context
 */

import { writeFileSync } from 'fs';

// ============================================
// FIGMA API TYPES
// ============================================

interface FigmaStyle {
    key: string;
    name: string;
    style_type: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
    description: string;
    node_id: string;
}

interface FigmaColor {
    r: number;
    g: number;
    b: number;
    a: number;
}

interface FigmaPaint {
    type: string;
    color?: FigmaColor;
    opacity?: number;
}

interface FigmaTypeStyle {
    fontFamily: string;
    fontPostScriptName?: string;
    fontWeight: number;
    fontSize: number;
    textAlignHorizontal?: string;
    textAlignVertical?: string;
    letterSpacing: number;
    lineHeightPx: number;
    lineHeightPercent?: number;
    lineHeightUnit?: string;
}

interface FigmaEffect {
    type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
    visible: boolean;
    color?: FigmaColor;
    offset?: { x: number; y: number };
    radius: number;
    spread?: number;
}

interface FigmaNode {
    id: string;
    name: string;
    type: string;
    children?: FigmaNode[];
    fills?: FigmaPaint[];
    strokes?: FigmaPaint[];
    effects?: FigmaEffect[];
    style?: FigmaTypeStyle;
    styles?: Record<string, string>;
    absoluteBoundingBox?: { x: number; y: number; width: number; height: number };
    layoutMode?: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
    primaryAxisSizingMode?: string;
    counterAxisSizingMode?: string;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    itemSpacing?: number;
    cornerRadius?: number;
}

interface FigmaVariable {
    id: string;
    name: string;
    key: string;
    variableCollectionId: string;
    resolvedType: 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN';
    valuesByMode: Record<string, unknown>;
    description?: string;
}

interface FigmaVariableCollection {
    id: string;
    name: string;
    key: string;
    modes: Array<{ modeId: string; name: string }>;
    variableIds: string[];
}

// ============================================
// EXTRACTED TOKEN TYPES
// ============================================

export interface ExtractedColorToken {
    name: string;
    hex: string;
    rgba: { r: number; g: number; b: number; a: number };
    source: 'style' | 'variable';
}

export interface ExtractedTypographyToken {
    name: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    lineHeight: number;
    letterSpacing: number;
}

export interface ExtractedShadowToken {
    name: string;
    type: string;
    color: string;
    offset: { x: number; y: number };
    blur: number;
    spread: number;
}

export interface ExtractedSpacingToken {
    name: string;
    value: number;
    source: string;
}

export interface ExtractedComponentSpec {
    name: string;
    type: string;
    dimensions: { width: number; height: number };
    layout?: {
        mode: string;
        padding: { top: number; right: number; bottom: number; left: number };
        gap: number;
    };
    cornerRadius?: number;
    fills?: string[];
    children?: ExtractedComponentSpec[];
}

export interface FigmaDesignDNA {
    $metadata: {
        extractedAt: string;
        fileKey: string;
        fileName?: string;
        version?: string;
    };
    colors: ExtractedColorToken[];
    typography: ExtractedTypographyToken[];
    shadows: ExtractedShadowToken[];
    spacing: ExtractedSpacingToken[];
    components: ExtractedComponentSpec[];
    variables?: {
        collections: Array<{ name: string; modes: string[] }>;
        tokens: Array<{ name: string; type: string; values: Record<string, unknown> }>;
    };
}

// ============================================
// FIGMA EXTRACTOR CLASS
// ============================================

export class FigmaExtractor {
    private token: string;
    private baseUrl = 'https://api.figma.com/v1';

    constructor(personalAccessToken: string) {
        this.token = personalAccessToken;
    }

    private async fetch<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            headers: {
                'X-Figma-Token': this.token,
            },
        });

        if (!response.ok) {
            throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
        }

        return response.json() as Promise<T>;
    }

    /**
     * Extract all design DNA from a Figma file
     */
    async extractDesignDNA(fileKey: string): Promise<FigmaDesignDNA> {
        console.log('🔍 Extracting design DNA from Figma...');

        // Get file metadata
        const file = await this.fetch<{ name: string; version: string; document: FigmaNode }>(`/files/${fileKey}`);

        // Get styles
        const stylesResponse = await this.fetch<{ meta: { styles: FigmaStyle[] } }>(`/files/${fileKey}/styles`);
        const styles = stylesResponse.meta?.styles || [];

        // Get style details
        const styleNodes = await this.getStyleNodes(fileKey, styles);

        // Extract tokens
        const colors = this.extractColors(styleNodes, styles);
        const typography = this.extractTypography(styleNodes, styles);
        const shadows = this.extractShadows(styleNodes, styles);

        // Extract component specs from document
        const components = this.extractComponents(file.document);

        // Extract spacing patterns
        const spacing = this.extractSpacingPatterns(file.document);

        // Try to get variables (if available)
        let variables;
        try {
            variables = await this.extractVariables(fileKey);
        } catch {
            console.log('⚠️ Variables not available (requires enterprise plan)');
        }

        return {
            $metadata: {
                extractedAt: new Date().toISOString(),
                fileKey,
                fileName: file.name,
                version: file.version,
            },
            colors,
            typography,
            shadows,
            spacing,
            components,
            variables,
        };
    }

    private async getStyleNodes(fileKey: string, styles: FigmaStyle[]): Promise<Map<string, FigmaNode>> {
        const nodeIds = styles.map(s => s.node_id).join(',');
        if (!nodeIds) return new Map();

        const response = await this.fetch<{ nodes: Record<string, { document: FigmaNode }> }>(
            `/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeIds)}`
        );

        const nodeMap = new Map<string, FigmaNode>();
        for (const [id, data] of Object.entries(response.nodes || {})) {
            if (data?.document) {
                nodeMap.set(id, data.document);
            }
        }

        return nodeMap;
    }

    private extractColors(nodes: Map<string, FigmaNode>, styles: FigmaStyle[]): ExtractedColorToken[] {
        const colors: ExtractedColorToken[] = [];

        for (const style of styles.filter(s => s.style_type === 'FILL')) {
            const node = nodes.get(style.node_id);
            if (node?.fills && node.fills.length > 0) {
                const fill = node.fills[0];
                if (fill.type === 'SOLID' && fill.color) {
                    const rgba = {
                        r: Math.round(fill.color.r * 255),
                        g: Math.round(fill.color.g * 255),
                        b: Math.round(fill.color.b * 255),
                        a: fill.color.a ?? 1,
                    };

                    colors.push({
                        name: style.name,
                        hex: this.rgbaToHex(rgba),
                        rgba,
                        source: 'style',
                    });
                }
            }
        }

        return colors;
    }

    private extractTypography(nodes: Map<string, FigmaNode>, styles: FigmaStyle[]): ExtractedTypographyToken[] {
        const typography: ExtractedTypographyToken[] = [];

        for (const style of styles.filter(s => s.style_type === 'TEXT')) {
            const node = nodes.get(style.node_id);
            if (node?.style) {
                typography.push({
                    name: style.name,
                    fontFamily: node.style.fontFamily,
                    fontSize: node.style.fontSize,
                    fontWeight: node.style.fontWeight,
                    lineHeight: node.style.lineHeightPx,
                    letterSpacing: node.style.letterSpacing,
                });
            }
        }

        return typography;
    }

    private extractShadows(nodes: Map<string, FigmaNode>, styles: FigmaStyle[]): ExtractedShadowToken[] {
        const shadows: ExtractedShadowToken[] = [];

        for (const style of styles.filter(s => s.style_type === 'EFFECT')) {
            const node = nodes.get(style.node_id);
            if (node?.effects) {
                for (const effect of node.effects) {
                    if (effect.type === 'DROP_SHADOW' && effect.visible) {
                        shadows.push({
                            name: style.name,
                            type: effect.type,
                            color: effect.color ? this.rgbaToHex({
                                r: Math.round(effect.color.r * 255),
                                g: Math.round(effect.color.g * 255),
                                b: Math.round(effect.color.b * 255),
                                a: effect.color.a ?? 1,
                            }) : '#000000',
                            offset: effect.offset || { x: 0, y: 0 },
                            blur: effect.radius,
                            spread: effect.spread || 0,
                        });
                    }
                }
            }
        }

        return shadows;
    }

    private extractComponents(document: FigmaNode, maxDepth = 3): ExtractedComponentSpec[] {
        const components: ExtractedComponentSpec[] = [];

        const traverse = (node: FigmaNode, depth: number) => {
            if (depth > maxDepth) return;

            if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
                const spec: ExtractedComponentSpec = {
                    name: node.name,
                    type: node.type,
                    dimensions: {
                        width: node.absoluteBoundingBox?.width || 0,
                        height: node.absoluteBoundingBox?.height || 0,
                    },
                };

                if (node.layoutMode && node.layoutMode !== 'NONE') {
                    spec.layout = {
                        mode: node.layoutMode,
                        padding: {
                            top: node.paddingTop || 0,
                            right: node.paddingRight || 0,
                            bottom: node.paddingBottom || 0,
                            left: node.paddingLeft || 0,
                        },
                        gap: node.itemSpacing || 0,
                    };
                }

                if (node.cornerRadius) {
                    spec.cornerRadius = node.cornerRadius;
                }

                if (node.fills && node.fills.length > 0) {
                    spec.fills = node.fills
                        .filter(f => f.type === 'SOLID' && f.color)
                        .map(f => this.rgbaToHex({
                            r: Math.round(f.color!.r * 255),
                            g: Math.round(f.color!.g * 255),
                            b: Math.round(f.color!.b * 255),
                            a: f.color!.a ?? 1,
                        }));
                }

                components.push(spec);
            }

            if (node.children) {
                for (const child of node.children) {
                    traverse(child, depth + 1);
                }
            }
        };

        traverse(document, 0);
        return components;
    }

    private extractSpacingPatterns(document: FigmaNode): ExtractedSpacingToken[] {
        const spacingSet = new Set<number>();

        const traverse = (node: FigmaNode) => {
            if (node.paddingTop) spacingSet.add(node.paddingTop);
            if (node.paddingRight) spacingSet.add(node.paddingRight);
            if (node.paddingBottom) spacingSet.add(node.paddingBottom);
            if (node.paddingLeft) spacingSet.add(node.paddingLeft);
            if (node.itemSpacing) spacingSet.add(node.itemSpacing);

            if (node.children) {
                for (const child of node.children) {
                    traverse(child);
                }
            }
        };

        traverse(document);

        // Sort and create tokens
        const sortedSpacing = Array.from(spacingSet).sort((a, b) => a - b);
        const sizeNames = ['3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];

        return sortedSpacing.slice(0, sizeNames.length).map((value, i) => ({
            name: sizeNames[i] || `space-${value}`,
            value,
            source: 'extracted',
        }));
    }

    private async extractVariables(fileKey: string): Promise<FigmaDesignDNA['variables']> {
        const response = await this.fetch<{
            meta: {
                variableCollections: Record<string, FigmaVariableCollection>;
                variables: Record<string, FigmaVariable>;
            };
        }>(`/files/${fileKey}/variables/local`);

        const collections = Object.values(response.meta?.variableCollections || {}).map(c => ({
            name: c.name,
            modes: c.modes.map(m => m.name),
        }));

        const tokens = Object.values(response.meta?.variables || {}).map(v => ({
            name: v.name,
            type: v.resolvedType,
            values: v.valuesByMode,
        }));

        return { collections, tokens };
    }

    private rgbaToHex(rgba: { r: number; g: number; b: number; a: number }): string {
        const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
        const hex = `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`;
        if (rgba.a < 1) {
            return hex + toHex(rgba.a * 255);
        }
        return hex;
    }

    /**
     * Save extracted DNA to JSON file
     */
    saveToFile(dna: FigmaDesignDNA, outputPath: string): void {
        writeFileSync(outputPath, JSON.stringify(dna, null, 2));
        console.log(`✅ Design DNA saved to ${outputPath}`);
    }

    /**
     * Generate Gemini context from extracted DNA
     */
    toGeminiContext(dna: FigmaDesignDNA): string {
        return `
DESIGN DNA EXTRACTED FROM "${dna.$metadata.fileName || 'Figma File'}"
Extracted: ${dna.$metadata.extractedAt}

COLOR PALETTE (${dna.colors.length} colors):
${dna.colors.map(c => `  ${c.name}: ${c.hex}`).join('\n')}

TYPOGRAPHY SYSTEM (${dna.typography.length} styles):
${dna.typography.map(t => `  ${t.name}: ${t.fontFamily} ${t.fontWeight} ${t.fontSize}px/${t.lineHeight}px`).join('\n')}

SHADOW STYLES (${dna.shadows.length} shadows):
${dna.shadows.map(s => `  ${s.name}: ${s.blur}px blur, ${s.offset.x}/${s.offset.y} offset`).join('\n')}

SPACING SCALE:
${dna.spacing.map(s => `  ${s.name}: ${s.value}px`).join('\n')}

COMPONENT LIBRARY (${dna.components.length} components):
${dna.components.slice(0, 10).map(c => `  ${c.name}: ${c.dimensions.width}x${c.dimensions.height}px ${c.layout ? `(${c.layout.mode})` : ''}`).join('\n')}

Use these exact values when generating designs to match the existing design system.
`.trim();
    }
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createFigmaExtractor(): FigmaExtractor {
    const token = process.env.FIGMA_ACCESS_TOKEN;
    if (!token) {
        throw new Error('FIGMA_ACCESS_TOKEN not configured in .env');
    }
    return new FigmaExtractor(token);
}
