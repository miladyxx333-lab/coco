#!/usr/bin/env python3
"""
COCO CLI - Component Orchestration & Creative Operations
Rich Terminal Interface for Agentic Design Workflow

Usage: python coco.py "optimízame el dashboard"
"""

import sys
import time
import json
import os
from datetime import datetime
from typing import Optional, Dict, Any, List

from rich.console import Console
from rich.live import Live
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn
from rich.markdown import Markdown
from rich.syntax import Syntax
from rich.prompt import Prompt, Confirm
from rich.layout import Layout
from rich.text import Text

console = Console()

# ============================================
# BANNER
# ============================================

BANNER = """
[bold cyan]╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ██████╗ ██████╗  ██████╗  ██████╗                          ║
║  ██╔════╝██╔═══██╗██╔════╝ ██╔═══██╗                         ║
║  ██║     ██║   ██║██║      ██║   ██║                         ║
║  ██║     ██║   ██║██║      ██║   ██║                         ║
║  ╚██████╗╚██████╔╝╚██████╗ ╚██████╔╝                         ║
║   ╚═════╝ ╚═════╝  ╚═════╝  ╚═════╝                          ║
║                                                               ║
║   Component Orchestration & Creative Operations v1.0         ║
║   "Elegance through Automated Intelligence"                  ║
╚═══════════════════════════════════════════════════════════════╝[/bold cyan]
"""

# ============================================
# DESIGN PSYCHOLOGY DATABASE
# ============================================

DESIGN_PSYCHOLOGY = {
    "health": {
        "border_radius": "16-24px",
        "primary_color": "#10B981",
        "reasoning": "Curvas suaves activan sistema parasimpático, reduciendo estrés",
        "typography": "Nunito, Inter (rounded sans-serif)"
    },
    "fintech": {
        "border_radius": "8-12px",
        "primary_color": "#0F4C81",
        "reasoning": "Bordes definidos transmiten precisión y control financiero",
        "typography": "Plus Jakarta Sans (geometric)"
    },
    "luxury": {
        "border_radius": "0-4px",
        "primary_color": "#1C1C1C",
        "reasoning": "Bordes rectos comunican precisión artesanal",
        "typography": "Playfair Display (serif premium)"
    },
    "gaming": {
        "border_radius": "8-16px",
        "primary_color": "#00F0FF",
        "reasoning": "Neon estimula sistema nervioso, aumenta alertness",
        "typography": "Orbitron (futuristic)"
    },
    "saas": {
        "border_radius": "8-12px",
        "primary_color": "#3B82F6",
        "reasoning": "Balance profesional con modernidad tech",
        "typography": "Inter (neutral, versatile)"
    }
}

# ============================================
# COCO AGENT CLASS
# ============================================

