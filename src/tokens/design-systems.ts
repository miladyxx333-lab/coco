/**
 * DESIGN TOKEN LIBRARY
 * Pre-built token sets from world-class design systems
 * Used as context for Gemini to generate professional-quality designs
 */

// ============================================
// MATERIAL DESIGN 3 (Google)
// ============================================

export const MATERIAL_DESIGN_3 = {
    name: 'Material Design 3',
    version: '3.0',
    source: 'https://m3.material.io',

    colors: {
        // Primary tonal palette
        'primary': { value: '#6750A4', type: 'color', role: 'Primary brand color' },
        'on-primary': { value: '#FFFFFF', type: 'color', role: 'Text on primary' },
        'primary-container': { value: '#EADDFF', type: 'color', role: 'Primary container' },
        'on-primary-container': { value: '#21005D', type: 'color', role: 'Text on primary container' },

        // Secondary
        'secondary': { value: '#625B71', type: 'color', role: 'Secondary actions' },
        'on-secondary': { value: '#FFFFFF', type: 'color', role: 'Text on secondary' },
        'secondary-container': { value: '#E8DEF8', type: 'color', role: 'Secondary container' },
        'on-secondary-container': { value: '#1D192B', type: 'color', role: 'Text on secondary container' },

        // Tertiary
        'tertiary': { value: '#7D5260', type: 'color', role: 'Tertiary accent' },
        'on-tertiary': { value: '#FFFFFF', type: 'color', role: 'Text on tertiary' },
        'tertiary-container': { value: '#FFD8E4', type: 'color', role: 'Tertiary container' },

        // Error
        'error': { value: '#B3261E', type: 'color', role: 'Error states' },
        'on-error': { value: '#FFFFFF', type: 'color', role: 'Text on error' },
        'error-container': { value: '#F9DEDC', type: 'color', role: 'Error container' },

        // Surface (Light theme)
        'surface': { value: '#FFFBFE', type: 'color', role: 'Background surface' },
        'on-surface': { value: '#1C1B1F', type: 'color', role: 'Text on surface' },
        'surface-variant': { value: '#E7E0EC', type: 'color', role: 'Surface variant' },
        'on-surface-variant': { value: '#49454F', type: 'color', role: 'Text on surface variant' },

        // Outline
        'outline': { value: '#79747E', type: 'color', role: 'Borders and dividers' },
        'outline-variant': { value: '#CAC4D0', type: 'color', role: 'Subtle borders' },
    },

    elevation: {
        'level-0': { value: 'none', dp: 0 },
        'level-1': { value: '0 1px 2px 0 rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)', dp: 1 },
        'level-2': { value: '0 1px 2px 0 rgba(0,0,0,0.3), 0 2px 6px 2px rgba(0,0,0,0.15)', dp: 3 },
        'level-3': { value: '0 4px 8px 3px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.3)', dp: 6 },
        'level-4': { value: '0 6px 10px 4px rgba(0,0,0,0.15), 0 2px 3px rgba(0,0,0,0.3)', dp: 8 },
        'level-5': { value: '0 8px 12px 6px rgba(0,0,0,0.15), 0 4px 4px rgba(0,0,0,0.3)', dp: 12 },
    },

    typography: {
        'display-large': { fontSize: 57, lineHeight: 64, fontWeight: 400, letterSpacing: -0.25 },
        'display-medium': { fontSize: 45, lineHeight: 52, fontWeight: 400, letterSpacing: 0 },
        'display-small': { fontSize: 36, lineHeight: 44, fontWeight: 400, letterSpacing: 0 },
        'headline-large': { fontSize: 32, lineHeight: 40, fontWeight: 400, letterSpacing: 0 },
        'headline-medium': { fontSize: 28, lineHeight: 36, fontWeight: 400, letterSpacing: 0 },
        'headline-small': { fontSize: 24, lineHeight: 32, fontWeight: 400, letterSpacing: 0 },
        'title-large': { fontSize: 22, lineHeight: 28, fontWeight: 400, letterSpacing: 0 },
        'title-medium': { fontSize: 16, lineHeight: 24, fontWeight: 500, letterSpacing: 0.15 },
        'title-small': { fontSize: 14, lineHeight: 20, fontWeight: 500, letterSpacing: 0.1 },
        'body-large': { fontSize: 16, lineHeight: 24, fontWeight: 400, letterSpacing: 0.5 },
        'body-medium': { fontSize: 14, lineHeight: 20, fontWeight: 400, letterSpacing: 0.25 },
        'body-small': { fontSize: 12, lineHeight: 16, fontWeight: 400, letterSpacing: 0.4 },
        'label-large': { fontSize: 14, lineHeight: 20, fontWeight: 500, letterSpacing: 0.1 },
        'label-medium': { fontSize: 12, lineHeight: 16, fontWeight: 500, letterSpacing: 0.5 },
        'label-small': { fontSize: 11, lineHeight: 16, fontWeight: 500, letterSpacing: 0.5 },
    },

    shape: {
        'corner-none': { value: '0px' },
        'corner-extra-small': { value: '4px' },
        'corner-small': { value: '8px' },
        'corner-medium': { value: '12px' },
        'corner-large': { value: '16px' },
        'corner-extra-large': { value: '28px' },
        'corner-full': { value: '9999px' },
    },

    spacing: {
        'compact': 4,
        'medium': 8,
        'expanded': 12,
        'large': 16,
        'extra-large': 24,
    },

    stateLayer: {
        'hover': 0.08,
        'focus': 0.12,
        'pressed': 0.12,
        'dragged': 0.16,
    },
};

