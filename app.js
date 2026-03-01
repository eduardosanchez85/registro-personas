const API_URL = "https://script.google.com/macros/s/AKfycbxLl41NIjknycuPNdsZLhX8xrGaqCoDRKOdG6DjVMngDBnlkjy9Z60L9HN_40GsXQ0VCA/exec";

document.addEventListener("DOMContentLoaded", () => {
  const currentPage = document.body.dataset.page;

  if (currentPage === "asistentes") {
    iniciarBuscador();
    apiGet();
  }

  if (currentPage === "registro") {
    iniciarFormulario();
  }
});

// Datos
let data;
let asistentes = [];

// Elementos HTML
const loading = document.getElementById("loading");
const vacio = document.getElementById("empty-state");
const buscador = document.getElementById("search-input");
const totalAsistentes = document.getElementById("totalAsistentes");
const numeroAsistentes = document.getElementById("attendee-count");
const listaAsistentes = document.getElementById("attendees-list");

const form = document.getElementById("registration-form");
const nombreInput = document.getElementById("nombre");

const loadingCard = document.getElementById("loading-card");
const successCard = document.getElementById("success-card");

// Petición HTTP GET
async function apiGet() {
  try {
    mostrarSpinner();

    const response = await fetch(API_URL);
    data = await response.json();

    console.log("Respuesta completa del GET:", data);
    console.log("Arreglo de datos:", data.datos);

    asistentes = data.datos || [];

    if (asistentes.length > 0) {
      mostrarLista();
      renderizarPersonas(asistentes);
    } else {
      mostrarVacio();
    }

  } catch (error) {
    console.error("Error al consumir el GET:", error);
    mostrarVacio();
  }
}

// Petición HTTP POST
async function apiPost(nombre) {
  try {
    mostrarCardCarga();

    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        NOMBRE: nombre
      })
    });

    const resultado = await response.json();

    console.log("Respuesta del POST:", resultado);

    if (resultado.ok) {
      if (form) form.reset();
      mostrarCardExito();
    } else {
      mostrarFormulario();
      alert(resultado.error || "No se pudo registrar");
    }

  } catch (error) {
    console.error("Error al hacer POST:", error);
    mostrarFormulario();
    alert("Error al registrar");
  }
}

// Buscador
function iniciarBuscador() {
  if (!buscador) return;

  buscador.addEventListener("input", () => {
    const texto = buscador.value.toLowerCase().trim();

    const filtrados = asistentes.filter((persona) => {
      const nombre = (persona.nombre || persona.NOMBRE || "").toLowerCase();
      return nombre.includes(texto);
    });

    renderizarPersonas(filtrados);
  });
}

function mostrarSpinner() {
  if (loading) loading.classList.remove("d-none");
  if (vacio) vacio.classList.add("d-none");
  if (buscador) buscador.classList.add("d-none");
  if (totalAsistentes) totalAsistentes.classList.add("d-none");
  if (listaAsistentes) listaAsistentes.classList.add("d-none");
}

function mostrarVacio() {
  if (loading) loading.classList.add("d-none");
  if (vacio) vacio.classList.remove("d-none");
  if (buscador) buscador.classList.add("d-none");
  if (totalAsistentes) totalAsistentes.classList.add("d-none");
  if (listaAsistentes) listaAsistentes.classList.add("d-none");
}

function mostrarLista() {
  if (loading) loading.classList.add("d-none");
  if (vacio) vacio.classList.add("d-none");
  if (buscador) buscador.classList.remove("d-none");
  if (totalAsistentes) totalAsistentes.classList.remove("d-none");
  if (numeroAsistentes) numeroAsistentes.textContent = asistentes.length;
  if (listaAsistentes) listaAsistentes.classList.remove("d-none");
}

// Renderiza nombres de personas
function renderizarPersonas(personas = []) {
  if (!listaAsistentes) return;

  listaAsistentes.innerHTML = "";

  if (personas.length === 0) {
    listaAsistentes.innerHTML = `
      <div class="persona-item text-center">
        No se encontraron coincidencias
      </div>
    `;
    return;
  }

  personas.forEach((persona) => {
    const div = document.createElement("div");
    div.className = "persona-item";

    const nombre = document.createElement("div");
    nombre.className = "persona-nombre";
    nombre.textContent = persona.nombre || persona.NOMBRE || "Sin nombre";

    const fecha = document.createElement("div");
    fecha.className = "persona-fecha";

    const fechaRegistro = persona.HORA;

    fecha.textContent = fechaRegistro
    ? formatearFecha(fechaRegistro)
    : "Sin fecha";

    div.appendChild(nombre);
    div.appendChild(fecha);

    listaAsistentes.appendChild(div);
  });
}

//Formateo de fecha
function formatearFecha(valor) {
  const fecha = new Date(valor);

  if (isNaN(fecha.getTime())) {
    return valor;
  }

  return fecha.toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// Registro de personas
function iniciarFormulario() {
  if (!form || !nombreInput) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = nombreInput.value.trim();

    if (!nombre) {
      alert("Escribe un nombre");
      return;
    }

    await apiPost(nombre);
  });
}

function mostrarCardCarga() {
  if (form) form.classList.add("d-none");
  if (loadingCard) loadingCard.classList.remove("d-none");
  if (successCard) successCard.classList.add("d-none");
}

function mostrarCardExito() {
  if (form) form.classList.add("d-none");
  if (loadingCard) loadingCard.classList.add("d-none");
  if (successCard) successCard.classList.remove("d-none");
}

function mostrarFormulario() {
  if (form) form.classList.remove("d-none");
  if (loadingCard) loadingCard.classList.add("d-none");
  if (successCard) successCard.classList.add("d-none");
}

function reiniciarRegistro() {
  if (form) form.reset();
  mostrarFormulario();
}