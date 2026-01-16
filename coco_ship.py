#!/usr/bin/env python3
"""
COCO SHIP - Production File Generator
Generates real config files from design tokens

Usage:
    from coco_ship import CocoShip
    ship = CocoShip()
    ship.generate_tailwind_config(tokens)
"""

import os
import json
import re
from datetime import datetime
from typing import Dict, Any, Optional, List

# Try to import Google Generative AI
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("⚠️  google-generativeai not installed. Using mock responses.")


class CocoShip:
    """
    COCO Shipping Module
    Exports design tokens to production-ready config files
    """
    
    def __init__(self, agent_name: str = "COCO", output_dir: str = "./output"):
        self.agent = agent_name
        self.output_dir = output_dir
        self.gemini_model = None
        
        # Ensure output directory exists
        os.makedirs(output_dir, exist_ok=True)
        
        # Initialize Gemini if available
        if GEMINI_AVAILABLE:
            api_key = os.getenv("GEMINI_API_KEY")
            if api_key:
                genai.configure(api_key=api_key)
                self.gemini_model = genai.GenerativeModel("gemini-1.5-flash")
                print(f"🧠 [{self.agent}] Gemini API connected")
            else:
                print(f"⚠️  [{self.agent}] GEMINI_API_KEY not set")
    
    # ============================================
    # GEMINI INTEGRATION
    # ============================================
    
    def call_gemini(self, prompt: str) -> str:
        """Call Gemini API with prompt"""
        if self.gemini_model:
            try:
                response = self.gemini_model.generate_content(prompt)
                return response.text
            except Exception as e:
                print(f"❌ [{self.agent}] Gemini error: {e}")
                return None
        return None
    
    # ============================================
    # TAILWIND CONFIG GENERATION
    # ============================================
    
    def generate_tailwind_config(
        self, 
        design_tokens: Dict[str, Any],
        use_gemini: bool = False
    ) -> str:
        """
        Convert design tokens to Tailwind config
        """
        if use_gemini and self.gemini_model:
            return self._generate_tailwind_with_gemini(design_tokens)
        else:
            return self._generate_tailwind_local(design_tokens)
    
    def _generate_tailwind_with_gemini(self, design_tokens: Dict[str, Any]) -> str:
        """Use Gemini to generate Tailwind config"""
        prompt = f"""
You are a Tailwind CSS expert. Convert these design tokens into a valid tailwind.config.js file.

Design Tokens:
{json.dumps(design_tokens, indent=2)}

Requirements:
1. Output ONLY valid JavaScript (no markdown, no explanation)
2. Include all colors mapped to Tailwind color format
3. Include spacing scale
4. Include typography if present
5. Include border radius if present
6. Extend the default theme, don't replace it

Output format:
module.exports = {{
  content: ["./src/**/*.{{js,jsx,ts,tsx}}"],
  theme: {{
    extend: {{
      // your config here
    }}
  }},
  plugins: []
}}
"""
        response = self.call_gemini(prompt)
        
        if response:
            # Clean markdown if present
            response = re.sub(r'^```(?:javascript|js)?\n?', '', response)
            response = re.sub(r'\n?```$', '', response)
            
            filepath = self.write_file("tailwind.config.js", response)
            return filepath
        else:
            return self._generate_tailwind_local(design_tokens)
    
    def _generate_tailwind_local(self, design_tokens: Dict[str, Any]) -> str:
        """Generate Tailwind config locally without Gemini"""
        
        # Extract colors
        colors = {}
        if "colors" in design_tokens:
            for name, value in design_tokens["colors"].items():
                if isinstance(value, dict) and "value" in value:
                    colors[name] = value["value"]
                elif isinstance(value, str):
                    colors[name] = value
        
        # Extract spacing
        spacing = {}
        if "spacing" in design_tokens:
            for name, value in design_tokens["spacing"].items():
                if isinstance(value, dict) and "value" in value:
                    spacing[name] = f"{value['value']}px" if isinstance(value['value'], (int, float)) else value['value']
                elif isinstance(value, (int, float)):
                    spacing[name] = f"{value}px"
                elif isinstance(value, str):
                    spacing[name] = value
        
        # Extract border radius
        border_radius = {}
        if "borderRadius" in design_tokens:
            for name, value in design_tokens["borderRadius"].items():
                if isinstance(value, dict) and "value" in value:
                    border_radius[name] = f"{value['value']}px" if isinstance(value['value'], (int, float)) else value['value']
                elif isinstance(value, (int, float)):
                    border_radius[name] = f"{value}px"
                elif isinstance(value, str):
                    border_radius[name] = value
        
        # Extract typography (font sizes)
        font_size = {}
        if "typography" in design_tokens:
            for name, value in design_tokens["typography"].items():
                if isinstance(value, dict) and "fontSize" in value:
                    size = value["fontSize"]
                    line_height = value.get("lineHeight", 1.5)
                    font_size[name] = [f"{size}px", str(line_height)]
        
        # Build config
        theme_extend = {}
        
        if colors:
            theme_extend["colors"] = colors
        if spacing:
            theme_extend["spacing"] = spacing
        if border_radius:
            theme_extend["borderRadius"] = border_radius
        if font_size:
            theme_extend["fontSize"] = font_size
        
        config = f"""/** @type {{import('tailwindcss').Config}} */
module.exports = {{
  content: [
    "./src/**/*.{{js,jsx,ts,tsx}}",
    "./pages/**/*.{{js,jsx,ts,tsx}}",
    "./components/**/*.{{js,jsx,ts,tsx}}",
  ],
  theme: {{
    extend: {json.dumps(theme_extend, indent=6).replace('"', "'")},
  }},
  plugins: [],
}}
"""
        
        filepath = self.write_file("tailwind.config.js", config)
        return filepath
    
    # ============================================
    # CSS CUSTOM PROPERTIES
    # ============================================
    
    def generate_css_variables(self, design_tokens: Dict[str, Any]) -> str:
        """Generate CSS custom properties from tokens"""
        
        css_lines = [
            "/* Generated by COCO Ship */",
            f"/* {datetime.now().isoformat()} */",
            "",
            ":root {"
        ]
        
        # Process colors
        if "colors" in design_tokens:
            css_lines.append("  /* Colors */")
            for name, value in design_tokens["colors"].items():
                val = value["value"] if isinstance(value, dict) else value
                css_name = self._to_css_var_name(name)
                css_lines.append(f"  --color-{css_name}: {val};")
        
        # Process spacing
        if "spacing" in design_tokens:
            css_lines.append("")
            css_lines.append("  /* Spacing */")
            for name, value in design_tokens["spacing"].items():
                val = value["value"] if isinstance(value, dict) else value
                if isinstance(val, (int, float)):
                    val = f"{val}px"
                css_name = self._to_css_var_name(name)
                css_lines.append(f"  --spacing-{css_name}: {val};")
        
        # Process border radius
        if "borderRadius" in design_tokens:
            css_lines.append("")
            css_lines.append("  /* Border Radius */")
            for name, value in design_tokens["borderRadius"].items():
                val = value["value"] if isinstance(value, dict) else value
                if isinstance(val, (int, float)):
                    val = f"{val}px"
                css_name = self._to_css_var_name(name)
                css_lines.append(f"  --radius-{css_name}: {val};")
        
        # Process typography
        if "typography" in design_tokens:
            css_lines.append("")
            css_lines.append("  /* Typography */")
            for name, value in design_tokens["typography"].items():
                if isinstance(value, dict):
                    css_name = self._to_css_var_name(name)
                    if "fontSize" in value:
                        css_lines.append(f"  --font-size-{css_name}: {value['fontSize']}px;")
                    if "fontWeight" in value:
                        css_lines.append(f"  --font-weight-{css_name}: {value['fontWeight']};")
                    if "lineHeight" in value:
                        css_lines.append(f"  --line-height-{css_name}: {value['lineHeight']};")
        
        # Process shadows
        if "shadows" in design_tokens:
            css_lines.append("")
            css_lines.append("  /* Shadows */")
            for name, value in design_tokens["shadows"].items():
                val = value["value"] if isinstance(value, dict) else value
                css_name = self._to_css_var_name(name)
                css_lines.append(f"  --shadow-{css_name}: {val};")
        
        css_lines.append("}")
        css_content = "\n".join(css_lines)
        
        filepath = self.write_file("design-tokens.css", css_content)
        return filepath
    
    def _to_css_var_name(self, name: str) -> str:
        """Convert name to valid CSS variable name"""
        # Replace dots, slashes with hyphens
        result = re.sub(r'[./]', '-', name)
        # Convert camelCase to kebab-case
        result = re.sub(r'([a-z])([A-Z])', r'\1-\2', result).lower()
        return result
    
    # ============================================
    # FIGMA VARIABLES JSON
    # ============================================
    
    def generate_figma_variables(self, design_tokens: Dict[str, Any]) -> str:
        """Generate Figma Variables JSON format"""
        
        variables = []
        
        # Process colors
        if "colors" in design_tokens:
            for name, value in design_tokens["colors"].items():
                val = value["value"] if isinstance(value, dict) else value
                variables.append({
                    "name": f"colors/{name}",
                    "type": "COLOR",
                    "value": self._hex_to_figma_color(val) if val.startswith("#") else val,
                    "scopes": ["ALL_FILLS", "STROKE_COLOR"]
                })
        
        # Process spacing
        if "spacing" in design_tokens:
            for name, value in design_tokens["spacing"].items():
                val = value["value"] if isinstance(value, dict) else value
                if isinstance(val, str) and val.endswith("px"):
                    val = float(val[:-2])
                variables.append({
                    "name": f"spacing/{name}",
                    "type": "FLOAT",
                    "value": float(val) if isinstance(val, (int, float, str)) else 0,
                    "scopes": ["GAP", "WIDTH_HEIGHT"]
                })
        
        # Process border radius
        if "borderRadius" in design_tokens:
            for name, value in design_tokens["borderRadius"].items():
                val = value["value"] if isinstance(value, dict) else value
                if isinstance(val, str) and val.endswith("px"):
                    val = float(val[:-2])
                variables.append({
                    "name": f"radius/{name}",
                    "type": "FLOAT",
                    "value": float(val) if isinstance(val, (int, float, str)) else 0,
                    "scopes": ["CORNER_RADIUS"]
                })
        
        output = {
            "version": "1.0",
            "generatedBy": f"{self.agent} Ship",
            "timestamp": datetime.now().isoformat(),
            "collections": [
                {
                    "name": "Design Tokens",
                    "modes": [{"name": "Default", "modeId": "default"}],
                    "variables": variables
                }
            ]
        }
        
        filepath = self.write_file("figma-variables.json", json.dumps(output, indent=2))
        return filepath
    
    def _hex_to_figma_color(self, hex_color: str) -> Dict[str, float]:
        """Convert hex color to Figma RGBA format"""
        hex_color = hex_color.lstrip("#")
        
        if len(hex_color) == 6:
            r, g, b = tuple(int(hex_color[i:i+2], 16) / 255 for i in (0, 2, 4))
            return {"r": r, "g": g, "b": b, "a": 1.0}
        elif len(hex_color) == 8:
            r, g, b, a = tuple(int(hex_color[i:i+2], 16) / 255 for i in (0, 2, 4, 6))
            return {"r": r, "g": g, "b": b, "a": a}
        
        return {"r": 0, "g": 0, "b": 0, "a": 1.0}
    
    # ============================================
    # REACT COMPONENT GENERATION
    # ============================================
    
    def generate_theme_provider(self, design_tokens: Dict[str, Any]) -> str:
        """Generate React ThemeProvider component"""
        
        # Extract colors for theme
        colors = {}
        if "colors" in design_tokens:
            for name, value in design_tokens["colors"].items():
                colors[name] = value["value"] if isinstance(value, dict) else value
        
        component = f'''import React, {{ createContext, useContext }} from 'react';

// Generated by COCO Ship
// {datetime.now().isoformat()}

const theme = {{
  colors: {json.dumps(colors, indent=4)},
  spacing: (multiplier) => `${{multiplier * 4}}px`,
}};

const ThemeContext = createContext(theme);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({{ children }}) => {{
  return (
    <ThemeContext.Provider value={{theme}}>
      {{children}}
    </ThemeContext.Provider>
  );
}};

export default theme;
'''
        
        filepath = self.write_file("ThemeProvider.jsx", component)
        return filepath
    
    # ============================================
    # STYLE DICTIONARY FORMAT
    # ============================================
    
    def generate_style_dictionary(self, design_tokens: Dict[str, Any]) -> str:
        """Generate Style Dictionary compatible JSON"""
        
        output = {
            "$metadata": {
                "generatedBy": f"{self.agent} Ship",
                "timestamp": datetime.now().isoformat(),
                "version": "1.0.0"
            }
        }
        
        # Convert to Style Dictionary format
        for category, values in design_tokens.items():
            if isinstance(values, dict):
                output[category] = {}
                for name, value in values.items():
                    if isinstance(value, dict) and "value" in value:
                        output[category][name] = value
                    else:
                        output[category][name] = {
                            "value": value,
                            "type": self._infer_type(category, value)
                        }
        
        filepath = self.write_file("tokens.json", json.dumps(output, indent=2))
        return filepath
    
    def _infer_type(self, category: str, value: Any) -> str:
        """Infer token type from category and value"""
        if category == "colors":
            return "color"
        elif category in ["spacing", "borderRadius"]:
            return "dimension"
        elif category == "typography":
            return "typography"
        elif category == "shadows":
            return "shadow"
        else:
            return "other"
    
    # ============================================
    # SHIP ALL FORMATS
    # ============================================
    
    def ship_all(self, design_tokens: Dict[str, Any], use_gemini: bool = False) -> Dict[str, str]:
        """Generate all output formats"""
        
        print(f"\n🚀 [{self.agent}] Iniciando generación de archivos...\n")
        
        results = {}
        
        # 1. Tailwind Config
        results["tailwind"] = self.generate_tailwind_config(design_tokens, use_gemini)
        
        # 2. CSS Variables
        results["css"] = self.generate_css_variables(design_tokens)
        
        # 3. Figma Variables
        results["figma"] = self.generate_figma_variables(design_tokens)
        
        # 4. Style Dictionary
        results["tokens"] = self.generate_style_dictionary(design_tokens)
        
        # 5. React Theme Provider
        results["react"] = self.generate_theme_provider(design_tokens)
        
        print(f"\n✅ [{self.agent}] {len(results)} archivos generados en {self.output_dir}/\n")
        
        return results
    
    # ============================================
    # FILE OPERATIONS
    # ============================================
    
    def write_file(self, filename: str, content: str) -> str:
        """Write content to file in output directory"""
        filepath = os.path.join(self.output_dir, filename)
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        
        print(f"  📦 [{self.agent}] {filename} generado")
        return filepath


