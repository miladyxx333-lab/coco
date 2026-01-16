#!/usr/bin/env python3
"""
COCO VISION - Visual Regression Testing Module
Compare Figma designs against rendered code screenshots

Features:
- Figma frame export via REST API
- Puppeteer/Playwright screenshot capture
- Pixel-diff analysis with perceptual hashing
- Gemini Vision for semantic comparison
- Threshold-based pass/fail with detailed reports

Usage:
    python coco_vision.py compare --figma FILE_KEY --node NODE_ID --url http://localhost:3000
    python coco_vision.py audit ./screenshots/
    python coco_vision.py report
"""

import os
import sys
import json
import time
import hashlib
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn
from rich.syntax import Syntax

console = Console()

# ============================================
# CONFIGURATION
# ============================================

VERSION = "1.0.0"
DEFAULT_THRESHOLD = 0.95  # 95% similarity required to pass
OUTPUT_DIR = "./vision-reports"

# ============================================
# DATA STRUCTURES
# ============================================

class ComparisonResult(Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    WARNING = "WARNING"
    ERROR = "ERROR"


@dataclass
class VisualDiff:
    """Result of a visual comparison"""
    id: str
    figma_source: str
    code_source: str
    similarity_score: float
    threshold: float
    result: ComparisonResult
    diff_image_path: Optional[str] = None
    pixel_diff_count: int = 0
    total_pixels: int = 0
    semantic_analysis: Optional[Dict] = None
    timestamp: str = ""
    duration_ms: int = 0
    
    def to_dict(self) -> Dict:
        return {
            **asdict(self),
            "result": self.result.value
        }


@dataclass
class VisionReport:
    """Complete vision audit report"""
    id: str
    timestamp: str
    total_comparisons: int
    passed: int
    failed: int
    warnings: int
    average_similarity: float
    comparisons: List[VisualDiff]
    
    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "timestamp": self.timestamp,
            "summary": {
                "total": self.total_comparisons,
                "passed": self.passed,
                "failed": self.failed,
                "warnings": self.warnings,
                "average_similarity": round(self.average_similarity, 4)
            },
            "comparisons": [c.to_dict() for c in self.comparisons]
        }


# ============================================
# FIGMA EXPORTER
# ============================================

class FigmaExporter:
    """Export frames from Figma as images"""
    
    def __init__(self, access_token: Optional[str] = None):
        self.access_token = access_token or os.getenv("FIGMA_ACCESS_TOKEN")
        self.base_url = "https://api.figma.com/v1"
    
    def _request(self, endpoint: str) -> Dict:
        """Make authenticated request to Figma API"""
        import requests
        
        if not self.access_token:
            raise ValueError("FIGMA_ACCESS_TOKEN not set")
        
        headers = {"X-Figma-Token": self.access_token}
        response = requests.get(f"{self.base_url}/{endpoint}", headers=headers)
        response.raise_for_status()
        return response.json()
    
    def export_frame(
        self, 
        file_key: str, 
        node_id: str, 
        format: str = "png",
        scale: float = 2.0,
        output_path: Optional[str] = None
    ) -> str:
        """Export a specific frame/node from Figma"""
        import requests
        
        console.print(f"[dim]Exporting Figma node: {node_id}[/dim]")
        
        # Get image URL
        endpoint = f"images/{file_key}?ids={node_id}&format={format}&scale={scale}"
        result = self._request(endpoint)
        
        image_url = result.get("images", {}).get(node_id)
        if not image_url:
            raise ValueError(f"Could not get image URL for node {node_id}")
        
        # Download image
        response = requests.get(image_url)
        response.raise_for_status()
        
        # Save to file
        output_path = output_path or f"./vision-reports/figma_{node_id}.png"
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, "wb") as f:
            f.write(response.content)
        
        console.print(f"[green]✓[/green] Figma export saved: {output_path}")
        return output_path
    
    def get_file_info(self, file_key: str) -> Dict:
        """Get file metadata"""
        return self._request(f"files/{file_key}")
    
    def list_frames(self, file_key: str) -> List[Dict]:
        """List all frames in a file"""
        file_data = self.get_file_info(file_key)
        frames = []
        
        def extract_frames(node, parent_name=""):
            if node.get("type") == "FRAME":
                frames.append({
                    "id": node["id"],
                    "name": node["name"],
                    "parent": parent_name,
                    "width": node.get("absoluteBoundingBox", {}).get("width"),
                    "height": node.get("absoluteBoundingBox", {}).get("height")
                })
            
            for child in node.get("children", []):
                extract_frames(child, node.get("name", ""))
        
        document = file_data.get("document", {})
        for page in document.get("children", []):
            extract_frames(page, page.get("name", ""))
        
        return frames


