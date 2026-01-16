<p align="center">
  <img src="assets/coco-logo.svg" alt="COCO Logo" width="120" height="120">
</p>

<h1 align="center">COCO</h1>

<p align="center">
  <strong>Component Orchestration & Creative Operations</strong><br>
  AI-powered design infrastructure for shipping pixel-perfect products faster.
</p>

<p align="center">
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#features">Features</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/python-3.9+-green.svg" alt="Python">
  <img src="https://img.shields.io/badge/node-18+-green.svg" alt="Node.js">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
</p>

---

## What is COCO?

COCO is an open source design orchestration engine that transforms ideas into production-ready design tokens, Figma components, and Tailwind code. It bridges the gap between design and development by automating the translation of creative intent into executable infrastructure.

```bash
$ coco "Dashboard for fintech app, dark mode, minimal"

[STATUS: ANALYZING]
◉ COCO_THOUGHT: Detected product type: FINTECH
  └─ Applying trust-blue palette + geometric typography

[STATUS: DRAFTING]
{
  "tokens": {
    "colors.primary": "#0052FF",
    "colors.background": "#18181B",
    "spacing.unit": 8,
    "radius.default": 12
  }
}

✓ tailwind.config.js generated
✓ design-tokens.css generated
✓ figma-variables.json generated

Accessibility: WCAG AA | Contrast: 8.2:1 | Consistency: 100%
```

## Why COCO?

| Problem | COCO Solution |
|---------|---------------|
| Design tokens scattered across files | Single source of truth with automatic sync |
| Figma ↔ Code drift | Visual regression testing catches inconsistencies |
| Manual token translation | AI understands context and generates correct values |
| No design psychology in automation | Built-in heuristics for accessibility and UX |
| Slow handoff process | Direct generation of production-ready code |

## Installation

### Python CLI (Recommended)

```bash
# Clone the repository
git clone https://github.com/miladyxx333-lab/coco.git
cd coco

# Install dependencies
pip install -r requirements.txt

# Run COCO
python coco_os.py "your design prompt"
```

### Node.js CLI

```bash
# Install dependencies
npm install

# Run via npm
npm run dev coco "your design prompt"
```

### Requirements

- Python 3.9+ or Node.js 18+
- Optional: Gemini API key for AI-powered analysis
- Optional: Figma access token for design sync

## Quick Start

### 1. Basic Token Generation

```bash
# Generate tokens from a natural language prompt
python coco_os.py "E-commerce checkout, clean and trustworthy"
```

### 2. Interactive Mode

```bash
# Start COCO in interactive REPL mode
python coco_os.py

COCO> Create a button system for a SaaS dashboard
COCO> status
COCO> apply
```

### 3. Ship to Production

```bash
# Generate all production files at once
python coco_ship.py tokens.json --output ./dist

# Generates:
# - tailwind.config.js
# - design-tokens.css
# - figma-variables.json
# - ThemeProvider.jsx
# - tokens.json (Style Dictionary format)
```

### 4. Visual Regression Testing

```bash
# Compare Figma design vs rendered code
python coco_vision.py compare \
  --figma YOUR_FILE_KEY \
  --node NODE_ID \
  --url http://localhost:3000

# Run in demo mode
python coco_vision.py demo
```

## Features

### 🧠 AI-Powered Analysis

COCO understands design context through natural language. Describe your product, and it applies appropriate design psychology:

```python
# COCO detects "fintech" and applies:
# - Trust-inducing blue tones
# - Geometric sans-serif typography
# - Conservative border radius
# - High contrast for data clarity
```

**Supported Verticals:**
- Fintech & Banking
- Health & Wellness
- E-commerce & Retail
- SaaS & Productivity
- Gaming & Entertainment
- Luxury & Fashion

### 🎨 Design Token Generation

Automatic generation of consistent, scalable tokens:

```json
{
  "colors": {
    "primary": "#0052FF",
    "secondary": "#10B981",
    "background": "#FFFFFF",
    "surface": "#F3F4F6"
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px"
  },
  "borderRadius": {
    "sm": "4px",
    "md": "8px",
    "lg": "12px"
  }
}
```

**Export Formats:**
- Tailwind CSS config
- CSS Custom Properties
- Figma Variables JSON
- Style Dictionary
- React ThemeProvider

