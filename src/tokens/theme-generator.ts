/**
 * THEME GENERATOR
 * Generates custom themes using design system tokens as base
 */

import {
    DESIGN_SYSTEMS,
    type DesignSystemName,
    MATERIAL_DESIGN_3,
    TAILWIND_TOKENS,
    SHADCN_TOKENS,
    UNTITLED_UI_TOKENS,
} from './design-systems.js';

// ============================================
// THEME PRESETS
// ============================================

export interface ThemePreset {
    name: string;
    description: string;
    baseSystem: DesignSystemName;
    style: 'minimal' | 'bold' | 'playful' | 'corporate' | 'luxury';
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
        text: string;
        textMuted: string;
        border: string;
        error: string;
        success: string;
        warning: string;
    };
    typography: {
        fontFamily: string;
        headingWeight: number;
        bodyWeight: number;
    };
    borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
    shadows: 'none' | 'subtle' | 'medium' | 'dramatic';
}

export const THEME_PRESETS: Record<string, ThemePreset> = {
    // Modern SaaS - Blue/Indigo
    'modern-saas': {
        name: 'Modern SaaS',
        description: 'Clean, professional SaaS look with blue accents',
        baseSystem: 'tailwind',
        style: 'minimal',
        colors: {
            primary: '#3b82f6',     // blue-500
            secondary: '#6366f1',   // indigo-500
            accent: '#8b5cf6',      // violet-500
            background: '#ffffff',
            surface: '#f9fafb',     // gray-50
            text: '#111827',        // gray-900
            textMuted: '#6b7280',   // gray-500
            border: '#e5e7eb',      // gray-200
            error: '#ef4444',       // red-500
            success: '#22c55e',     // green-500
            warning: '#f59e0b',     // amber-500
        },
        typography: {
            fontFamily: 'Inter, system-ui, sans-serif',
            headingWeight: 600,
            bodyWeight: 400,
        },
        borderRadius: 'medium',
        shadows: 'subtle',
    },

    // Dark Mode Tech
    'dark-tech': {
        name: 'Dark Tech',
        description: 'Dark mode with cyan/purple accents for developer tools',
        baseSystem: 'shadcn',
        style: 'bold',
        colors: {
            primary: '#06b6d4',     // cyan-500
            secondary: '#8b5cf6',   // violet-500
            accent: '#f472b6',      // pink-400
            background: '#0f172a',  // slate-900
            surface: '#1e293b',     // slate-800
            text: '#f8fafc',        // slate-50
            textMuted: '#94a3b8',   // slate-400
            border: '#334155',      // slate-700
            error: '#f87171',       // red-400
            success: '#4ade80',     // green-400
            warning: '#fbbf24',     // amber-400
        },
        typography: {
            fontFamily: 'JetBrains Mono, monospace',
            headingWeight: 700,
            bodyWeight: 400,
        },
        borderRadius: 'small',
        shadows: 'dramatic',
    },

    // Fintech Professional
    'fintech': {
        name: 'Fintech',
        description: 'Trust-inspiring design for financial applications',
        baseSystem: 'untitled-ui',
        style: 'corporate',
        colors: {
            primary: '#0ea5e9',     // sky-500
            secondary: '#0284c7',   // sky-600
            accent: '#14b8a6',      // teal-500
            background: '#ffffff',
            surface: '#f8fafc',     // slate-50
            text: '#0f172a',        // slate-900
            textMuted: '#64748b',   // slate-500
            border: '#e2e8f0',      // slate-200
            error: '#dc2626',       // red-600
            success: '#16a34a',     // green-600
            warning: '#d97706',     // amber-600
        },
        typography: {
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            headingWeight: 700,
            bodyWeight: 400,
        },
        borderRadius: 'medium',
        shadows: 'medium',
    },

    // E-commerce Vibrant
    'ecommerce': {
        name: 'E-commerce',
        description: 'Vibrant and engaging for retail experiences',
        baseSystem: 'tailwind',
        style: 'playful',
        colors: {
            primary: '#ec4899',     // pink-500
            secondary: '#f97316',   // orange-500
            accent: '#8b5cf6',      // violet-500
            background: '#ffffff',
            surface: '#fdf4ff',     // fuchsia-50
            text: '#1f2937',        // gray-800
            textMuted: '#6b7280',   // gray-500
            border: '#f3e8ff',      // purple-100
            error: '#ef4444',       // red-500
            success: '#10b981',     // emerald-500
            warning: '#f59e0b',     // amber-500
        },
        typography: {
            fontFamily: 'Outfit, sans-serif',
            headingWeight: 700,
            bodyWeight: 400,
        },
        borderRadius: 'large',
        shadows: 'medium',
    },

    // Luxury Minimal
    'luxury': {
        name: 'Luxury',
        description: 'Elegant and sophisticated for premium brands',
        baseSystem: 'material-design-3',
        style: 'luxury',
        colors: {
            primary: '#1f2937',     // gray-800
            secondary: '#d4af37',   // gold
            accent: '#92400e',      // amber-800
            background: '#fafaf9',  // stone-50
            surface: '#ffffff',
            text: '#1c1917',        // stone-900
            textMuted: '#78716c',   // stone-500
            border: '#e7e5e4',      // stone-200
            error: '#b91c1c',       // red-700
            success: '#15803d',     // green-700
            warning: '#b45309',     // amber-700
        },
        typography: {
            fontFamily: 'Playfair Display, serif',
            headingWeight: 600,
            bodyWeight: 400,
        },
        borderRadius: 'none',
        shadows: 'subtle',
    },

    // Material You (Android)
    'material-you': {
        name: 'Material You',
        description: 'Dynamic color system inspired by Material Design 3',
        baseSystem: 'material-design-3',
        style: 'playful',
        colors: {
            primary: '#6750A4',
            secondary: '#625B71',
            accent: '#7D5260',
            background: '#FFFBFE',
            surface: '#FFFBFE',
            text: '#1C1B1F',
            textMuted: '#49454F',
            border: '#CAC4D0',
            error: '#B3261E',
            success: '#1B873A',
            warning: '#E67E00',
        },
        typography: {
            fontFamily: 'Roboto, system-ui, sans-serif',
            headingWeight: 500,
            bodyWeight: 400,
        },
        borderRadius: 'large',
        shadows: 'medium',
    },
};