# ============================================
# CLI ENTRY POINT
# ============================================

def main():
    """CLI entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="COCO Ship - Export design tokens to production files")
    parser.add_argument("tokens_file", help="Path to design tokens JSON file")
    parser.add_argument("-o", "--output", default="./output", help="Output directory")
    parser.add_argument("--tailwind", action="store_true", help="Generate Tailwind config only")
    parser.add_argument("--css", action="store_true", help="Generate CSS variables only")
    parser.add_argument("--figma", action="store_true", help="Generate Figma variables only")
    parser.add_argument("--gemini", action="store_true", help="Use Gemini API for generation")
    
    args = parser.parse_args()
    
    # Load tokens
    with open(args.tokens_file, "r") as f:
        tokens = json.load(f)
    
    # Initialize ship
    ship = CocoShip(output_dir=args.output)
    
    # Generate based on flags
    if args.tailwind:
        ship.generate_tailwind_config(tokens, args.gemini)
    elif args.css:
        ship.generate_css_variables(tokens)
    elif args.figma:
        ship.generate_figma_variables(tokens)
    else:
        ship.ship_all(tokens, args.gemini)


if __name__ == "__main__":
    # Demo mode if no args
    import sys
    
    if len(sys.argv) == 1:
        # Demo with sample tokens
        demo_tokens = {
            "colors": {
                "primary": "#3B82F6",
                "secondary": "#10B981",
                "background": "#FFFFFF",
                "surface": "#F3F4F6",
                "text-primary": "#1F2937",
                "text-secondary": "#6B7280"
            },
            "spacing": {
                "xs": 4,
                "sm": 8,
                "md": 16,
                "lg": 24,
                "xl": 32,
                "2xl": 48
            },
            "borderRadius": {
                "sm": 4,
                "md": 8,
                "lg": 12,
                "xl": 16,
                "full": 9999
            },
            "typography": {
                "h1": {"fontSize": 48, "fontWeight": 700, "lineHeight": 1.2},
                "h2": {"fontSize": 36, "fontWeight": 600, "lineHeight": 1.25},
                "body": {"fontSize": 16, "fontWeight": 400, "lineHeight": 1.6}
            },
            "shadows": {
                "sm": "0 1px 2px rgba(0,0,0,0.05)",
                "md": "0 4px 6px rgba(0,0,0,0.1)",
                "lg": "0 10px 15px rgba(0,0,0,0.1)"
            }
        }
        
        ship = CocoShip()
        ship.ship_all(demo_tokens)
    else:
        main()