# ============================================
# SCREENSHOT CAPTURER
# ============================================

class ScreenshotCapturer:
    """Capture screenshots from rendered code"""
    
    def __init__(self, method: str = "playwright"):
        self.method = method
        self._check_dependencies()
    
    def _check_dependencies(self):
        """Check if required tools are installed"""
        if self.method == "playwright":
            try:
                import playwright
            except ImportError:
                console.print("[yellow]⚠[/yellow] playwright not installed. Run: pip install playwright && playwright install")
        elif self.method == "puppeteer":
            # Check if puppeteer is available via npx
            pass
    
    def capture(
        self,
        url: str,
        selector: Optional[str] = None,
        viewport: Tuple[int, int] = (1440, 900),
        output_path: Optional[str] = None,
        wait_for: Optional[str] = None,
        delay_ms: int = 500
    ) -> str:
        """Capture screenshot of a URL or element"""
        
        output_path = output_path or f"./vision-reports/code_{int(time.time())}.png"
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        if self.method == "playwright":
            return self._capture_playwright(url, selector, viewport, output_path, wait_for, delay_ms)
        else:
            return self._capture_puppeteer(url, selector, viewport, output_path)
    
    def _capture_playwright(
        self,
        url: str,
        selector: Optional[str],
        viewport: Tuple[int, int],
        output_path: str,
        wait_for: Optional[str],
        delay_ms: int
    ) -> str:
        """Capture using Playwright"""
        try:
            from playwright.sync_api import sync_playwright
            
            with sync_playwright() as p:
                browser = p.chromium.launch()
                page = browser.new_page(viewport={"width": viewport[0], "height": viewport[1]})
                
                page.goto(url)
                
                if wait_for:
                    page.wait_for_selector(wait_for)
                
                time.sleep(delay_ms / 1000)
                
                if selector:
                    element = page.query_selector(selector)
                    if element:
                        element.screenshot(path=output_path)
                    else:
                        page.screenshot(path=output_path)
                else:
                    page.screenshot(path=output_path, full_page=True)
                
                browser.close()
            
            console.print(f"[green]✓[/green] Screenshot captured: {output_path}")
            return output_path
            
        except ImportError:
            console.print("[red]Playwright not available, using fallback[/red]")
            return self._capture_fallback(url, output_path)
    
    def _capture_puppeteer(
        self,
        url: str,
        selector: Optional[str],
        viewport: Tuple[int, int],
        output_path: str
    ) -> str:
        """Capture using Puppeteer via Node.js"""
        script = f"""
const puppeteer = require('puppeteer');
(async () => {{
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({{ width: {viewport[0]}, height: {viewport[1]} }});
    await page.goto('{url}');
    await page.screenshot({{ path: '{output_path}', fullPage: true }});
    await browser.close();
}})();
"""
        
        # Run via npx
        result = subprocess.run(
            ["npx", "-y", "puppeteer", "-e", script],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            console.print(f"[green]✓[/green] Screenshot captured: {output_path}")
            return output_path
        else:
            raise RuntimeError(f"Puppeteer failed: {result.stderr}")
    
    def _capture_fallback(self, url: str, output_path: str) -> str:
        """Fallback using requests + selenium if available"""
        console.print(f"[dim]Fallback capture for {url}[/dim]")
        
        # Create placeholder image
        try:
            from PIL import Image
            img = Image.new('RGB', (1440, 900), color=(240, 240, 240))
            img.save(output_path)
            return output_path
        except ImportError:
            # Create empty file as last resort
            with open(output_path, "wb") as f:
                f.write(b"")
            return output_path


# ============================================
# IMAGE COMPARATOR
# ============================================

class ImageComparator:
    """Compare two images and calculate similarity"""
    
    def __init__(self):
        self._check_dependencies()
    
    def _check_dependencies(self):
        """Check for image processing libraries"""
        try:
            from PIL import Image
            import imagehash
            self.has_imagehash = True
        except ImportError:
            self.has_imagehash = False
            console.print("[yellow]⚠[/yellow] imagehash not installed. Run: pip install imagehash pillow")
    
    def compare(
        self,
        image1_path: str,
        image2_path: str,
        output_diff_path: Optional[str] = None
    ) -> Tuple[float, int, Optional[str]]:
        """
        Compare two images and return similarity score
        
        Returns:
            (similarity_score, pixel_diff_count, diff_image_path)
        """
        try:
            from PIL import Image, ImageChops, ImageDraw
            import numpy as np
        except ImportError:
            console.print("[red]PIL/numpy not available[/red]")
            return 0.5, 0, None
        
        # Load images
        img1 = Image.open(image1_path).convert('RGB')
        img2 = Image.open(image2_path).convert('RGB')
        
        # Resize to same dimensions if needed
        if img1.size != img2.size:
            # Resize img2 to match img1
            img2 = img2.resize(img1.size, Image.Resampling.LANCZOS)
        
        # Calculate pixel difference
        diff = ImageChops.difference(img1, img2)
        
        # Convert to numpy for analysis
        arr1 = np.array(img1)
        arr2 = np.array(img2)
        diff_arr = np.array(diff)
        
        # Calculate metrics
        total_pixels = arr1.shape[0] * arr1.shape[1]
        
        # Pixels with any difference
        diff_mask = np.any(diff_arr > 10, axis=2)  # Threshold of 10 to ignore minor anti-aliasing
        pixel_diff_count = np.sum(diff_mask)
        
        # Calculate similarity score (1 - normalized diff)
        # Using normalized mean squared error
        mse = np.mean((arr1.astype(float) - arr2.astype(float)) ** 2)
        max_mse = 255 ** 2
        similarity = 1 - (mse / max_mse)
        
        # Generate diff image
        diff_image_path = None
        if output_diff_path:
            # Create visual diff with highlighted differences
            diff_img = Image.new('RGB', img1.size)
            
            for y in range(img1.height):
                for x in range(img1.width):
                    p1 = img1.getpixel((x, y))
                    p2 = img2.getpixel((x, y))
                    
                    # Check if pixels are different
                    if sum(abs(a - b) for a, b in zip(p1, p2)) > 30:
                        # Highlight difference in red
                        diff_img.putpixel((x, y), (255, 0, 100))
                    else:
                        # Fade original
                        diff_img.putpixel((x, y), tuple(int(c * 0.3) for c in p1))
            
            diff_img.save(output_diff_path)
            diff_image_path = output_diff_path
            console.print(f"[green]✓[/green] Diff image saved: {output_diff_path}")
        
        return similarity, pixel_diff_count, diff_image_path
    
    def perceptual_hash(self, image_path: str) -> str:
        """Calculate perceptual hash of an image"""
        if not self.has_imagehash:
            return hashlib.md5(open(image_path, 'rb').read()).hexdigest()
        
        import imagehash
        from PIL import Image
        
        img = Image.open(image_path)
        return str(imagehash.phash(img))
    
    def compare_hashes(self, hash1: str, hash2: str) -> float:
        """Compare two perceptual hashes"""
        if not self.has_imagehash:
            return 1.0 if hash1 == hash2 else 0.0
        
        import imagehash
        
        h1 = imagehash.hex_to_hash(hash1)
        h2 = imagehash.hex_to_hash(hash2)
        
        # Hamming distance
        distance = h1 - h2
        max_distance = len(hash1) * 4  # Each hex char = 4 bits
        
        return 1 - (distance / max_distance)


# ============================================
# GEMINI VISION ANALYZER
# ============================================

class GeminiVisionAnalyzer:
    """Use Gemini Vision for semantic comparison"""
    
    def __init__(self):
        self.model = None
        self._init_gemini()
    
    def _init_gemini(self):
        """Initialize Gemini model"""
        try:
            import google.generativeai as genai
            api_key = os.getenv("GEMINI_API_KEY")
            if api_key:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel("gemini-1.5-flash")
                console.print("[green]✓[/green] Gemini Vision connected")
        except ImportError:
            console.print("[yellow]⚠[/yellow] google-generativeai not installed")
    
    def analyze_diff(
        self,
        figma_image_path: str,
        code_image_path: str
    ) -> Dict[str, Any]:
        """Analyze visual differences using Gemini Vision"""
        
        if not self.model:
            return {"error": "Gemini not available"}
        
        try:
            import PIL.Image
            
            figma_img = PIL.Image.open(figma_image_path)
            code_img = PIL.Image.open(code_image_path)
            
            prompt = """
Analiza estas dos imágenes de UI:
- IMAGEN 1: Diseño original de Figma
- IMAGEN 2: Código renderizado

Compara y reporta:

1. LAYOUT ACCURACY (0-100%)
   - Posicionamiento de elementos
   - Espaciado y márgenes
   - Alineación

2. VISUAL FIDELITY (0-100%)
   - Colores (match exacto vs desviaciones)
   - Tipografía (fuente, peso, tamaño)
   - Bordes y sombras

3. COMPONENT INTEGRITY (0-100%)
   - Todos los elementos presentes
   - Jerarquía visual preservada
   - Estados interactivos

4. DISCREPANCIAS CRÍTICAS
   Lista cada diferencia notable:
   - [CRITICAL] si rompe funcionalidad
   - [MAJOR] si afecta UX significativamente
   - [MINOR] si es cosmético

5. RECOMMENDATION
   - SHIP: Listo para producción
   - FIX: Requiere ajustes menores
   - BLOCK: No aprobar hasta corregir

Responde en JSON:
{
  "layout_accuracy": 0-100,
  "visual_fidelity": 0-100,
  "component_integrity": 0-100,
  "overall_score": 0-100,
  "discrepancies": [
    {"level": "CRITICAL|MAJOR|MINOR", "element": "...", "issue": "..."}
  ],
  "recommendation": "SHIP|FIX|BLOCK",
  "summary": "..."
}
"""
            
            response = self.model.generate_content([prompt, figma_img, code_img])
            
            # Parse JSON from response
            import re
            json_match = re.search(r'\{[\s\S]*\}', response.text)
            if json_match:
                return json.loads(json_match.group())
            
            return {"raw": response.text}
            
        except Exception as e:
            return {"error": str(e)}


# ============================================
# COCO VISION MAIN CLASS
# ============================================

class CocoVision:
    """
    COCO Vision - Visual Regression Testing Engine
    """
    
    def __init__(self, threshold: float = DEFAULT_THRESHOLD):
        self.threshold = threshold
        self.figma = FigmaExporter()
        self.capturer = ScreenshotCapturer()
        self.comparator = ImageComparator()
        self.analyzer = GeminiVisionAnalyzer()
        self.reports_dir = Path(OUTPUT_DIR)
        self.reports_dir.mkdir(exist_ok=True)
    
    def compare(
        self,
        figma_file_key: str,
        figma_node_id: str,
        code_url: str,
        selector: Optional[str] = None,
        use_gemini: bool = True
    ) -> VisualDiff:
        """
        Compare Figma design against rendered code
        """
        start_time = time.time()
        
        console.print(Panel(
            "[bold cyan]COCO Vision - Visual Regression Test[/bold cyan]",
            border_style="cyan"
        ))
        
        # Generate unique ID for this comparison
        comparison_id = f"vr_{int(time.time())}_{figma_node_id[:8]}"
        
        with Progress(
            SpinnerColumn(style="cyan"),
            TextColumn("{task.description}"),
            transient=True
        ) as progress:
            
            # Step 1: Export Figma frame
            progress.add_task("Exporting Figma design...", total=None)
            try:
                figma_path = self.figma.export_frame(
                    figma_file_key,
                    figma_node_id,
                    output_path=str(self.reports_dir / f"{comparison_id}_figma.png")
                )
            except Exception as e:
                console.print(f"[red]Figma export failed: {e}[/red]")
                figma_path = None
            
            # Step 2: Capture code screenshot
            progress.add_task("Capturing code screenshot...", total=None)
            try:
                code_path = self.capturer.capture(
                    code_url,
                    selector=selector,
                    output_path=str(self.reports_dir / f"{comparison_id}_code.png")
                )
            except Exception as e:
                console.print(f"[red]Screenshot capture failed: {e}[/red]")
                code_path = None
            
            # Step 3: Compare images
            progress.add_task("Analyzing visual differences...", total=None)
            
            if figma_path and code_path:
                similarity, pixel_diff, diff_path = self.comparator.compare(
                    figma_path,
                    code_path,
                    output_diff_path=str(self.reports_dir / f"{comparison_id}_diff.png")
                )
            else:
                similarity = 0.0
                pixel_diff = 0
                diff_path = None
            
            # Step 4: Gemini semantic analysis
            semantic_analysis = None
            if use_gemini and figma_path and code_path:
                progress.add_task("Running semantic analysis...", total=None)
                semantic_analysis = self.analyzer.analyze_diff(figma_path, code_path)
        
        # Determine result
        if similarity >= self.threshold:
            result = ComparisonResult.PASS
        elif similarity >= self.threshold - 0.1:
            result = ComparisonResult.WARNING
        else:
            result = ComparisonResult.FAIL
        
        # Override with Gemini recommendation if available
        if semantic_analysis and "recommendation" in semantic_analysis:
            if semantic_analysis["recommendation"] == "BLOCK":
                result = ComparisonResult.FAIL
            elif semantic_analysis["recommendation"] == "FIX":
                result = ComparisonResult.WARNING
        
        duration_ms = int((time.time() - start_time) * 1000)
        
        diff = VisualDiff(
            id=comparison_id,
            figma_source=f"{figma_file_key}:{figma_node_id}",
            code_source=code_url,
            similarity_score=similarity,
            threshold=self.threshold,
            result=result,
            diff_image_path=diff_path,
            pixel_diff_count=pixel_diff,
            total_pixels=0,  # Would be set from comparison
            semantic_analysis=semantic_analysis,
            timestamp=datetime.now().isoformat(),
            duration_ms=duration_ms
        )
        
        # Render result
        self._render_result(diff)
        
        # Save report
        self._save_report(diff)
        
        return diff
    
    def compare_local(
        self,
        figma_image_path: str,
        code_url: str,
        selector: Optional[str] = None,
        use_gemini: bool = True
    ) -> VisualDiff:
        """
        Compare a local Figma export against rendered code
        """
        start_time = time.time()
        comparison_id = f"vr_{int(time.time())}"
        
        console.print(Panel(
            "[bold cyan]COCO Vision - Local Comparison[/bold cyan]",
            border_style="cyan"
        ))
        
        # Capture code screenshot
        console.print("[dim]Capturing code screenshot...[/dim]")
        code_path = self.capturer.capture(
            code_url,
            selector=selector,
            output_path=str(self.reports_dir / f"{comparison_id}_code.png")
        )
        
        # Compare images
        console.print("[dim]Analyzing visual differences...[/dim]")
        similarity, pixel_diff, diff_path = self.comparator.compare(
            figma_image_path,
            code_path,
            output_diff_path=str(self.reports_dir / f"{comparison_id}_diff.png")
        )
        
        # Semantic analysis
        semantic_analysis = None
        if use_gemini:
            console.print("[dim]Running semantic analysis...[/dim]")
            semantic_analysis = self.analyzer.analyze_diff(figma_image_path, code_path)
        
        # Determine result
        if similarity >= self.threshold:
            result = ComparisonResult.PASS
        elif similarity >= self.threshold - 0.1:
            result = ComparisonResult.WARNING
        else:
            result = ComparisonResult.FAIL
        
        duration_ms = int((time.time() - start_time) * 1000)
        
        diff = VisualDiff(
            id=comparison_id,
            figma_source=figma_image_path,
            code_source=code_url,
            similarity_score=similarity,
            threshold=self.threshold,
            result=result,
            diff_image_path=diff_path,
            pixel_diff_count=pixel_diff,
            total_pixels=0,
            semantic_analysis=semantic_analysis,
            timestamp=datetime.now().isoformat(),
            duration_ms=duration_ms
        )
        
        self._render_result(diff)
        self._save_report(diff)
        
        return diff
    
    def audit_batch(
        self,
        comparisons: List[Dict],
        use_gemini: bool = True
    ) -> VisionReport:
        """
        Run batch visual regression audit
        
        Args:
            comparisons: List of {figma_file, figma_node, code_url} dicts
        """
        results = []
        
        console.print(Panel(
            f"[bold cyan]COCO Vision - Batch Audit ({len(comparisons)} comparisons)[/bold cyan]",
            border_style="cyan"
        ))
        
        for i, comp in enumerate(comparisons, 1):
            console.print(f"\n[bold]Comparison {i}/{len(comparisons)}[/bold]")
            
            diff = self.compare(
                comp["figma_file"],
                comp["figma_node"],
                comp["code_url"],
                comp.get("selector"),
                use_gemini
            )
            results.append(diff)
        
        # Generate report
        passed = sum(1 for r in results if r.result == ComparisonResult.PASS)
        failed = sum(1 for r in results if r.result == ComparisonResult.FAIL)
        warnings = sum(1 for r in results if r.result == ComparisonResult.WARNING)
        avg_similarity = sum(r.similarity_score for r in results) / len(results) if results else 0
        
        report = VisionReport(
            id=f"audit_{int(time.time())}",
            timestamp=datetime.now().isoformat(),
            total_comparisons=len(results),
            passed=passed,
            failed=failed,
            warnings=warnings,
            average_similarity=avg_similarity,
            comparisons=results
        )
        
        self._render_report(report)
        self._save_full_report(report)
        
        return report
    
    def _render_result(self, diff: VisualDiff):
        """Render single comparison result"""
        
        status_colors = {
            ComparisonResult.PASS: "green",
            ComparisonResult.FAIL: "red",
            ComparisonResult.WARNING: "yellow",
            ComparisonResult.ERROR: "red"
        }
        color = status_colors[diff.result]
        
        console.print(f"\n[bold {color}][{diff.result.value}][/bold {color}] Similarity: {diff.similarity_score:.2%} (threshold: {diff.threshold:.0%})")
        
        # Metrics table
        table = Table(show_header=False, box=None, padding=(0, 2))
        table.add_column("Metric", style="dim")
        table.add_column("Value")
        
        table.add_row("Comparison ID", diff.id)
        table.add_row("Figma Source", diff.figma_source)
        table.add_row("Code Source", diff.code_source)
        table.add_row("Pixel Diff", f"{diff.pixel_diff_count:,}")
        table.add_row("Duration", f"{diff.duration_ms}ms")
        
        console.print(table)
        
        # Semantic analysis
        if diff.semantic_analysis and "overall_score" in diff.semantic_analysis:
            sa = diff.semantic_analysis
            console.print(f"\n[bold]Semantic Analysis:[/bold]")
            console.print(f"  Layout: {sa.get('layout_accuracy', 'N/A')}%")
            console.print(f"  Visual: {sa.get('visual_fidelity', 'N/A')}%")
            console.print(f"  Integrity: {sa.get('component_integrity', 'N/A')}%")
            console.print(f"  Overall: {sa.get('overall_score', 'N/A')}%")
            console.print(f"  Recommendation: [{color}]{sa.get('recommendation', 'N/A')}[/{color}]")
            
            if sa.get("discrepancies"):
                console.print(f"\n[bold]Discrepancies:[/bold]")
                for d in sa["discrepancies"][:5]:
                    level_color = {
                        "CRITICAL": "red",
                        "MAJOR": "yellow",
                        "MINOR": "dim"
                    }.get(d.get("level", ""), "white")
                    console.print(f"  [{level_color}]{d.get('level')}[/{level_color}] {d.get('element')}: {d.get('issue')}")
        
        if diff.diff_image_path:
            console.print(f"\n[dim]Diff image: {diff.diff_image_path}[/dim]")
    
    def _render_report(self, report: VisionReport):
        """Render full audit report"""
        
        console.print(Panel(
            f"[bold cyan]VISION AUDIT REPORT[/bold cyan]\n\n"
            f"Total: {report.total_comparisons} | "
            f"[green]Pass: {report.passed}[/green] | "
            f"[red]Fail: {report.failed}[/red] | "
            f"[yellow]Warning: {report.warnings}[/yellow]\n\n"
            f"Average Similarity: {report.average_similarity:.2%}",
            border_style="cyan"
        ))
        
        # Summary table
        table = Table(title="Comparison Results")
        table.add_column("ID", style="dim")
        table.add_column("Source")
        table.add_column("Similarity")
        table.add_column("Result", justify="center")
        
        for comp in report.comparisons:
            result_color = {
                ComparisonResult.PASS: "green",
                ComparisonResult.FAIL: "red",
                ComparisonResult.WARNING: "yellow"
            }.get(comp.result, "white")
            
            table.add_row(
                comp.id[:12],
                comp.figma_source[:20],
                f"{comp.similarity_score:.2%}",
                f"[{result_color}]{comp.result.value}[/{result_color}]"
            )
        
        console.print(table)
    
    def _save_report(self, diff: VisualDiff):
        """Save single comparison report"""
        report_path = self.reports_dir / f"{diff.id}_report.json"
        with open(report_path, "w") as f:
            json.dump(diff.to_dict(), f, indent=2)
    
    def _save_full_report(self, report: VisionReport):
        """Save full audit report"""
        report_path = self.reports_dir / f"{report.id}.json"
        with open(report_path, "w") as f:
            json.dump(report.to_dict(), f, indent=2)
        console.print(f"\n[green]✓[/green] Report saved: {report_path}")


# ============================================
# CLI
# ============================================

def main():
    import argparse
    
    parser = argparse.ArgumentParser(
        description="COCO Vision - Visual Regression Testing",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Compare Figma design vs rendered code
  python coco_vision.py compare --figma FILE_KEY --node NODE_ID --url http://localhost:3000
  
  # Compare local images
  python coco_vision.py compare-local --figma ./design.png --url http://localhost:3000
  
  # Batch audit from config
  python coco_vision.py audit --config ./vision-tests.json
  
  # Run demo
  python coco_vision.py demo
        """
    )
    
    subparsers = parser.add_subparsers(dest="command")
    
    # Compare command
    compare_parser = subparsers.add_parser("compare", help="Compare Figma vs Code")
    compare_parser.add_argument("--figma", required=True, help="Figma file key")
    compare_parser.add_argument("--node", required=True, help="Figma node ID")
    compare_parser.add_argument("--url", required=True, help="Code URL to screenshot")
    compare_parser.add_argument("--selector", help="CSS selector to capture")
    compare_parser.add_argument("--threshold", type=float, default=0.95, help="Similarity threshold")
    compare_parser.add_argument("--no-gemini", action="store_true", help="Skip Gemini analysis")
    
    # Compare local command
    local_parser = subparsers.add_parser("compare-local", help="Compare local image vs Code")
    local_parser.add_argument("--figma", required=True, help="Path to Figma export image")
    local_parser.add_argument("--url", required=True, help="Code URL to screenshot")
    local_parser.add_argument("--selector", help="CSS selector to capture")
    local_parser.add_argument("--threshold", type=float, default=0.95)
    
    # Audit command
    audit_parser = subparsers.add_parser("audit", help="Batch audit from config")
    audit_parser.add_argument("--config", required=True, help="Path to audit config JSON")
    
    # Demo command
    demo_parser = subparsers.add_parser("demo", help="Run demo comparison")
    
    args = parser.parse_args()
    
    vision = CocoVision(threshold=getattr(args, 'threshold', 0.95))
    
    if args.command == "compare":
        vision.compare(
            args.figma,
            args.node,
            args.url,
            args.selector,
            not args.no_gemini
        )
    
    elif args.command == "compare-local":
        vision.compare_local(
            args.figma,
            args.url,
            args.selector
        )
    
    elif args.command == "audit":
        with open(args.config) as f:
            config = json.load(f)
        vision.audit_batch(config.get("comparisons", []))
    
    elif args.command == "demo":
        run_demo()
    
    else:
        parser.print_help()


def run_demo():
    """Run demo comparison"""
    console.print(Panel(
        "[bold cyan]COCO Vision - Demo Mode[/bold cyan]\n\n"
        "This demo simulates a visual regression test.",
        border_style="cyan"
    ))
    
    vision = CocoVision()
    
    # Create mock images for demo
    try:
        from PIL import Image, ImageDraw, ImageFont
        
        # Create "Figma" design
        figma_img = Image.new('RGB', (400, 300), color=(255, 255, 255))
        draw = ImageDraw.Draw(figma_img)
        draw.rectangle([20, 20, 380, 80], fill=(59, 130, 246))  # Blue button
        draw.rectangle([20, 100, 380, 280], fill=(243, 244, 246))  # Card
        draw.text((180, 40), "Button", fill=(255, 255, 255))
        
        figma_path = "./vision-reports/demo_figma.png"
        os.makedirs("./vision-reports", exist_ok=True)
        figma_img.save(figma_path)
        
        # Create "Code" render (slightly different)
        code_img = Image.new('RGB', (400, 300), color=(255, 255, 255))
        draw = ImageDraw.Draw(code_img)
        draw.rectangle([22, 18, 378, 82], fill=(59, 130, 246))  # Slightly offset
        draw.rectangle([20, 100, 380, 280], fill=(243, 244, 246))
        draw.text((178, 42), "Button", fill=(255, 255, 255))
        
        code_path = "./vision-reports/demo_code.png"
        code_img.save(code_path)
        
        console.print(f"[green]✓[/green] Demo images created")
        
        # Compare
        similarity, diff_count, diff_path = vision.comparator.compare(
            figma_path,
            code_path,
            "./vision-reports/demo_diff.png"
        )
        
        # Show result
        result = ComparisonResult.PASS if similarity >= 0.95 else ComparisonResult.WARNING
        
        console.print(f"\n[bold]Results:[/bold]")
        console.print(f"  Similarity: {similarity:.2%}")
        console.print(f"  Pixel Diff: {diff_count}")
        console.print(f"  Result: [{('green' if result == ComparisonResult.PASS else 'yellow')}]{result.value}[/]")
        console.print(f"\n  Figma: {figma_path}")
        console.print(f"  Code: {code_path}")
        console.print(f"  Diff: {diff_path}")
        
    except ImportError:
        console.print("[yellow]PIL not available for demo[/yellow]")
        console.print("\nTo run full demo, install: pip install pillow imagehash")


if __name__ == "__main__":
    main()
