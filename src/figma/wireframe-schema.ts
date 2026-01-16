/**
 * FIGMA WIREFRAME SCHEMA
 * JSON structure that bridges Gemini output to Figma API
 */

import { z } from 'zod';

// ============================================
// FIGMA NODE PRIMITIVES
// ============================================

export const FigmaPositionSchema = z.object({
    x: z.number(),
    y: z.number(),
});

export const FigmaDimensionsSchema = z.object({
    width: z.number(),
    height: z.number(),
});

export const FigmaColorSchema = z.object({
    r: z.number().min(0).max(1),
    g: z.number().min(0).max(1),
    b: z.number().min(0).max(1),
    a: z.number().min(0).max(1).default(1),
});

export const FigmaCornerRadiusSchema = z.object({
    topLeft: z.number().default(0),
    topRight: z.number().default(0),
    bottomRight: z.number().default(0),
    bottomLeft: z.number().default(0),
});

// ============================================
// COMPONENT TYPES
// ============================================

export const ComponentTypeSchema = z.enum([
    'frame',
    'rectangle',
    'text',
    'button',
    'input',
    'card',
    'navbar',
    'hero',
    'section',
    'grid',
    'image-placeholder',
    'icon-placeholder',
    'divider',
    'footer',
]);

export type ComponentType = z.infer<typeof ComponentTypeSchema>;

// ============================================
// BASE WIREFRAME NODE
// ============================================

export const WireframeNodeSchema = z.object({
    id: z.string(),
    type: ComponentTypeSchema,
    name: z.string(),
    position: FigmaPositionSchema,
    dimensions: FigmaDimensionsSchema,

    // Styling
    fill: z.string().regex(/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/).optional(),
    stroke: z.string().regex(/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/).optional(),
    strokeWidth: z.number().optional(),
    cornerRadius: z.union([z.number(), FigmaCornerRadiusSchema]).optional(),
    opacity: z.number().min(0).max(1).default(1),

    // Text properties (for text nodes)
    text: z.string().optional(),
    fontSize: z.number().optional(),
    fontWeight: z.enum(['regular', 'medium', 'semibold', 'bold']).optional(),
    textAlign: z.enum(['left', 'center', 'right']).optional(),
    textColor: z.string().optional(),

    // Layout properties
    layoutMode: z.enum(['none', 'horizontal', 'vertical']).optional(),
    padding: z.number().optional(),
    gap: z.number().optional(),

    // Hierarchy
    children: z.array(z.lazy(() => WireframeNodeSchema)).optional(),

    // Metadata
    annotations: z.array(z.string()).optional(),
    semanticRole: z.string().optional(), // For accessibility hints
});

export type WireframeNode = z.infer<typeof WireframeNodeSchema>;

// ============================================
// FULL WIREFRAME STRUCTURE
// ============================================

export const WireframePageSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['desktop', 'tablet', 'mobile']),
    viewport: FigmaDimensionsSchema,
    backgroundColor: z.string().default('#FFFFFF'),
    nodes: z.array(WireframeNodeSchema),
});

export type WireframePage = z.infer<typeof WireframePageSchema>;

export const WireframeDocumentSchema = z.object({
    $schema: z.string().optional(),
    $metadata: z.object({
        generatedBy: z.literal('wireframe-agent'),
        timestamp: z.string(),
        version: z.string(),
        prompt: z.string(),
    }),
    document: z.object({
        name: z.string(),
        description: z.string().optional(),
        pages: z.array(WireframePageSchema),
    }),
    designTokens: z.object({
        colors: z.record(z.string(), z.string()),
        spacing: z.record(z.string(), z.number()),
        typography: z.record(z.string(), z.object({
            fontSize: z.number(),
            fontWeight: z.string(),
        })),
    }).optional(),
});

export type WireframeDocument = z.infer<typeof WireframeDocumentSchema>;

// ============================================
// COMPONENT LIBRARY (Pre-designed templates)
// ============================================

export interface ComponentTemplate {
    type: ComponentType;
    name: string;
    description: string;
    defaultDimensions: { width: number; height: number };
    variants: string[];
    structure: Partial<WireframeNode>;
}

