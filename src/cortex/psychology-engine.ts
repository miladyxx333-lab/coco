/**
 * DESIGN PSYCHOLOGY ENGINE
 * Applies psychological principles to design decisions
 * "Intuitive design through cognitive science"
 */

// ============================================
// PSYCHOLOGY RULES
// ============================================

export interface PsychologyRule {
    property: string;
    value: string | number;
    reason: string;
    cognitiveEffect: string;
    source: string; // Research reference
}

export interface ProductTypeProfile {
    type: string;
    keywords: string[];
    emotionalGoal: string;
    rules: PsychologyRule[];
}

/**
 * Design psychology database based on cognitive science research
 */
export const PSYCHOLOGY_PROFILES: ProductTypeProfile[] = [
    {
        type: 'health',
        keywords: ['health', 'salud', 'medical', 'wellness', 'fitness', 'mental', 'therapy', 'care', 'hospital', 'clinic'],
        emotionalGoal: 'Calma, confianza y seguridad',
        rules: [
            {
                property: 'borderRadius',
                value: '16-24px',
                reason: 'Curvas suaves activan el sistema parasimpático, reduciendo estrés',
                cognitiveEffect: 'Reduced threat perception',
                source: 'Bar & Neta, 2006 - Preference for curved objects'
            },
            {
                property: 'primaryColor',
                value: '#10B981',
                reason: 'Verde evoca naturaleza, salud y crecimiento orgánico',
                cognitiveEffect: 'Association with vitality and healing',
                source: 'Color psychology - Green = growth, harmony'
            },
            {
                property: 'spacing',
                value: 'generous (24-32px)',
                reason: 'Espacios amplios reducen carga cognitiva y transmiten orden',
                cognitiveEffect: 'Lower cognitive load, breathing room',
                source: 'Whitespace research - Clean layouts reduce anxiety'
            },
            {
                property: 'typography',
                value: 'rounded sans-serif',
                reason: 'Formas redondeadas en letras refuerzan sensación de suavidad',
                cognitiveEffect: 'Perceived warmth and approachability',
                source: 'Font personality studies'
            },
            {
                property: 'imagery',
                value: 'soft, natural lighting',
                reason: 'Luz natural evoca ambientes seguros y conocidos',
                cognitiveEffect: 'Familiarity and comfort',
                source: 'Environmental psychology'
            }
        ]
    },
    {
        type: 'fintech',
        keywords: ['fintech', 'bank', 'finance', 'payment', 'crypto', 'invest', 'money', 'trading', 'wallet', 'insurance'],
        emotionalGoal: 'Confianza, seguridad y profesionalismo',
        rules: [
            {
                property: 'borderRadius',
                value: '8-12px',
                reason: 'Bordes más definidos transmiten precisión y control',
                cognitiveEffect: 'Perception of accuracy and reliability',
                source: 'Angular shapes = competence perception'
            },
            {
                property: 'primaryColor',
                value: '#0F4C81',
                reason: 'Azul activa asociaciones con estabilidad bancaria tradicional',
                cognitiveEffect: 'Trust, security, depth',
                source: 'Color psychology - Blue = trust, stability'
            },
            {
                property: 'spacing',
                value: 'structured (16-24px)',
                reason: 'Grids consistentes transmiten orden y organización',
                cognitiveEffect: 'Grid structure = systematic thinking',
                source: 'Visual hierarchy research'
            },
            {
                property: 'typography',
                value: 'geometric sans-serif',
                reason: 'Tipografías limpias y matemáticas refuerzan precisión',
                cognitiveEffect: 'Technical competence',
                source: 'Plus Jakarta Sans, Inter research'
            },
            {
                property: 'numbers',
                value: 'tabular lining',
                reason: 'Números alineados facilitan comparación de valores',
                cognitiveEffect: 'Easy numerical comparison',
                source: 'Data visualization best practices'
            }
        ]
    },
    {
        type: 'ecommerce',
        keywords: ['shop', 'store', 'ecommerce', 'retail', 'product', 'catalog', 'buy', 'cart', 'checkout', 'marketplace'],
        emotionalGoal: 'Excitación, deseo y urgencia',
        rules: [
            {
                property: 'borderRadius',
                value: '12-16px',
                reason: 'Balance entre accesible y profesional',
                cognitiveEffect: 'Inviting without being childish',
                source: 'E-commerce conversion studies'
            },
            {
                property: 'primaryColor',
                value: '#EC4899',
                reason: 'Colores vibrantes activan respuesta emocional inmediata',
                cognitiveEffect: 'Emotional arousal, desire',
                source: 'Color impact on purchase decisions'
            },
            {
                property: 'spacing',
                value: 'compact (16-20px)',
                reason: 'Densidad de producto aumenta percepción de abundancia',
                cognitiveEffect: 'Abundance = good deal perception',
                source: 'Retail psychology - shelf density'
            },
            {
                property: 'cta',
                value: 'high contrast, large touch target',
                reason: 'CTAs prominentes reducen fricción de compra',
                cognitiveEffect: 'Reduced decision friction',
                source: 'Fitts Law - larger targets = faster actions'
            },
            {
                property: 'socialProof',
                value: 'stars, reviews near CTA',
                reason: 'Social proof reduce incertidumbre de compra',
                cognitiveEffect: 'Herd behavior, trust signals',
                source: 'Cialdini - Social proof principle'
            }
        ]
    },
    {
        type: 'luxury',
        keywords: ['luxury', 'premium', 'exclusive', 'high-end', 'boutique', 'jewelry', 'fashion', 'couture', 'bespoke'],
        emotionalGoal: 'Exclusividad, aspiración y sofisticación',
        rules: [
            {
                property: 'borderRadius',
                value: '0-4px',
                reason: 'Bordes rectos comunican precisión artesanal y timelessness',
                cognitiveEffect: 'Precision = quality craftsmanship',
                source: 'Luxury brand visual language studies'
            },
            {
                property: 'primaryColor',
                value: '#1C1C1C',
                reason: 'Negro transmite poder, exclusividad y sofisticación',
                cognitiveEffect: 'Power, mystery, elegance',
                source: 'Color psychology - Black = premium'
            },
            {
                property: 'spacing',
                value: 'very generous (32-48px)',
                reason: 'Espacio vacío = lujo del espacio, exclusividad',
                cognitiveEffect: 'Scarcity principle - less is more',
                source: 'Luxury retail design principles'
            },
            {
                property: 'typography',
                value: 'serif, light weight',
                reason: 'Serif evoca tradición, artesanía y herencia',
                cognitiveEffect: 'Historical legitimacy, craftsmanship',
                source: 'Playfair Display, Cormorant studies'
            },
            {
                property: 'animation',
                value: 'slow, elegant transitions',
                reason: 'Movimientos lentos transmiten deliberación y cuidado',
                cognitiveEffect: 'Careful consideration = premium',
                source: 'Motion design psychology'
            }
        ]
    },
    {
        type: 'gaming',
        keywords: ['game', 'gaming', 'esport', 'play', 'arcade', 'vr', 'stream', 'twitch', 'discord', 'nft'],
        emotionalGoal: 'Excitación, inmersión y comunidad',
        rules: [
            {
                property: 'borderRadius',
                value: '8-16px',
                reason: 'Variedad crea dinamismo visual y energía',
                cognitiveEffect: 'Visual excitement, energy',
                source: 'Gaming UI research'
            },
            {
                property: 'primaryColor',
                value: '#00F0FF',
                reason: 'Neon estimula sistema nervioso, aumenta alertness',
                cognitiveEffect: 'Arousal, adrenaline, focus',
                source: 'Cyberpunk aesthetic psychology'
            },
            {
                property: 'background',
                value: 'dark (#0A0A0F)',
                reason: 'Dark mode reduce fatiga visual en sesiones largas',
                cognitiveEffect: 'Extended engagement, immersion',
                source: 'Screen time research'
            },
            {
                property: 'effects',
                value: 'glows, particles, motion',
                reason: 'Efectos visuales activan sistema de recompensa dopaminérgico',
                cognitiveEffect: 'Dopamine response, reward anticipation',
                source: 'Game design psychology'
            },
            {
                property: 'typography',
                value: 'futuristic, angular',
                reason: 'Tipografías sci-fi refuerzan inmersión en mundo digital',
                cognitiveEffect: 'World-building, escapism',
                source: 'Orbitron, Rajdhani usage studies'
            }
        ]
    },
    {
        type: 'saas',
        keywords: ['saas', 'software', 'app', 'platform', 'dashboard', 'tool', 'productivity', 'workflow', 'automation'],
        emotionalGoal: 'Eficiencia, claridad y control',
        rules: [
            {
                property: 'borderRadius',
                value: '8-12px',
                reason: 'Balance profesional con modernidad',
                cognitiveEffect: 'Modern but trustworthy',
                source: 'B2B design best practices'
            },
            {
                property: 'primaryColor',
                value: '#3B82F6',
                reason: 'Azul tech balance entre confianza y modernidad',
                cognitiveEffect: 'Tech-forward, reliable',
                source: 'Tailwind Blue - industry standard'
            },
            {
                property: 'spacing',
                value: 'balanced (20-24px)',
                reason: 'Densidad de información sin overwhelm',
                cognitiveEffect: 'Information density optimization',
                source: 'Dashboard UX research'
            },
            {
                property: 'hierarchy',
                value: 'clear visual levels',
                reason: 'Jerarquía clara reduce tiempo de búsqueda',
                cognitiveEffect: 'Faster task completion',
                source: 'F-pattern eye tracking studies'
            },
            {
                property: 'feedback',
                value: 'immediate, visible',
                reason: 'Feedback inmediato confirma acciones del usuario',
                cognitiveEffect: 'Control perception, reduced uncertainty',
                source: 'Nielsen Norman - Visibility of system status'
            }
        ]
    }
];

