/**
 * FIGMA CONNECTOR
 * Translates wireframe JSON to Figma REST API calls
 */

import type {
    WireframeDocument,
    WireframePage,
    WireframeNode
} from './wireframe-schema.js';
import { hexToRgba } from './wireframe-schema.js';

// ============================================
// FIGMA API TYPES
// ============================================

interface FigmaColor {
    r: number;
    g: number;
    b: number;
    a: number;
}

interface FigmaPaint {
    type: 'SOLID' | 'GRADIENT_LINEAR' | 'IMAGE';
    color?: FigmaColor;
    opacity?: number;
}

interface FigmaNode {
    type: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fills?: FigmaPaint[];
    strokes?: FigmaPaint[];
    strokeWeight?: number;
    cornerRadius?: number;
    characters?: string;
    style?: {
        fontSize?: number;
        fontFamily?: string;
        fontWeight?: number;
        textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT';
    };
    children?: FigmaNode[];
    layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
    primaryAxisSizingMode?: 'FIXED' | 'AUTO';
    counterAxisSizingMode?: 'FIXED' | 'AUTO';
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    itemSpacing?: number;
}

interface FigmaAPIPayload {
    nodes: FigmaNode[];
    metadata: {
        source: string;
        timestamp: string;
        prompt: string;
    };
}

// ============================================
// FIGMA CONNECTOR CLASS
// ============================================

export class FigmaConnector {
    private accessToken: string;
    private fileKey: string;
    private baseUrl = 'https://api.figma.com/v1';

    constructor(accessToken: string, fileKey: string) {
        this.accessToken = accessToken;
        this.fileKey = fileKey;
    }

    /**
     * Convert wireframe document to Figma API payload
     */
    translateToFigma(wireframe: WireframeDocument): FigmaAPIPayload {
        const nodes: FigmaNode[] = [];

        for (const page of wireframe.document.pages) {
            const pageFrame = this.translatePage(page);
            nodes.push(pageFrame);
        }

        return {
            nodes,
            metadata: {
                source: 'gemini-product-brain',
                timestamp: wireframe.$metadata.timestamp,
                prompt: wireframe.$metadata.prompt,
            },
        };
    }

    private translatePage(page: WireframePage): FigmaNode {
        const children = page.nodes.map(node => this.translateNode(node));

        return {
            type: 'FRAME',
            name: page.name,
            x: 0,
            y: 0,
            width: page.viewport.width,
            height: page.viewport.height,
            fills: [{ type: 'SOLID', color: hexToRgba(page.backgroundColor) }],
            children,
            layoutMode: 'VERTICAL',
            primaryAxisSizingMode: 'AUTO',
            counterAxisSizingMode: 'FIXED',
        };
    }

    private translateNode(node: WireframeNode): FigmaNode {
        const figmaNode: FigmaNode = {
            type: this.mapNodeType(node.type),
            name: node.name,
            x: node.position.x,
            y: node.position.y,
            width: node.dimensions.width,
            height: node.dimensions.height,
        };

        // Fill color
        if (node.fill) {
            figmaNode.fills = [{ type: 'SOLID', color: hexToRgba(node.fill) }];
        }

        // Stroke
        if (node.stroke) {
            figmaNode.strokes = [{ type: 'SOLID', color: hexToRgba(node.stroke) }];
            figmaNode.strokeWeight = node.strokeWidth || 1;
        }

        // Corner radius
        if (typeof node.cornerRadius === 'number') {
            figmaNode.cornerRadius = node.cornerRadius;
        }

        // Text properties
        if (node.text) {
            figmaNode.characters = node.text;
            figmaNode.style = {
                fontSize: node.fontSize || 16,
                fontFamily: 'Inter',
                fontWeight: this.mapFontWeight(node.fontWeight || 'regular'),
                textAlignHorizontal: this.mapTextAlign(node.textAlign || 'left'),
            };
            if (node.textColor) {
                figmaNode.fills = [{ type: 'SOLID', color: hexToRgba(node.textColor) }];
            }
        }

        // Layout mode
        if (node.layoutMode && node.layoutMode !== 'none') {
            figmaNode.layoutMode = node.layoutMode.toUpperCase() as 'HORIZONTAL' | 'VERTICAL';
            figmaNode.primaryAxisSizingMode = 'AUTO';
            figmaNode.counterAxisSizingMode = 'FIXED';

            if (node.padding) {
                figmaNode.paddingLeft = node.padding;
                figmaNode.paddingRight = node.padding;
                figmaNode.paddingTop = node.padding;
                figmaNode.paddingBottom = node.padding;
            }

            if (node.gap) {
                figmaNode.itemSpacing = node.gap;
            }
        }

        // Children
        if (node.children && node.children.length > 0) {
            figmaNode.children = node.children.map((child: WireframeNode) => this.translateNode(child));
        }

        return figmaNode;
    }