// ============================================
// THEME GENERATOR
// ============================================

export function generateTheme(presetName: keyof typeof THEME_PRESETS): ThemePreset {
    return THEME_PRESETS[presetName];
}

export function themeToCSS(theme: ThemePreset): string {
    const radiusMap = {
        'none': '0',
        'small': '4px',
        'medium': '8px',
        'large': '16px',
        'full': '9999px',
    };

    return `
:root {
  /* Colors */
  --color-primary: ${theme.colors.primary};
  --color-secondary: ${theme.colors.secondary};
  --color-accent: ${theme.colors.accent};
  --color-background: ${theme.colors.background};
  --color-surface: ${theme.colors.surface};
  --color-text: ${theme.colors.text};
  --color-text-muted: ${theme.colors.textMuted};
  --color-border: ${theme.colors.border};
  --color-error: ${theme.colors.error};
  --color-success: ${theme.colors.success};
  --color-warning: ${theme.colors.warning};
  
  /* Typography */
  --font-family: ${theme.typography.fontFamily};
  --font-weight-heading: ${theme.typography.headingWeight};
  --font-weight-body: ${theme.typography.bodyWeight};
  
  /* Border Radius */
  --radius: ${radiusMap[theme.borderRadius]};
  --radius-sm: calc(var(--radius) * 0.5);
  --radius-lg: calc(var(--radius) * 1.5);
  --radius-xl: calc(var(--radius) * 2);
}

/* Base styles */
body {
  font-family: var(--font-family);
  font-weight: var(--font-weight-body);
  background-color: var(--color-background);
  color: var(--color-text);
}

h1, h2, h3, h4, h5, h6 {
  font-weight: var(--font-weight-heading);
}
`.trim();
}

export function themeToTailwindConfig(theme: ThemePreset): string {
    return `
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '${theme.colors.primary}',
        secondary: '${theme.colors.secondary}',
        accent: '${theme.colors.accent}',
        background: '${theme.colors.background}',
        surface: '${theme.colors.surface}',
        'text-primary': '${theme.colors.text}',
        'text-muted': '${theme.colors.textMuted}',
        border: '${theme.colors.border}',
        error: '${theme.colors.error}',
        success: '${theme.colors.success}',
        warning: '${theme.colors.warning}',
      },
      fontFamily: {
        sans: ['${theme.typography.fontFamily.split(',')[0].trim()}', 'system-ui', 'sans-serif'],
      },
    },
  },
};
`.trim();
}

export function themeToFigmaVariables(theme: ThemePreset): object {
    return {
        name: theme.name,
        modes: {
            light: {
                'color/primary': theme.colors.primary,
                'color/secondary': theme.colors.secondary,
                'color/accent': theme.colors.accent,
                'color/background': theme.colors.background,
                'color/surface': theme.colors.surface,
                'color/text': theme.colors.text,
                'color/text-muted': theme.colors.textMuted,
                'color/border': theme.colors.border,
                'color/error': theme.colors.error,
                'color/success': theme.colors.success,
                'color/warning': theme.colors.warning,
            },
        },
    };
}

// ============================================
// EXPORTS
// ============================================

export function getThemePresets() {
    return Object.keys(THEME_PRESETS);
}

export function getThemeByStyle(style: ThemePreset['style']): ThemePreset | undefined {
    return Object.values(THEME_PRESETS).find(t => t.style === style);
}