// ============================================
// PSYCHOLOGY ENGINE
// ============================================

export class DesignPsychologyEngine {
    /**
     * Detect product type from text
     */
    detectProductType(text: string): ProductTypeProfile {
        const textLower = text.toLowerCase();

        for (const profile of PSYCHOLOGY_PROFILES) {
            const matchCount = profile.keywords.filter(kw => textLower.includes(kw)).length;
            if (matchCount > 0) {
                return profile;
            }
        }

        // Default to SaaS
        return PSYCHOLOGY_PROFILES.find(p => p.type === 'saas')!;
    }

    /**
     * Get all psychology rules for a product type
     */
    getRules(productType: string): PsychologyRule[] {
        const profile = PSYCHOLOGY_PROFILES.find(p => p.type === productType);
        return profile?.rules || [];
    }

    /**
     * Generate design recommendations based on text
     */
    analyze(text: string): {
        productType: string;
        emotionalGoal: string;
        rules: PsychologyRule[];
        confidence: number;
        tokenSuggestions: Record<string, string | number>;
    } {
        const profile = this.detectProductType(text);

        // Calculate confidence based on keyword matches
        const textLower = text.toLowerCase();
        const matchCount = profile.keywords.filter(kw => textLower.includes(kw)).length;
        const confidence = Math.min(0.95, 0.5 + (matchCount * 0.15));

        // Generate token suggestions
        const tokenSuggestions: Record<string, string | number> = {};

        for (const rule of profile.rules) {
            if (rule.property === 'primaryColor' && typeof rule.value === 'string' && rule.value.startsWith('#')) {
                tokenSuggestions['colors.primary'] = rule.value;
            }
            if (rule.property === 'borderRadius') {
                const match = String(rule.value).match(/(\d+)/);
                if (match) {
                    tokenSuggestions['borderRadius.default'] = parseInt(match[1]);
                }
            }
        }

        return {
            productType: profile.type,
            emotionalGoal: profile.emotionalGoal,
            rules: profile.rules,
            confidence,
            tokenSuggestions
        };
    }

    /**
     * Generate Gemini context from psychology analysis
     */
    toGeminiContext(analysis: ReturnType<typeof this.analyze>): string {
        return `
DESIGN PSYCHOLOGY ANALYSIS
Product Type: ${analysis.productType.toUpperCase()}
Emotional Goal: ${analysis.emotionalGoal}
Confidence: ${(analysis.confidence * 100).toFixed(0)}%

COGNITIVE DESIGN RULES:
${analysis.rules.map(r => `
• ${r.property.toUpperCase()}: ${r.value}
  Reason: ${r.reason}
  Cognitive Effect: ${r.cognitiveEffect}
  Source: ${r.source}
`).join('')}

Apply these psychology principles when generating the design.
Each choice should reinforce the emotional goal: "${analysis.emotionalGoal}"
`.trim();
    }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const psychologyEngine = new DesignPsychologyEngine();