// ============================================
// TAILWIND CSS (Default Palette)
// ============================================

export const TAILWIND_TOKENS = {
    name: 'Tailwind CSS',
    version: '3.4',
    source: 'https://tailwindcss.com',

    colors: {
        // Slate
        'slate-50': '#f8fafc', 'slate-100': '#f1f5f9', 'slate-200': '#e2e8f0',
        'slate-300': '#cbd5e1', 'slate-400': '#94a3b8', 'slate-500': '#64748b',
        'slate-600': '#475569', 'slate-700': '#334155', 'slate-800': '#1e293b',
        'slate-900': '#0f172a', 'slate-950': '#020617',

        // Gray
        'gray-50': '#f9fafb', 'gray-100': '#f3f4f6', 'gray-200': '#e5e7eb',
        'gray-300': '#d1d5db', 'gray-400': '#9ca3af', 'gray-500': '#6b7280',
        'gray-600': '#4b5563', 'gray-700': '#374151', 'gray-800': '#1f2937',
        'gray-900': '#111827', 'gray-950': '#030712',

        // Zinc (Modern neutral)
        'zinc-50': '#fafafa', 'zinc-100': '#f4f4f5', 'zinc-200': '#e4e4e7',
        'zinc-300': '#d4d4d8', 'zinc-400': '#a1a1aa', 'zinc-500': '#71717a',
        'zinc-600': '#52525b', 'zinc-700': '#3f3f46', 'zinc-800': '#27272a',
        'zinc-900': '#18181b', 'zinc-950': '#09090b',

        // Blue
        'blue-50': '#eff6ff', 'blue-100': '#dbeafe', 'blue-200': '#bfdbfe',
        'blue-300': '#93c5fd', 'blue-400': '#60a5fa', 'blue-500': '#3b82f6',
        'blue-600': '#2563eb', 'blue-700': '#1d4ed8', 'blue-800': '#1e40af',
        'blue-900': '#1e3a8a', 'blue-950': '#172554',

        // Indigo
        'indigo-50': '#eef2ff', 'indigo-100': '#e0e7ff', 'indigo-200': '#c7d2fe',
        'indigo-300': '#a5b4fc', 'indigo-400': '#818cf8', 'indigo-500': '#6366f1',
        'indigo-600': '#4f46e5', 'indigo-700': '#4338ca', 'indigo-800': '#3730a3',
        'indigo-900': '#312e81', 'indigo-950': '#1e1b4b',

        // Violet
        'violet-50': '#f5f3ff', 'violet-100': '#ede9fe', 'violet-200': '#ddd6fe',
        'violet-300': '#c4b5fd', 'violet-400': '#a78bfa', 'violet-500': '#8b5cf6',
        'violet-600': '#7c3aed', 'violet-700': '#6d28d9', 'violet-800': '#5b21b6',
        'violet-900': '#4c1d95', 'violet-950': '#2e1065',

        // Purple
        'purple-500': '#a855f7', 'purple-600': '#9333ea',

        // Pink
        'pink-500': '#ec4899', 'pink-600': '#db2777',

        // Rose
        'rose-500': '#f43f5e', 'rose-600': '#e11d48',

        // Red
        'red-50': '#fef2f2', 'red-100': '#fee2e2', 'red-200': '#fecaca',
        'red-500': '#ef4444', 'red-600': '#dc2626', 'red-700': '#b91c1c',

        // Orange
        'orange-500': '#f97316', 'orange-600': '#ea580c',

        // Amber
        'amber-500': '#f59e0b', 'amber-600': '#d97706',

        // Yellow
        'yellow-500': '#eab308', 'yellow-600': '#ca8a04',

        // Green
        'green-50': '#f0fdf4', 'green-100': '#dcfce7', 'green-200': '#bbf7d0',
        'green-500': '#22c55e', 'green-600': '#16a34a', 'green-700': '#15803d',

        // Emerald
        'emerald-500': '#10b981', 'emerald-600': '#059669',

        // Teal
        'teal-500': '#14b8a6', 'teal-600': '#0d9488',

        // Cyan
        'cyan-500': '#06b6d4', 'cyan-600': '#0891b2',

        // Sky
        'sky-500': '#0ea5e9', 'sky-600': '#0284c7',
    },

    spacing: {
        '0': '0px', '0.5': '0.125rem', '1': '0.25rem', '1.5': '0.375rem',
        '2': '0.5rem', '2.5': '0.625rem', '3': '0.75rem', '3.5': '0.875rem',
        '4': '1rem', '5': '1.25rem', '6': '1.5rem', '7': '1.75rem',
        '8': '2rem', '9': '2.25rem', '10': '2.5rem', '11': '2.75rem',
        '12': '3rem', '14': '3.5rem', '16': '4rem', '20': '5rem',
        '24': '6rem', '28': '7rem', '32': '8rem', '36': '9rem',
        '40': '10rem', '44': '11rem', '48': '12rem', '52': '13rem',
        '56': '14rem', '60': '15rem', '64': '16rem', '72': '18rem',
        '80': '20rem', '96': '24rem',
    },

    fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
    },

    borderRadius: {
        'none': '0px',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
    },

    boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'none': 'none',
    },
};