export const COMPONENT_LIBRARY: ComponentTemplate[] = [
    {
        type: 'navbar',
        name: 'Navigation Bar',
        description: 'Top navigation with logo and links',
        defaultDimensions: { width: 1440, height: 72 },
        variants: ['minimal', 'with-cta', 'centered'],
        structure: {
            type: 'navbar',
            fill: '#FFFFFF',
            layoutMode: 'horizontal',
            padding: 24,
            children: [
                { id: 'logo', type: 'rectangle', name: 'Logo', position: { x: 0, y: 0 }, dimensions: { width: 120, height: 40 }, fill: '#E5E7EB' },
                { id: 'nav-links', type: 'frame', name: 'Nav Links', position: { x: 500, y: 0 }, dimensions: { width: 400, height: 40 }, layoutMode: 'horizontal', gap: 32 },
                { id: 'cta', type: 'button', name: 'CTA Button', position: { x: 1200, y: 0 }, dimensions: { width: 140, height: 44 }, fill: '#3B82F6', cornerRadius: 8, text: 'Get Started' },
            ],
        },
    },
    {
        type: 'hero',
        name: 'Hero Section',
        description: 'Large banner with headline and CTA',
        defaultDimensions: { width: 1440, height: 600 },
        variants: ['centered', 'split', 'with-image', 'video-background'],
        structure: {
            type: 'hero',
            fill: '#F9FAFB',
            layoutMode: 'vertical',
            padding: 80,
            children: [
                { id: 'headline', type: 'text', name: 'Headline', position: { x: 0, y: 0 }, dimensions: { width: 800, height: 80 }, text: 'Your Headline Here', fontSize: 56, fontWeight: 'bold', textAlign: 'center' },
                { id: 'subheadline', type: 'text', name: 'Subheadline', position: { x: 0, y: 100 }, dimensions: { width: 600, height: 60 }, text: 'Supporting text that explains the value proposition', fontSize: 20, textAlign: 'center', textColor: '#6B7280' },
                { id: 'hero-cta', type: 'button', name: 'Hero CTA', position: { x: 0, y: 200 }, dimensions: { width: 200, height: 56 }, fill: '#3B82F6', cornerRadius: 12, text: 'Get Started Free' },
            ],
        },
    },
    {
        type: 'section',
        name: 'Content Section',
        description: 'Generic content section with heading',
        defaultDimensions: { width: 1440, height: 500 },
        variants: ['features-grid', 'testimonials', 'stats', 'cta-banner'],
        structure: {
            type: 'section',
            fill: '#FFFFFF',
            layoutMode: 'vertical',
            padding: 80,
        },
    },
    {
        type: 'card',
        name: 'Card Component',
        description: 'Content card with image, title, description',
        defaultDimensions: { width: 360, height: 400 },
        variants: ['featured', 'minimal', 'horizontal', 'pricing'],
        structure: {
            type: 'card',
            fill: '#FFFFFF',
            cornerRadius: 12,
            stroke: '#E5E7EB',
            strokeWidth: 1,
            layoutMode: 'vertical',
            padding: 24,
            children: [
                { id: 'card-image', type: 'image-placeholder', name: 'Image', position: { x: 0, y: 0 }, dimensions: { width: 312, height: 180 }, fill: '#E5E7EB', cornerRadius: 8 },
                { id: 'card-title', type: 'text', name: 'Card Title', position: { x: 0, y: 200 }, dimensions: { width: 312, height: 28 }, text: 'Card Title', fontSize: 20, fontWeight: 'semibold' },
                { id: 'card-desc', type: 'text', name: 'Card Description', position: { x: 0, y: 240 }, dimensions: { width: 312, height: 60 }, text: 'Brief description of the card content goes here.', fontSize: 14, textColor: '#6B7280' },
            ],
        },
    },
    {
        type: 'grid',
        name: 'Grid Layout',
        description: 'Responsive grid container',
        defaultDimensions: { width: 1200, height: 400 },
        variants: ['2-col', '3-col', '4-col', 'masonry'],
        structure: {
            type: 'grid',
            layoutMode: 'horizontal',
            gap: 24,
        },
    },
    {
        type: 'input',
        name: 'Input Field',
        description: 'Form input with label',
        defaultDimensions: { width: 320, height: 72 },
        variants: ['with-label', 'with-icon', 'textarea', 'select'],
        structure: {
            type: 'input',
            layoutMode: 'vertical',
            gap: 8,
            children: [
                { id: 'input-label', type: 'text', name: 'Label', position: { x: 0, y: 0 }, dimensions: { width: 320, height: 20 }, text: 'Label', fontSize: 14, fontWeight: 'medium' },
                { id: 'input-field', type: 'rectangle', name: 'Input Field', position: { x: 0, y: 28 }, dimensions: { width: 320, height: 44 }, fill: '#FFFFFF', stroke: '#D1D5DB', strokeWidth: 1, cornerRadius: 8 },
            ],
        },
    },
    {
        type: 'button',
        name: 'Button',
        description: 'Clickable action button',
        defaultDimensions: { width: 160, height: 48 },
        variants: ['primary', 'secondary', 'ghost', 'destructive'],
        structure: {
            type: 'button',
            fill: '#3B82F6',
            cornerRadius: 8,
            text: 'Button',
            fontSize: 16,
            fontWeight: 'medium',
            textColor: '#FFFFFF',
            textAlign: 'center',
        },
    },
    {
        type: 'footer',
        name: 'Footer',
        description: 'Page footer with links and copyright',
        defaultDimensions: { width: 1440, height: 300 },
        variants: ['simple', 'multi-column', 'with-newsletter'],
        structure: {
            type: 'footer',
            fill: '#111827',
            layoutMode: 'vertical',
            padding: 64,
        },
    },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
    if (!result) {
        return { r: 0, g: 0, b: 0, a: 1 };
    }
    return {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
        a: result[4] ? parseInt(result[4], 16) / 255 : 1,
    };
}

export function generateNodeId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function getComponentTemplate(type: ComponentType): ComponentTemplate | undefined {
    return COMPONENT_LIBRARY.find(c => c.type === type);
}

export function validateWireframe(data: unknown): { valid: boolean; errors?: string[] } {
    const result = WireframeDocumentSchema.safeParse(data);
    if (result.success) {
        return { valid: true };
    }
    return {
        valid: false,
        errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
    };
}
