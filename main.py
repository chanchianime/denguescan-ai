from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

app = FastAPI(title="DengueScan AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

historial_escaneos = []

class DeteccionCriadero(BaseModel):
    objeto_detectado: str
    confianza: float
    distrito: str

@app.post("/api/escanear")
def registrar_criadero(deteccion: DeteccionCriadero):
    riesgo = "ALTO" if deteccion.confianza >= 0.70 else "MODERADO"
    recomendacion = (
        "Vaciar, escobillar y tapar herméticamente el recipiente de inmediato."
        if riesgo == "ALTO"
        else "Verificar que no acumule agua de lluvia o condensación."
    )
    
    registro = {
        "id": len(historial_escaneos) + 1,
        "objeto": deteccion.objeto_detectado,
        "confianza": f"{round(deteccion.confianza * 100)}%",
        "nivel_riesgo": riesgo,
        "distrito": deteccion.distrito,
        "recomendacion": recomendacion,
        "hora": datetime.now().strftime("%H:%M:%S")
    }
    historial_escaneos.append(registro)
    return {"status": "ok", "analisis": registro}

@app.get("/api/estadisticas")
def obtener_estadisticas():
    return {
        "total_focos_detectados": len(historial_escaneos),
        "ultimos_reportes": historial_escaneos[-5:]
    }