### 📐 Figma Integration

Bi-directional sync with Figma:

```bash
# Extract tokens from existing Figma file
npm run figma:extract FILE_KEY

# Push generated tokens back to Figma
npm run figma:push
```

### 🔍 Visual Regression Testing

Ensure design-code fidelity:

```bash
python coco_vision.py compare-local \
  --figma ./design-export.png \
  --url http://localhost:3000/component

# Output:
# Similarity: 97.3%
# Result: PASS
# Discrepancies: 2 minor (shadow blur, 1px offset)
```

**Analysis includes:**
- Pixel-by-pixel comparison
- Perceptual hash matching
- AI-powered semantic analysis (via Gemini Vision)
- WCAG accessibility scoring

### 🌊 Multi-Channel Sync

Webhooks for real-time design system monitoring:

```bash
# Start webhook server
python coco_fluidity.py --webhook-server --port 5001

# Endpoints:
# POST /webhook/github   - Monitor PRs for design violations
# POST /webhook/figma    - Sync component changes
# POST /webhook/notion   - Extract research insights
# POST /webhook/slack    - Team communication alerts
```

### ⚡ Keyboard-First CLI

Power user experience in the terminal:

```bash
$ coco status
  State:      IDLE
  Tokens:     156 loaded
  Components: 3 drafted
  Sync:       connected

$ coco analyze "mobile navigation"
$ coco draft --component Navigation
$ coco apply --confirm
$ coco ship
```

## Architecture

COCO uses a three-layer architecture:

```
┌─────────────────────────────────────────────────────────────┐
│ LAYER 1: SENSORY (Ingesta & Context)                       │
│ ─────────────────────────────────────                       │
│  • Figma REST API extraction                               │
│  • Repository style scanning                                │
│  • Analytics and feedback ingestion                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ LAYER 2: AGENTIC CORE (Intelligence)                       │
│ ───────────────────────────────────                         │
│  • State machine: ANALYZING → DRAFTING → EXECUTING         │
│  • Design psychology heuristics                            │
│  • WCAG accessibility rules                                │
│  • Gemini AI integration                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ LAYER 3: EXECUTIVE (Delivery & Action)                     │
│ ──────────────────────────────────────                      │
│  • Production file generation                              │
│  • GitHub PR creation                                      │
│  • Figma Variable updates                                  │
│  • CI/CD integration                                       │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
coco/
├── coco_os.py           # Main orchestrator (3-layer architecture)
├── coco.py              # Rich CLI with visual workflow
├── coco_ship.py         # Production file generator
├── coco_fluidity.py     # Multi-channel webhook sync
├── coco_vision.py       # Visual regression testing
│
├── src/
│   ├── agents/
│   │   └── coco-agent.ts       # TypeScript COCO agent
│   ├── cortex/
│   │   ├── state-machine.ts    # State management
│   │   ├── coordinator.ts      # Multi-agent coordination
│   │   ├── thinking-ui.ts      # CLI visualization
│   │   └── psychology-engine.ts # Design heuristics
│   └── figma/
│       ├── figma-connector.ts  # Figma API client
│       └── tailwind-generator.ts
│
├── prompts/
│   ├── coco-os-master.md       # System prompt (Power Tool Edition)
│   ├── coco-system.md          # Original system prompt
│   └── coco-style-guide.md     # Communication style guide
│
├── essences/
│   ├── luxury-gold.json        # Premium brand tokens
│   ├── fintech-trust.json      # Banking/finance tokens
│   └── neon-cyber.json         # Gaming/crypto tokens
│
├── dashboard/
│   ├── app.py                  # Streamlit web UI
│   └── api_server.py           # WebSocket API server
│
├── landing/
│   ├── index.html              # Project landing page
│   ├── style.css
│   └── main.js
│
└── output/                     # Generated files
    ├── tailwind.config.js
    ├── design-tokens.css
    └── figma-variables.json
```

## Configuration

### Environment Variables

```bash
# .env file
GEMINI_API_KEY=your_gemini_api_key      # For AI-powered analysis
FIGMA_ACCESS_TOKEN=your_figma_token      # For Figma integration
```

### Custom Tokens

Load your own token library:

```bash
python coco_os.py "your prompt" --tokens ./my-tokens.json
```

Token file format:

```json
{
  "colors": {
    "brand": {
      "primary": "#1A1C1E",
      "accent": "#0052FF"
    }
  },
  "spacing": {
    "unit": 4,
    "scale": [4, 8, 12, 16, 24, 32, 48, 64]
  }
}
```

## Design Essences

Pre-built token libraries for different industries:

### Luxury Gold
```json
{
  "colors.primary": "#1C1C1C",
  "colors.accent": "#B8860B",
  "typography.primary": "Playfair Display",
  "borderRadius.default": "0px"
}
```

### Fintech Trust
```json
{
  "colors.primary": "#0F4C81",
  "colors.success": "#10B981",
  "typography.primary": "Inter",
  "borderRadius.default": "8px"
}
```

### Neon Cyber
```json
{
  "colors.primary": "#0A0A0F",
  "colors.accent": "#00F0FF",
  "typography.primary": "Space Grotesk",
  "borderRadius.default": "4px"
}
```

## API Reference

### Python API

```python
from coco_os import CocoOS
from coco_ship import CocoShip

# Initialize COCO
coco = CocoOS()
coco.initialize()

# Execute a design prompt
output = coco.execute("Dashboard for analytics app")

# Ship to production
ship = CocoShip(output_dir="./dist")
ship.ship_all(output.proposal["tokens"])
```

### CLI Commands

| Command | Description |
|---------|-------------|
| `coco_os.py "prompt"` | Analyze and generate tokens |
| `coco_os.py` | Interactive REPL mode |
| `coco_ship.py tokens.json` | Export to production files |
| `coco_vision.py demo` | Run visual regression demo |
| `coco_fluidity.py --demo` | Test multi-channel sync |

## Roadmap

### ✅ Completed

- [x] Core orchestration engine
- [x] Natural language prompt analysis
- [x] Design token generation
- [x] Tailwind CSS export
- [x] CSS Variables export
- [x] Figma Variables export
- [x] Visual regression testing
- [x] Multi-channel webhooks
- [x] Design psychology engine
- [x] Keyboard-first CLI

### 🚧 In Progress

- [ ] VS Code extension
- [ ] GitHub Action for CI/CD
- [ ] Figma plugin
- [ ] Component code generation

### 📋 Planned

- [ ] React component library generation
- [ ] Vue/Svelte support
- [ ] Design system documentation generator
- [ ] A/B testing integration
- [ ] Analytics-driven optimization

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Clone and install
git clone https://github.com/miladyxx333-lab/coco.git
cd coco
pip install -r requirements.txt
npm install

# Run tests
python -m pytest
npm test

# Start development
python coco_os.py
```

### Areas for Contribution

- 🎨 New design essences
- 🔌 Platform integrations (Webflow, Framer)
- 🌍 Internationalization
- 📚 Documentation improvements
- 🧪 Test coverage

## Support the Project

COCO is free and open source. If it saves you time, consider supporting continued development:

<p align="center">
  <a href="https://github.com/sponsors/miladyxx333-lab">
    <img src="https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?logo=github" alt="GitHub Sponsors">
  </a>
  <a href="https://opensea.io/es/collection/spotpunk">
    <img src="https://img.shields.io/badge/Buy%20me%20a-SpotPunk-00D4FF?logo=opensea" alt="SpotPunk NFT">
  </a>
  <a href="https://www.patreon.com/miladyxx333-lab">
    <img src="https://img.shields.io/badge/Become-Patron-ff424d?logo=patreon" alt="Patreon">
  </a>
</p>

### Sponsor Tiers

| Tier | Price | Benefits |
|------|-------|----------|
| Supporter | $5/mo | Name in CREDITS.md |
| Backer | $20/mo | Logo on README + priority support |
| Sponsor | $100/mo | Logo on landing page + feature requests |

## Community

-  [Twitter](https://x.com/CoyotlCompany) - Follow for updates
- 💡 [Discussions](https://github.com/miladyxx333-lab/coco/discussions) - Ideas and feedback
- 🎨 [SpotPunk NFTs](https://opensea.io/es/collection/spotpunk) - Support with NFTs

## License

MIT License © 2024 COCO Contributors

---

<p align="center">
  <strong>COCO</strong><br>
  <em>"Elegance through Automated Intelligence"</em>
</p>

<p align="center">
  Made with ♥ for the design community
</p>
