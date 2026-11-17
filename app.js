const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const badgeEstado = document.getElementById('badge-estado');
const textoRiesgo = document.getElementById('texto-riesgo');
const textoAccion = document.getElementById('texto-accion');
const btnCapturar = document.getElementById('btn-capturar');
const listaReportes = document.getElementById('lista-reportes');
const contadorFocos = document.getElementById('contador-focos');
const selectDistrito = document.getElementById('distrito');

// Objetos que pueden acumular agua y convertirse en criaderos
const OBJETOS_RIESGO = {
  bottle: 'Botella / Envase abierto',
  cup: 'Taza / Recipiente con agua',
  bowl: 'Tazón / Balde pequeño',
  vase: 'Florero / Maceta',
  potted_plant: 'Maceta con plato base'
};

let modelo = null;
let ultimaDeteccion = null;
let totalReportes = 0;

async function iniciarCamara() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment', width: 640, height: 480 },
    audio: false
  });
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      resolve();
    };
  });
}

async function detectarFrame() {
  const predicciones = await modelo.detect(video);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let focoEncontrado = null;

  predicciones.forEach((pred) => {
    const [x, y, width, height] = pred.bbox;
    const esRiesgo = Object.keys(OBJETOS_RIESGO).includes(pred.class);

    if (esRiesgo && pred.score > 0.55) {
      focoEncontrado = {
        nombre: OBJETOS_RIESGO[pred.class],
        confianza: pred.score
      };

      // Dibujar recuadro rojo de alerta estilo escáner
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x, y - 24, width, 24);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`⚠ ${OBJETOS_RIESGO[pred.class]} (${Math.round(pred.score * 100)}%)`, x + 6, y - 7);
    }
  });

  if (focoEncontrado) {
    ultimaDeteccion = focoEncontrado;
    textoRiesgo.textContent = `¡Riesgo: ${focoEncontrado.nombre}!`;
    textoRiesgo.className = 'text-lg font-extrabold text-red-400 mt-0.5';
    textoAccion.textContent = 'Posible acumulador de agua limpia. Voltea, tapa o desecha este recipiente.';
  } else {
    textoRiesgo.textContent = 'Área libre de criaderos visibles';
    textoRiesgo.className = 'text-lg font-extrabold text-emerald-400 mt-0.5';
    textoAccion.textContent = 'Sigue apuntando la cámara hacia patios, techos o recipientes.';
  }

  requestAnimationFrame(detectarFrame);
}

btnCapturar.addEventListener('click', async () => {
  const objetoAEnviar = ultimaDeteccion
    ? ultimaDeteccion.nombre
    : 'Recipiente sospechoso (Manual)';
  const confianzaAEnviar = ultimaDeteccion ? ultimaDeteccion.confianza : 0.85;

  totalReportes++;
  contadorFocos.textContent = totalReportes;
  if (totalReportes === 1) listaReportes.innerHTML = '';

  const item = document.createElement('li');
  item.className = 'p-2 rounded-lg bg-slate-800 border border-slate-700 flex justify-between items-center';
  item.innerHTML = `<span><strong class="text-red-400">Foco #${totalReportes}:</strong> ${objetoAEnviar}</span><span class="text-slate-400">${selectDistrito.value}</span>`;
  listaReportes.prepend(item);

  try {
    await fetch('http://127.0.0.1:8000/api/escanear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        objeto_detectado: objetoAEnviar,
        confianza: confianzaAEnviar,
        distrito: selectDistrito.value
      })
    });
  } catch (e) {
    console.warn('Guardado en modo local:', e);
  }
});

(async () => {
  await iniciarCamara();
  modelo = await cocoSsd.load();
  badgeEstado.textContent = 'Escáner IA Activo • Apunta a un objeto';
  badgeEstado.classList.replace('text-cyan-400', 'text-emerald-400');
  detectarFrame();
})();