class CocoAgent:
    """
    COCO Agentic Engine
    State Machine: IDLE → ANALYSIS → DRAFTING → PENDING_APPROVAL → EXECUTING → SUCCESS
    """
    
    def __init__(self):
        self.state = "IDLE"
        self.context = {}
        self.thinking_log: List[Dict] = []
        self.proposals: List[Dict] = []
        self.selected_option = None
        self.essence = "saas"  # Default essence
        
    def log_thought(self, message: str, detail: str = None):
        """Log a thinking step with timestamp"""
        entry = {
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "message": message,
            "detail": detail
        }
        self.thinking_log.append(entry)
        
        # Rich output
        console.print(f"[bold magenta]◉ COCO_THOUGHT:[/bold magenta] [italic]{message}[/italic]")
        if detail:
            console.print(f"  [dim]└─ {detail}[/dim]")
    
    def detect_product_type(self, task: str) -> str:
        """Detect product type from task description"""
        task_lower = task.lower()
        
        keywords = {
            "health": ["health", "salud", "medical", "wellness", "fitness", "mental"],
            "fintech": ["fintech", "bank", "finance", "payment", "crypto", "invest", "dinero"],
            "luxury": ["luxury", "premium", "exclusive", "high-end", "boutique", "lujo"],
            "gaming": ["game", "gaming", "esport", "play", "arcade", "juego"],
            "saas": ["saas", "dashboard", "app", "platform", "tool", "software"]
        }
        
        for product_type, words in keywords.items():
            if any(word in task_lower for word in words):
                return product_type
        
        return "saas"
    
    def render_status_bar(self):
        """Render current state indicator"""
        states = ["IDLE", "ANALYSIS", "DRAFTING", "PENDING_APPROVAL", "EXECUTING", "SUCCESS"]
        
        status_table = Table(show_header=False, box=None, padding=(0, 2))
        for s in states:
            if s == self.state:
                status_table.add_column(f"[bold cyan]◉ {s}[/bold cyan]")
            else:
                status_table.add_column(f"[dim]○ {s}[/dim]")
        
        console.print(status_table)
        console.print()
    
    def run_workflow(self, task: str):
        """Main workflow execution"""
        console.print(BANNER)
        
        # Detect product type
        self.essence = self.detect_product_type(task)
        psychology = DESIGN_PSYCHOLOGY.get(self.essence, DESIGN_PSYCHOLOGY["saas"])
        
        console.print(f"[bold]📋 Tarea:[/bold] {task}")
        console.print(f"[bold]🎨 Esencia detectada:[/bold] [cyan]{self.essence.upper()}[/cyan]")
        console.print()
        
        # ─────────────────────────────────────────────────────
        # 1. ANALYSIS - Procesamiento masivo de datos
        # ─────────────────────────────────────────────────────
        self.state = "ANALYSIS"
        self.render_status_bar()
        
        with Progress(
            SpinnerColumn(style="cyan"),
            TextColumn("{task.description}"),
            BarColumn(complete_style="cyan"),
            TextColumn("[cyan]{task.percentage:>3.0f}%[/cyan]"),
            transient=False,
        ) as progress:
            task_bar = progress.add_task(description="Analizando patrones de datos...", total=100)
            
            # Simulated analysis steps
            steps = [
                ("Extrayendo keywords y objetivos...", 20),
                ("Procesando feedback de usuarios...", 40),
                (f"Aplicando psicología de diseño ({self.essence})...", 60),
                ("Calculando jerarquía visual...", 80),
                ("Generando propuestas de optimización...", 100),
            ]
            
            for msg, pct in steps:
                progress.update(task_bar, advance=pct - progress.tasks[0].completed, description=msg)
                time.sleep(0.5)
        
        console.print()
        
        # Log psychology insight
        self.log_thought(
            f"Aplicando principios de {self.essence.upper()}",
            f"{psychology['reasoning']}"
        )
        self.log_thought(
            "Detectada inconsistencia en el espaciado",
            "Grid de 8px no respetada en componente Card"
        )
        self.log_thought(
            "Analizados 14 flujos de competencia",
            "80% usa botones flotantes. Integrando en ADN de marca."
        )
        
        console.print()
        
        # ─────────────────────────────────────────────────────
        # 2. DRAFTING - Generación de propuestas
        # ─────────────────────────────────────────────────────
        self.state = "DRAFTING"
        self.render_status_bar()
        
        # Build proposals based on psychology
        self.proposals = [
            {
                "id": "01",
                "action": "Update Design Tokens",
                "detail": f"Normalizar paleta a {psychology['primary_color']} como primary",
                "justification": "Compatibilidad Dark Mode + mejor contraste WCAG"
            },
            {
                "id": "02",
                "action": "Refactor Auto-Layout",
                "detail": "Cambiar de fixed a 'Fill Container'",
                "justification": "Responsividad mejorada en breakpoints"
            },
            {
                "id": "03",
                "action": "Optimize Border Radius",
                "detail": f"Aplicar {psychology['border_radius']} en todos los componentes",
                "justification": psychology["reasoning"]
            },
            {
                "id": "04",
                "action": "Gen Micro-copy",
                "detail": "Ajustar mensajes de error según análisis de sentimiento",
                "justification": "Tono más empático basado en logs de usuario"
            },
            {
                "id": "05",
                "action": "Typography Upgrade",
                "detail": f"Migrar a {psychology['typography']}",
                "justification": "Coherencia con vertical de producto"
            }
        ]
        
        # Render proposals table
        console.print(Panel.fit(
            f"Propuesta de Cambios - Branch: [bold]feat/coco-optimization-{datetime.now().strftime('%Y%m%d')}[/bold]",
            title="🔧 COCO v1.0",
            border_style="cyan"
        ))
        
        table = Table(show_header=True, header_style="bold cyan", border_style="dim")
        table.add_column("ID", style="dim", width=4)
        table.add_column("Acción", style="bold", width=25)
        table.add_column("Detalle", width=40)
        table.add_column("Justificación Técnica", style="italic", width=40)
        
        for p in self.proposals:
            table.add_row(p["id"], p["action"], p["detail"], p["justification"])
        
        console.print(table)
        console.print()
        
        # ─────────────────────────────────────────────────────
        # 3. PENDING_APPROVAL - Permission Gate
        # ─────────────────────────────────────────────────────
        self.state = "PENDING_APPROVAL"
        self.render_status_bar()
        
        console.print(Panel(
            "[bold yellow]⊙ APROBACIÓN REQUERIDA[/bold yellow]\n\n"
            "COCO ha identificado 3 posibles direcciones:\n\n"
            "[bold]  [A] Conservadora[/bold] - Solo tokens actuales. [green]Riesgo: Bajo[/green]\n"
            "[bold]  [B] Exploratoria[/bold] - Nuevas variables. [yellow]Riesgo: Medio[/yellow] [cyan]★ RECOMENDADA[/cyan]\n"
            "[bold]  [C] Optimizada[/bold] - Datos de conversión. [red]Riesgo: Alto[/red]",
            border_style="yellow"
        ))
        
        choice = Prompt.ask(
            "\n[bold yellow]¿Proceder con la ejecución?[/bold yellow]",
            choices=["y", "n", "a", "b", "c", "select"],
            default="b"
        )
        
        if choice.lower() in ['y', 'a', 'b', 'c']:
            self.selected_option = choice.upper() if choice in ['a', 'b', 'c'] else 'B'
            self.execute()
        else:
            console.print("[red]❌ Abortado por el usuario.[/red]")
            self.state = "IDLE"
    
    def execute(self):
        """Execute the approved changes"""
        self.state = "EXECUTING"
        self.render_status_bar()
        
        console.print(f"\n[bold cyan]Ejecutando con dirección: {self.selected_option}[/bold cyan]\n")
        
        # Simulated execution with live updates
        execution_steps = [
            ("🔗 Conectando con Figma API...", 1.0),
            ("📦 Actualizando Design Tokens...", 0.8),
            ("🎨 Aplicando estilos a componentes...", 0.8),
            ("📐 Recalculando Auto-Layout...", 0.6),
            ("✍️  Generando especificaciones para Frontend...", 0.8),
            ("📄 Creando documentación técnica...", 0.5),
        ]
        
        with Progress(
            SpinnerColumn(style="green"),
            TextColumn("[progress.description]{task.description}"),
            transient=False,
        ) as progress:
            for step_msg, duration in execution_steps:
                task = progress.add_task(description=step_msg, total=1)
                time.sleep(duration)
                progress.update(task, completed=1)
        
        # Success state
        self.state = "SUCCESS"
        console.print()
        self.render_status_bar()
        
        # Output summary
        console.print(Panel(
            "[bold green]✅ Trabajo completado con éxito[/bold green]\n\n"
            f"[bold]Esencia aplicada:[/bold] {self.essence.upper()}\n"
            f"[bold]Dirección:[/bold] Opción {self.selected_option}\n"
            f"[bold]Propuestas ejecutadas:[/bold] {len(self.proposals)}\n"
            f"[bold]Componentes actualizados:[/bold] 12\n\n"
            "[dim]URL del Frame:[/dim] [link=https://figma.com/file/COCO_PROD_001]https://figma.com/file/COCO_PROD_001[/link]",
            title="📊 Resumen",
            border_style="green"
        ))
        
        # Show generated JSON preview
        output_preview = {
            "metadata": {
                "project": "COCO Optimization",
                "version": "1.0",
                "generatedBy": "COCO v1.0",
                "timestamp": datetime.now().isoformat(),
                "essence": self.essence
            },
            "tokens": {
                "colors": {
                    "primary": DESIGN_PSYCHOLOGY[self.essence]["primary_color"]
                },
                "borderRadius": {
                    "default": DESIGN_PSYCHOLOGY[self.essence]["border_radius"]
                }
            },
            "nodes_updated": len(self.proposals)
        }
        
        console.print("\n[bold]📦 Output JSON:[/bold]")
        console.print(Syntax(json.dumps(output_preview, indent=2), "json", theme="monokai"))
        
        # Next actions
        console.print("\n[bold cyan]Próximos pasos sugeridos:[/bold cyan]")
        console.print("  1. Revisar cambios en Figma")
        console.print("  2. Ejecutar tests de accesibilidad")
        console.print("  3. Exportar tokens a desarrollo")


# ============================================
# MAIN ENTRY POINT
# ============================================

def main():
    agent = CocoAgent()
    
    if len(sys.argv) > 1:
        task = " ".join(sys.argv[1:])
        agent.run_workflow(task)
    else:
        console.print(BANNER)
        console.print("[red]Error:[/red] Por favor ingresa una tarea.\n")
        console.print("[bold]Uso:[/bold]")
        console.print("  python coco.py 'optimízame el dashboard'")
        console.print("  python coco.py 'landing page para app de finanzas'")
        console.print("  python coco.py 'checkout flow para e-commerce de lujo'")
        console.print()
        
        # Interactive mode
        task = Prompt.ask("[bold cyan]¿Qué infraestructura de diseño construimos hoy?[/bold cyan]")
        if task:
            agent.run_workflow(task)


if __name__ == "__main__":
    main()
