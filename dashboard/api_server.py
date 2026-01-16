"""
COCO API Server
WebSocket + REST API for real-time COCO interactions

Run: python dashboard/api_server.py
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import json
import os
import subprocess
import threading
import time
from datetime import datetime
from typing import Dict, Any, Optional

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# ============================================
# COCO STATE MACHINE
# ============================================

class COCOStateMachine:
    """State machine with precise exit triggers"""
    
    STATES = {
        "IDLE": {
            "description": "Esperando entrada del usuario o datos",
            "exit_trigger": "Recepción de Prompt / Data feed",
            "next_states": ["ANALYSIS"]
        },
        "ANALYSIS": {
            "description": "Procesa datos masivos (feedback, métricas)",
            "exit_trigger": "Generación de Design Strategy Document",
            "next_states": ["DRAFTING", "FAIL"]
        },
        "DRAFTING": {
            "description": "Crea el JSON inicial del wireframe",
            "exit_trigger": "Validación de esquema JSON (Self-check)",
            "next_states": ["PENDING_APPROVAL", "FAIL"]
        },
        "PENDING_APPROVAL": {
            "description": "COCO solicita permiso para ejecutar cambios",
            "exit_trigger": "Aprobación humana (Input 'OK')",
            "next_states": ["EXECUTING", "DRAFTING"]
        },
        "EXECUTING": {
            "description": "Escribe en la API de Figma / Genera Código",
            "exit_trigger": "Confirmación de 'Node Created' (Status 200)",
            "next_states": ["SUCCESS", "FAIL"]
        },
        "SUCCESS": {
            "description": "Operación completada exitosamente",
            "exit_trigger": "Reset a IDLE",
            "next_states": ["IDLE"]
        },
        "FAIL": {
            "description": "Error detectado",
            "exit_trigger": "Re-intento automático o Reset",
            "next_states": ["ANALYSIS", "DRAFTING", "IDLE"]
        }
    }
    
    def __init__(self):
        self.current_state = "IDLE"
        self.thinking_log = []
        self.retry_count = 0
        self.max_retries = 3
        self.current_design = None
        self.approval_request = None
    
    def transition(self, new_state: str) -> bool:
        """Transition to new state if valid"""
        if new_state not in self.STATES:
            return False
        
        valid_transitions = self.STATES[self.current_state]["next_states"]
        if new_state not in valid_transitions:
            return False
        
        old_state = self.current_state
        self.current_state = new_state
        
        # Emit state change via WebSocket
        socketio.emit('state_change', {
            'from': old_state,
            'to': new_state,
            'timestamp': datetime.now().isoformat()
        })
        
        return True
    
    def think(self, message: str, detail: str = None, progress: int = None):
        """Add thinking entry and broadcast"""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "state": self.current_state,
            "message": message,
            "detail": detail,
            "progress": progress
        }
        self.thinking_log.append(entry)
        
        # Emit thinking update via WebSocket
        socketio.emit('thinking', entry)
    
    def get_status(self) -> Dict[str, Any]:
        """Get current status"""
        return {
            "state": self.current_state,
            "state_info": self.STATES[self.current_state],
            "thinking_log": self.thinking_log[-10:],  # Last 10 entries
            "retry_count": self.retry_count,
            "has_design": self.current_design is not None,
            "awaiting_approval": self.approval_request is not None
        }
    
    def reset(self):
        """Reset to idle state"""
        self.current_state = "IDLE"
        self.thinking_log = []
        self.retry_count = 0
        self.current_design = None
        self.approval_request = None


# Global state machine instance
coco = COCOStateMachine()


# ============================================
# DESIGN PSYCHOLOGY ENGINE
# ============================================

DESIGN_HEURISTICS = {
    "health": {
        "border_radius": {"value": "16-24px", "reason": "Curvas suaves reducen estrés"},
        "primary_color": {"value": "#10B981", "reason": "Verde evoca salud natural"},
        "spacing": {"value": "generous", "reason": "Espacios amplios dan calma"},
        "typography": {"value": "Inter, Nunito", "reason": "Legible y amigable"},
        "shadow": {"value": "soft", "reason": "Sombras suaves = menos agresivo"}
    },
    "fintech": {
        "border_radius": {"value": "8-12px", "reason": "Profesional y confiable"},
        "primary_color": {"value": "#0F4C81", "reason": "Azul evoca confianza"},
        "spacing": {"value": "structured", "reason": "Orden transmite seguridad"},
        "typography": {"value": "Plus Jakarta Sans", "reason": "Premium y serio"},
        "shadow": {"value": "subtle", "reason": "Elevación sutil = profundidad"}
    },
    "ecommerce": {
        "border_radius": {"value": "12-16px", "reason": "Invitador y accesible"},
        "primary_color": {"value": "#EC4899", "reason": "Vibrante impulsa acción"},
        "spacing": {"value": "compact", "reason": "Densidad de producto"},
        "typography": {"value": "Outfit", "reason": "Moderno y energético"},
        "shadow": {"value": "medium", "reason": "Destacar productos"}
    },
    "luxury": {
        "border_radius": {"value": "0-4px", "reason": "Elegante y minimal"},
        "primary_color": {"value": "#1C1C1C", "reason": "Negro sofisticado"},
        "spacing": {"value": "very_generous", "reason": "Exclusividad"},
        "typography": {"value": "Playfair Display", "reason": "Serif premium"},
        "shadow": {"value": "none", "reason": "Minimalismo extremo"}
    },
    "gaming": {
        "border_radius": {"value": "8-16px", "reason": "Dinámico y energético"},
        "primary_color": {"value": "#00F0FF", "reason": "Neon estimula adrenalina"},
        "spacing": {"value": "variable", "reason": "Efectos dramáticos"},
        "typography": {"value": "Orbitron, Rajdhani", "reason": "Futurista"},
        "shadow": {"value": "glow", "reason": "Neon glow effects"}
    }
}


def detect_product_type(prompt: str) -> str:
    """Detect product type from prompt keywords"""
    prompt_lower = prompt.lower()
    
    keywords = {
        "health": ["health", "salud", "medical", "wellness", "fitness", "mental"],
        "fintech": ["fintech", "bank", "finance", "payment", "crypto", "invest"],
        "ecommerce": ["shop", "store", "ecommerce", "retail", "product", "catalog"],
        "luxury": ["luxury", "premium", "exclusive", "high-end", "boutique"],
        "gaming": ["game", "gaming", "esport", "play", "arcade", "vr"]
    }
    
    for product_type, words in keywords.items():
        if any(word in prompt_lower for word in words):
            return product_type
    
    return "saas"  # Default


def apply_heuristics(prompt: str) -> Dict[str, Any]:
    """Apply design psychology based on prompt"""
    product_type = detect_product_type(prompt)
    heuristics = DESIGN_HEURISTICS.get(product_type, DESIGN_HEURISTICS["saas"])
    
    return {
        "detected_type": product_type,
        "recommendations": heuristics,
        "confidence": 0.85
    }


# ============================================
# REST API ENDPOINTS
# ============================================

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get current COCO status"""
    return jsonify(coco.get_status())


