"""
COCO DASHBOARD - Streamlit Agentic Interface
"Elegance through Automated Intelligence"

Run: streamlit run dashboard/app.py
"""

import streamlit as st
import json
import time
import os
from datetime import datetime
from typing import Optional, Dict, Any
import subprocess
import threading

# Page config
st.set_page_config(
    page_title="COCO - Design Orchestrator",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for elegant design
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    .main {
        font-family: 'Inter', sans-serif;
    }
    
    .stApp {
        background: linear-gradient(135deg, #0a0a0f 0%, #1a1a24 100%);
    }
    
    .status-card {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 20px;
        margin: 10px 0;
    }
    
    .thinking-log {
        background: rgba(0,240,255,0.05);
        border-left: 3px solid #00f0ff;
        padding: 15px;
        margin: 8px 0;
        border-radius: 0 8px 8px 0;
        font-family: 'JetBrains Mono', monospace;
        font-size: 13px;
    }
    
    .approval-card {
        background: rgba(255,200,0,0.1);
        border: 1px solid rgba(255,200,0,0.3);
        border-radius: 16px;
        padding: 24px;
        margin: 20px 0;
    }
    
    .option-card {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 16px;
        margin: 8px 0;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .option-card:hover {
        background: rgba(0,240,255,0.1);
        border-color: #00f0ff;
    }
    
    .recommended {
        border-color: #00f0ff !important;
        background: rgba(0,240,255,0.08) !important;
    }
    
    .metric-value {
        font-size: 48px;
        font-weight: 700;
        color: #00f0ff;
    }
    
    .essence-card {
        background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 16px;
        padding: 20px;
        margin: 10px;
        text-align: center;
    }
    
    .price-tag {
        background: linear-gradient(135deg, #00f0ff 0%, #bf00ff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: 24px;
        font-weight: 700;
    }
</style>
""", unsafe_allow_html=True)


# ============================================
# STATE MANAGEMENT
# ============================================

class COCOState:
    IDLE = "IDLE"
    ANALYSIS = "ANALYSIS"
    DRAFTING = "DRAFTING"
    PENDING_APPROVAL = "PENDING_APPROVAL"
    EXECUTING = "EXECUTING"
    SUCCESS = "SUCCESS"
    FAIL = "FAIL"


# Initialize session state
if 'coco_state' not in st.session_state:
    st.session_state.coco_state = COCOState.IDLE
if 'thinking_log' not in st.session_state:
    st.session_state.thinking_log = []
if 'current_design' not in st.session_state:
    st.session_state.current_design = None
if 'selected_essence' not in st.session_state:
    st.session_state.selected_essence = None
if 'approval_request' not in st.session_state:
    st.session_state.approval_request = None


# ============================================
# COCO ENGINE (Simulated)
# ============================================

def add_thinking(message: str, detail: str = None, progress: int = None):
    """Add entry to thinking log"""
    entry = {
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "message": message,
        "detail": detail,
        "progress": progress
    }
    st.session_state.thinking_log.append(entry)


def run_coco_analysis(prompt: str, essence: str = None):
    """Simulate COCO analysis phase"""
    st.session_state.coco_state = COCOState.ANALYSIS
    st.session_state.thinking_log = []
    
    steps = [
        ("Analizando brief del proyecto...", "Extrayendo keywords y objetivos", 10),
        ("Procesando datos de conversión...", "Identificando patrones de abandono", 25),
        ("Consultando librería de componentes...", f"Aplicando esencia: {essence or 'default'}", 40),
        ("Aplicando psicología de diseño...", "Evaluando radios, colores y espaciado", 55),
        ("Calculando jerarquía visual...", "Optimizando para conversión", 70),
        ("Generando estructura JSON...", "Preparando nodos para Figma", 85),
        ("Validando esquema...", "Self-check completado", 100),
    ]
    
    return steps


def get_design_heuristics(product_type: str) -> Dict[str, Any]:
    """Design psychology engine - intuitive choices based on product type"""
    
    heuristics = {
        "health": {
            "border_radius": "16-24px (suave, evoca calma)",
            "primary_color": "#10B981 (verde sanador)",
            "spacing": "Generoso (24-32px, respira)",
            "typography": "Inter/Nunito (legible, amigable)",
            "psychology": "Curvas suaves reducen estrés. Verde evoca salud natural."
        },
        "fintech": {
            "border_radius": "8-12px (profesional, confiable)",
            "primary_color": "#0F4C81 (azul confianza)",
            "spacing": "Estructurado (16-24px, orden)",
            "typography": "Plus Jakarta Sans (premium, serio)",
            "psychology": "Bordes definidos transmiten seguridad. Azul evoca estabilidad."
        },
        "ecommerce": {
            "border_radius": "12-16px (invitador)",
            "primary_color": "#EC4899 (rosa vibrante)",
            "spacing": "Compacto pero claro (16-20px)",
            "typography": "Outfit (moderno, energético)",
            "psychology": "Colores vibrantes impulsan acción. Espacios compactos aumentan densidad de producto."
        },
        "saas": {
            "border_radius": "8-12px (profesional)",
            "primary_color": "#3B82F6 (azul tech)",
            "spacing": "Balanceado (20-24px)",
            "typography": "Inter (neutral, versátil)",
            "psychology": "Diseño limpio reduce fricción cognitiva. Azul evoca tecnología moderna."
        },
        "luxury": {
            "border_radius": "0-4px (elegante, minimal)",
            "primary_color": "#1C1C1C (negro sofisticado)",
            "spacing": "Muy generoso (32-48px, exclusivo)",
            "typography": "Playfair Display (serif premium)",
            "psychology": "Espacios amplios comunican exclusividad. Serif evoca tradición y artesanía."
        },
        "gaming": {
            "border_radius": "8-16px (dinámico)",
            "primary_color": "#00F0FF (neon energético)",
            "spacing": "Variable (efectos dramáticos)",
            "typography": "Orbitron/Rajdhani (futurista)",
            "psychology": "Colores neon estimulan adrenalina. Asimetría crea dinamismo."
        }
    }
    
    # Detect product type from keywords
    product_lower = product_type.lower()
    
    for key in heuristics:
        if key in product_lower:
            return heuristics[key]
    
    # Default to SaaS
    return heuristics["saas"]


# ============================================
# UI COMPONENTS
# ============================================

def render_header():
    """Render the main header"""
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        st.markdown("""
        <div style="text-align: center; padding: 20px 0;">
            <h1 style="font-size: 48px; font-weight: 700; margin: 0;">
                🧠 COCO
            </h1>
            <p style="color: #a0a0b0; font-size: 16px; letter-spacing: 2px;">
                COMPONENT ORCHESTRATION & CREATIVE OPERATIONS
            </p>
        </div>
        """, unsafe_allow_html=True)


def render_status_bar():
    """Render current state indicator"""
    state = st.session_state.coco_state
    
    states = [
        (COCOState.IDLE, "○", "En espera"),
        (COCOState.ANALYSIS, "◈", "Analizando"),
        (COCOState.DRAFTING, "✍", "Diseñando"),
        (COCOState.PENDING_APPROVAL, "⊙", "Esperando"),
        (COCOState.EXECUTING, "▶", "Ejecutando"),
        (COCOState.SUCCESS, "✓", "Completado"),
    ]
    
    cols = st.columns(len(states))
    
    for i, (s, icon, label) in enumerate(states):
        with cols[i]:
            is_active = state == s
            color = "#00f0ff" if is_active else "#404050"
            st.markdown(f"""
            <div style="text-align: center; padding: 10px;">
                <div style="font-size: 24px; color: {color};">{icon}</div>
                <div style="font-size: 12px; color: {color};">{label}</div>
            </div>
            """, unsafe_allow_html=True)


def render_thinking_log():
    """Render the thinking log panel"""
    st.markdown("### 💭 Razonamiento de COCO")
    
    if not st.session_state.thinking_log:
        st.markdown("""
        <div class="thinking-log" style="color: #606070;">
            COCO está esperando instrucciones...
        </div>
        """, unsafe_allow_html=True)
        return
    
    for entry in st.session_state.thinking_log:
        progress_bar = ""
        if entry.get("progress"):
            filled = entry["progress"] // 5
            empty = 20 - filled
            progress_bar = f" [{'█' * filled}{'░' * empty}] {entry['progress']}%"
        
        st.markdown(f"""
        <div class="thinking-log">
            <span style="color: #606070;">{entry['timestamp']}</span>
            <span style="color: #00f0ff;"> ◉ </span>
            <span>{entry['message']}</span>
            <span style="color: #808090;">{progress_bar}</span>
            {f'<br/><span style="color: #606070; padding-left: 60px;">└─ {entry["detail"]}</span>' if entry.get("detail") else ''}
        </div>
        """, unsafe_allow_html=True)


def render_approval_request():
    """Render approval request UI"""
    if st.session_state.coco_state != COCOState.PENDING_APPROVAL:
        return
    
    st.markdown("""
    <div class="approval-card">
        <h3 style="color: #ffc800;">⊙ APROBACIÓN REQUERIDA</h3>
        <p>COCO ha identificado 3 posibles direcciones para tu diseño:</p>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("""
        <div class="option-card">
            <h4>[A] Conservadora</h4>
            <p style="color: #808090;">Basada estrictamente en los tokens actuales.</p>
            <span style="color: #22c55e;">Riesgo: Bajo</span>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Seleccionar A", key="opt_a"):
            st.session_state.coco_state = COCOState.EXECUTING
            st.rerun()
    
    with col2:
        st.markdown("""
        <div class="option-card recommended">
            <h4>[B] Exploratoria ★</h4>
            <p style="color: #808090;">Propone nuevas variables de diseño.</p>
            <span style="color: #f59e0b;">Riesgo: Medio</span>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Seleccionar B ★", key="opt_b", type="primary"):
            st.session_state.coco_state = COCOState.EXECUTING
            st.rerun()
    
    with col3:
        st.markdown("""
        <div class="option-card">
            <h4>[C] Optimizada</h4>
            <p style="color: #808090;">Basada en datos de conversión.</p>
            <span style="color: #ef4444;">Riesgo: Alto</span>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Seleccionar C", key="opt_c"):
            st.session_state.coco_state = COCOState.EXECUTING
            st.rerun()


def render_essence_selector():
    """Render essence pack selector in sidebar"""
    st.sidebar.markdown("### 🎨 Esencias")
    
    essences = {
        "luxury-gold": {"name": "Luxury Gold", "price": "$49", "color": "#D4AF37"},
        "fintech-trust": {"name": "Fintech Trust", "price": "$39", "color": "#0F4C81"},
        "neon-cyber": {"name": "Neon Cyber", "price": "$35", "color": "#00F0FF"},
    }
    
    selected = st.sidebar.radio(
        "Selecciona una esencia:",
        list(essences.keys()),
        format_func=lambda x: f"{essences[x]['name']} ({essences[x]['price']})"
    )
    
    st.session_state.selected_essence = selected
    
    # Show preview
    essence = essences[selected]
    st.sidebar.markdown(f"""
    <div style="
        background: linear-gradient(135deg, {essence['color']}22 0%, transparent 100%);
        border: 1px solid {essence['color']}44;
        border-radius: 12px;
        padding: 16px;
        margin-top: 10px;
    ">
        <div style="color: {essence['color']}; font-weight: 600;">{essence['name']}</div>
        <div class="price-tag">{essence['price']}</div>
    </div>
    """, unsafe_allow_html=True)


def render_heuristics_panel(product_type: str):
    """Render design psychology recommendations"""
    heuristics = get_design_heuristics(product_type)
    
    st.markdown("### 🧪 Intuición de Diseño")
    
    cols = st.columns(2)
    
    with cols[0]:
        st.markdown(f"""
        **Border Radius:** {heuristics['border_radius']}
        
        **Color Primario:** {heuristics['primary_color']}
        
        **Espaciado:** {heuristics['spacing']}
        """)
    
    with cols[1]:
        st.markdown(f"""
        **Tipografía:** {heuristics['typography']}
        
        **Psicología:** {heuristics['psychology']}
        """)


# ============================================
# MAIN APP
# ============================================

def main():
    render_header()
    render_status_bar()
    
    st.markdown("---")
    
    # Sidebar
    render_essence_selector()
    
    st.sidebar.markdown("---")
    st.sidebar.markdown("### ⚙️ Configuración")
    
    auto_approve = st.sidebar.checkbox("Auto-aprobar (sin interrupciones)")
    verbose = st.sidebar.checkbox("Modo verbose", value=True)
    
    # Main content
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.markdown("### 📝 Brief de Diseño")
        
        prompt = st.text_area(
            "¿Qué infraestructura de diseño vamos a construir hoy?",
            placeholder="Ej: Landing page para app de finanzas personales, estilo minimalista, target: millennials...",
            height=100
        )
        
        product_type = st.selectbox(
            "Tipo de producto:",
            ["saas", "fintech", "ecommerce", "health", "luxury", "gaming"]
        )
        
        conversion_goal = st.text_input(
            "Objetivo de conversión:",
            placeholder="Ej: Aumentar signups 20%"
        )
        
        if st.button("🚀 Iniciar Flujo Autónomo", type="primary", use_container_width=True):
            # Start the COCO flow
            steps = run_coco_analysis(prompt, st.session_state.selected_essence)
            
            progress_bar = st.progress(0)
            status_text = st.empty()
            
            for msg, detail, progress in steps:
                add_thinking(msg, detail, progress)
                progress_bar.progress(progress / 100)
                status_text.markdown(f"**{msg}**")
                time.sleep(0.5)
            
            progress_bar.empty()
            status_text.empty()
            
            # Move to approval state
            st.session_state.coco_state = COCOState.PENDING_APPROVAL
            st.rerun()
        
        # Render thinking log
        st.markdown("---")
        render_thinking_log()
        
        # Render approval if needed
        render_approval_request()
        
        # Show execution result
        if st.session_state.coco_state == COCOState.EXECUTING:
            with st.spinner("Ejecutando en Figma API..."):
                time.sleep(2)
            st.session_state.coco_state = COCOState.SUCCESS
            st.success("✅ Diseño generado exitosamente!")
            
            # Show generated output
            st.json({
                "metadata": {
                    "project": prompt[:50] + "..." if len(prompt) > 50 else prompt,
                    "essence": st.session_state.selected_essence,
                    "generatedBy": "COCO v1.0"
                },
                "nodes": [
                    {"id": "navbar_1", "type": "navbar", "status": "created"},
                    {"id": "hero_1", "type": "hero", "status": "created"},
                    {"id": "cta_1", "type": "button", "status": "created"}
                ]
            })
    
    with col2:
        # Design psychology panel
        render_heuristics_panel(product_type)
        
        st.markdown("---")
        
        # Quick stats
        st.markdown("### 📊 Métricas")
        
        st.metric("Confianza", "94%", "+2%")
        st.metric("Nodos generados", "12", "+3")
        st.metric("Tiempo estimado", "2.3s", "-0.5s")


if __name__ == "__main__":
    main()