// ============================================
// SHADCN/UI (Radix Primitives + Tailwind)
// ============================================

export const SHADCN_TOKENS = {
    name: 'shadcn/ui',
    version: '0.8',
    source: 'https://ui.shadcn.com',

    // CSS Variables schema (HSL format)
    cssVariables: {
        light: {
            '--background': '0 0% 100%',
            '--foreground': '222.2 84% 4.9%',
            '--card': '0 0% 100%',
            '--card-foreground': '222.2 84% 4.9%',
            '--popover': '0 0% 100%',
            '--popover-foreground': '222.2 84% 4.9%',
            '--primary': '222.2 47.4% 11.2%',
            '--primary-foreground': '210 40% 98%',
            '--secondary': '210 40% 96.1%',
            '--secondary-foreground': '222.2 47.4% 11.2%',
            '--muted': '210 40% 96.1%',
            '--muted-foreground': '215.4 16.3% 46.9%',
            '--accent': '210 40% 96.1%',
            '--accent-foreground': '222.2 47.4% 11.2%',
            '--destructive': '0 84.2% 60.2%',
            '--destructive-foreground': '210 40% 98%',
            '--border': '214.3 31.8% 91.4%',
            '--input': '214.3 31.8% 91.4%',
            '--ring': '222.2 84% 4.9%',
            '--radius': '0.5rem',
        },
        dark: {
            '--background': '222.2 84% 4.9%',
            '--foreground': '210 40% 98%',
            '--card': '222.2 84% 4.9%',
            '--card-foreground': '210 40% 98%',
            '--popover': '222.2 84% 4.9%',
            '--popover-foreground': '210 40% 98%',
            '--primary': '210 40% 98%',
            '--primary-foreground': '222.2 47.4% 11.2%',
            '--secondary': '217.2 32.6% 17.5%',
            '--secondary-foreground': '210 40% 98%',
            '--muted': '217.2 32.6% 17.5%',
            '--muted-foreground': '215 20.2% 65.1%',
            '--accent': '217.2 32.6% 17.5%',
            '--accent-foreground': '210 40% 98%',
            '--destructive': '0 62.8% 30.6%',
            '--destructive-foreground': '210 40% 98%',
            '--border': '217.2 32.6% 17.5%',
            '--input': '217.2 32.6% 17.5%',
            '--ring': '212.7 26.8% 83.9%',
        },
    },

    // Component variants
    components: {
        button: {
            variants: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
            sizes: ['default', 'sm', 'lg', 'icon'],
            defaultClasses: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        },
        input: {
            defaultClasses: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        },
        card: {
            defaultClasses: 'rounded-lg border bg-card text-card-foreground shadow-sm',
        },
        badge: {
            variants: ['default', 'secondary', 'destructive', 'outline'],
            defaultClasses: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        },
    },
};

// ============================================
// UNTITLED UI (Popular Figma Kit)
// ============================================