@app.route('/api/generate', methods=['POST'])
def generate_design():
    """Start design generation"""
    data = request.json
    prompt = data.get('prompt', '')
    essence = data.get('essence', None)
    
    if not prompt:
        return jsonify({"error": "Prompt required"}), 400
    
    # Start generation in background
    def run_generation():
        # Transition to ANALYSIS
        coco.transition("ANALYSIS")
        coco.think("Iniciando análisis del brief...", None, 0)
        
        # Apply heuristics
        heuristics = apply_heuristics(prompt)
        coco.think(
            f"Tipo de producto detectado: {heuristics['detected_type']}",
            f"Aplicando {len(heuristics['recommendations'])} reglas de diseño",
            20
        )
        
        time.sleep(1)
        
        # Simulate analysis steps
        coco.think(
            "Analizando 14 flujos de competencia...",
            "80% usa botones flotantes. Integrando en ADN de marca.",
            40
        )
        
        time.sleep(1)
        
        coco.think(
            "Procesando tokens de esencia...",
            f"Esencia: {essence or 'default'}",
            60
        )
        
        time.sleep(0.5)
        
        # Transition to DRAFTING
        coco.transition("DRAFTING")
        coco.think("Generando estructura JSON...", None, 80)
        
        time.sleep(1)
        
        coco.think("Validando esquema...", "Self-check completado", 100)
        
        # Create approval request
        coco.approval_request = {
            "id": f"approval_{int(time.time())}",
            "type": "design_direction",
            "options": ["A", "B", "C"]
        }
        
        coco.transition("PENDING_APPROVAL")
        
        socketio.emit('approval_required', {
            "id": coco.approval_request["id"],
            "message": "COCO ha completado el análisis. Selecciona dirección de diseño.",
            "options": [
                {"id": "A", "label": "Conservadora", "risk": "low"},
                {"id": "B", "label": "Exploratoria", "risk": "medium", "recommended": True},
                {"id": "C", "label": "Optimizada", "risk": "high"}
            ]
        })
    
    thread = threading.Thread(target=run_generation)
    thread.start()
    
    return jsonify({
        "status": "started",
        "message": "Generation initiated"
    })


@app.route('/api/approve', methods=['POST'])
def approve_design():
    """Approve pending design"""
    data = request.json
    approval_id = data.get('approval_id')
    option = data.get('option')
    
    if coco.current_state != "PENDING_APPROVAL":
        return jsonify({"error": "No pending approval"}), 400
    
    coco.think(f"Opción seleccionada: {option}", "Procediendo con ejecución", None)
    coco.transition("EXECUTING")
    
    # Simulate execution
    def execute():
        coco.think("Conectando con Figma API...", None, 10)
        time.sleep(0.5)
        
        coco.think("Creando frame principal...", "1440x900 desktop", 30)
        time.sleep(0.5)
        
        coco.think("Insertando componentes...", "navbar, hero, cta", 60)
        time.sleep(0.5)
        
        coco.think("Aplicando estilos...", "tokens aplicados", 90)
        time.sleep(0.5)
        
        coco.think("Nodos creados exitosamente", "Status 200", 100)
        
        coco.transition("SUCCESS")
        
        socketio.emit('execution_complete', {
            "status": "success",
            "nodes_created": 12,
            "figma_url": "https://figma.com/file/xxx"
        })
    
    thread = threading.Thread(target=execute)
    thread.start()
    
    return jsonify({"status": "executing"})


@app.route('/api/heuristics', methods=['POST'])
def get_heuristics():
    """Get design heuristics for prompt"""
    data = request.json
    prompt = data.get('prompt', '')
    
    result = apply_heuristics(prompt)
    return jsonify(result)


@app.route('/api/reset', methods=['POST'])
def reset_coco():
    """Reset COCO to idle state"""
    coco.reset()
    return jsonify({"status": "reset", "state": "IDLE"})


# ============================================
# WEBSOCKET EVENTS
# ============================================

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    emit('status', coco.get_status())


@socketio.on('subscribe')
def handle_subscribe():
    """Subscribe to COCO updates"""
    emit('subscribed', {"message": "Subscribed to COCO updates"})


# ============================================
# MAIN
# ============================================

if __name__ == '__main__':
    print("🧠 COCO API Server starting...")
    print("   REST API: http://localhost:5000")
    print("   WebSocket: ws://localhost:5000")
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
