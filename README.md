# 🦟 DengueScan AI — Prevención Epidemiológica ante el Fenómeno El Niño

Aplicación web interactiva que utiliza visión computacional en tiempo real para detectar recipientes acumuladores de agua (botellas, tazas, baldes, macetas) y prevenir criaderos del mosquito *Aedes aegypti* en zonas afectadas por lluvias e inundaciones.

## 🚀 Tecnologías Utilizadas
* **Frontend:** HTML5, Tailwind CSS, JavaScript (Webcam API).
* **Inteligencia Artificial:** TensorFlow.js + Modelo neuronal COCO-SSD (ejecución directa en el navegador).
* **Backend:** Python + FastAPI + Uvicorn.

## 📁 Estructura del Proyecto
* `frontend/`: Interfaz visual del escáner biomédico y lógica de detección de objetos en vivo.
* `backend/`: API REST encargada de evaluar el nivel de riesgo epidemiológico y registrar los focos detectados por distrito.

## ⚙️ Cómo Ejecutar en Local

### 1. Iniciar el Backend (Python)
```bash
cd backend
py -m pip install fastapi uvicorn pydantic
py -m uvicorn main:app --reload