    private mapNodeType(type: string): string {
        const typeMap: Record<string, string> = {
            'frame': 'FRAME',
            'rectangle': 'RECTANGLE',
            'text': 'TEXT',
            'button': 'FRAME', // Buttons are frames with text
            'input': 'FRAME',
            'card': 'FRAME',
            'navbar': 'FRAME',
            'hero': 'FRAME',
            'section': 'FRAME',
            'grid': 'FRAME',
            'image-placeholder': 'RECTANGLE',
            'icon-placeholder': 'RECTANGLE',
            'divider': 'RECTANGLE',
            'footer': 'FRAME',
        };
        return typeMap[type] || 'FRAME';
    }

    private mapFontWeight(weight: string): number {
        const weightMap: Record<string, number> = {
            'regular': 400,
            'medium': 500,
            'semibold': 600,
            'bold': 700,
        };
        return weightMap[weight] || 400;
    }

    private mapTextAlign(align: string): 'LEFT' | 'CENTER' | 'RIGHT' {
        return (align.toUpperCase() as 'LEFT' | 'CENTER' | 'RIGHT') || 'LEFT';
    }

    /**
     * Create nodes in Figma via REST API
     * Note: Figma REST API has limited write capabilities
     * For full creation, use Plugin API instead
     */
    async pushToFigma(payload: FigmaAPIPayload): Promise<{ success: boolean; message: string }> {
        // Figma REST API doesn't support direct node creation
        // This method provides the payload structure for:
        // 1. Figma Plugin (via postMessage)
        // 2. Future API capabilities
        // 3. Manual import

        console.log('Figma Payload Generated:');
        console.log(JSON.stringify(payload, null, 2));

        return {
            success: true,
            message: 'Payload generated. Use Figma Plugin for direct creation or import JSON manually.',
        };
    }

    /**
     * Generate Figma Plugin code that creates the wireframe
     */
    generatePluginCode(wireframe: WireframeDocument): string {
        const payload = this.translateToFigma(wireframe);

        return `
// Figma Plugin Code - Auto-generated by Gemini Product Brain
// Paste this into Figma Plugin console or create a plugin

async function createWireframe() {
  const nodes = ${JSON.stringify(payload.nodes, null, 2)};
  
  function createNode(data, parent) {
    let node;
    
    switch (data.type) {
      case 'FRAME':
        node = figma.createFrame();
        break;
      case 'RECTANGLE':
        node = figma.createRectangle();
        break;
      case 'TEXT':
        node = figma.createText();
        await figma.loadFontAsync({ family: "Inter", style: "Regular" });
        break;
      default:
        node = figma.createFrame();
    }
    
    node.name = data.name;
    node.x = data.x;
    node.y = data.y;
    node.resize(data.width, data.height);
    
    if (data.fills) {
      node.fills = data.fills;
    }
    
    if (data.strokes) {
      node.strokes = data.strokes;
      node.strokeWeight = data.strokeWeight || 1;
    }
    
    if (data.cornerRadius && 'cornerRadius' in node) {
      node.cornerRadius = data.cornerRadius;
    }
    
    if (data.characters && node.type === 'TEXT') {
      node.characters = data.characters;
      if (data.style) {
        node.fontSize = data.style.fontSize || 16;
        node.textAlignHorizontal = data.style.textAlignHorizontal || 'LEFT';
      }
    }
    
    if (data.layoutMode && node.type === 'FRAME') {
      node.layoutMode = data.layoutMode;
      if (data.itemSpacing) node.itemSpacing = data.itemSpacing;
      if (data.paddingLeft) {
        node.paddingLeft = data.paddingLeft;
        node.paddingRight = data.paddingRight;
        node.paddingTop = data.paddingTop;
        node.paddingBottom = data.paddingBottom;
      }
    }
    
    if (parent) {
      parent.appendChild(node);
    }
    
    if (data.children) {
      for (const child of data.children) {
        await createNode(child, node);
      }
    }
    
    return node;
  }
  
  for (const nodeData of nodes) {
    await createNode(nodeData, figma.currentPage);
  }
  
  figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
  figma.notify('Wireframe created successfully! ✨');
}

createWireframe();
`.trim();
    }
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createFigmaConnector(): FigmaConnector {
    const accessToken = process.env.FIGMA_ACCESS_TOKEN || '';
    const fileKey = process.env.FIGMA_FILE_KEY || '';

    return new FigmaConnector(accessToken, fileKey);
}