export const UNTITLED_UI_TOKENS = {
    name: 'Untitled UI',
    version: '4.0',
    source: 'https://www.untitledui.com',

    colors: {
        // Gray (Cool Gray)
        'gray-25': '#FCFCFD',
        'gray-50': '#F9FAFB',
        'gray-100': '#F2F4F7',
        'gray-200': '#EAECF0',
        'gray-300': '#D0D5DD',
        'gray-400': '#98A2B3',
        'gray-500': '#667085',
        'gray-600': '#475467',
        'gray-700': '#344054',
        'gray-800': '#1D2939',
        'gray-900': '#101828',
        'gray-950': '#0C111D',

        // Primary (Brand)
        'primary-25': '#FCFAFF',
        'primary-50': '#F9F5FF',
        'primary-100': '#F4EBFF',
        'primary-200': '#E9D7FE',
        'primary-300': '#D6BBFB',
        'primary-400': '#B692F6',
        'primary-500': '#9E77ED',
        'primary-600': '#7F56D9',
        'primary-700': '#6941C6',
        'primary-800': '#53389E',
        'primary-900': '#42307D',

        // Error
        'error-25': '#FFFBFA',
        'error-50': '#FEF3F2',
        'error-500': '#F04438',
        'error-600': '#D92D20',
        'error-700': '#B42318',

        // Warning
        'warning-25': '#FFFCF5',
        'warning-50': '#FFFAEB',
        'warning-500': '#F79009',
        'warning-600': '#DC6803',
        'warning-700': '#B54708',

        // Success
        'success-25': '#F6FEF9',
        'success-50': '#ECFDF3',
        'success-500': '#12B76A',
        'success-600': '#039855',
        'success-700': '#027A48',
    },

    typography: {
        'display-2xl': { fontSize: 72, lineHeight: 90, letterSpacing: -2 },
        'display-xl': { fontSize: 60, lineHeight: 72, letterSpacing: -2 },
        'display-lg': { fontSize: 48, lineHeight: 60, letterSpacing: -2 },
        'display-md': { fontSize: 36, lineHeight: 44, letterSpacing: -2 },
        'display-sm': { fontSize: 30, lineHeight: 38 },
        'display-xs': { fontSize: 24, lineHeight: 32 },
        'text-xl': { fontSize: 20, lineHeight: 30 },
        'text-lg': { fontSize: 18, lineHeight: 28 },
        'text-md': { fontSize: 16, lineHeight: 24 },
        'text-sm': { fontSize: 14, lineHeight: 20 },
        'text-xs': { fontSize: 12, lineHeight: 18 },
    },

    spacing: {
        'none': 0,
        'xxs': 2,
        'xs': 4,
        'sm': 6,
        'md': 8,
        'lg': 12,
        'xl': 16,
        '2xl': 20,
        '3xl': 24,
        '4xl': 32,
        '5xl': 40,
        '6xl': 48,
        '7xl': 64,
        '8xl': 80,
        '9xl': 96,
        '10xl': 128,
        '11xl': 160,
    },

    borderRadius: {
        'none': 0,
        'xxs': 2,
        'xs': 4,
        'sm': 6,
        'md': 8,
        'lg': 10,
        'xl': 12,
        '2xl': 16,
        '3xl': 20,
        '4xl': 24,
        'full': 9999,
    },

    shadows: {
        'xs': '0px 1px 2px rgba(16, 24, 40, 0.05)',
        'sm': '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',
        'md': '0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)',
        'lg': '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
        'xl': '0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03)',
        '2xl': '0px 24px 48px -12px rgba(16, 24, 40, 0.18)',
        '3xl': '0px 32px 64px -12px rgba(16, 24, 40, 0.14)',
    },
};

// ============================================
// DESIGN SYSTEM REGISTRY
// ============================================

export const DESIGN_SYSTEMS = {
    'material-design-3': MATERIAL_DESIGN_3,
    'tailwind': TAILWIND_TOKENS,
    'shadcn': SHADCN_TOKENS,
    'untitled-ui': UNTITLED_UI_TOKENS,
} as const;

export type DesignSystemName = keyof typeof DESIGN_SYSTEMS;

export function getDesignSystem(name: DesignSystemName) {
    return DESIGN_SYSTEMS[name];
}

export function getAllDesignSystems() {
    return Object.keys(DESIGN_SYSTEMS) as DesignSystemName[];
}

// ============================================
// CONTEXT BUILDER FOR GEMINI
// ============================================

export function buildDesignSystemContext(systemName: DesignSystemName): string {
    const system = DESIGN_SYSTEMS[systemName];

    return `
DESIGN SYSTEM REFERENCE: ${system.name} (v${system.version})
Source: ${system.source}

You should use these tokens as a reference for creating professional designs.
When generating colors, spacing, typography, or shadows, prefer using values
from this system to ensure consistency and accessibility.

${JSON.stringify(system, null, 2)}
`.trim();
}

export function buildCombinedContext(systems: DesignSystemName[]): string {
    const contexts = systems.map(s => buildDesignSystemContext(s));

    return `
DESIGN TOKEN LIBRARIES
You have access to the following world-class design systems.
Use them as reference for professional-quality design decisions.

${contexts.join('\n\n---\n\n')}
`.trim();
}
