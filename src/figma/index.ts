/**
 * Figma Module - Public API
 */

export {
    WireframeDocumentSchema,
    WireframePageSchema,
    WireframeNodeSchema,
    ComponentTypeSchema,
    COMPONENT_LIBRARY,
    hexToRgba,
    generateNodeId,
    getComponentTemplate,
    validateWireframe,
    type WireframeDocument,
    type WireframePage,
    type WireframeNode,
    type ComponentType,
    type ComponentTemplate,
} from './wireframe-schema.js';

export {
    FigmaConnector,
    createFigmaConnector
} from './figma-connector.js';

export {
    TailwindGenerator,
    tailwindGenerator
} from './tailwind-generator.js';

export {
    FigmaExtractor,
    createFigmaExtractor,
    type FigmaDesignDNA,
    type ExtractedColorToken,
    type ExtractedTypographyToken,
    type ExtractedShadowToken,
    type ExtractedSpacingToken,
    type ExtractedComponentSpec,
} from './figma-extractor.js';
