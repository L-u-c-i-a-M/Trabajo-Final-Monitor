const API_URL = "http://localhost:3000/api/sistema"; // ← reemplaza con tu IP

async function obtenerDatos() {
  try {
    const respuesta = await fetch(API_URL);
    const datos = await respuesta.json();
    mostrarDatos(datos);
  } catch (error) {
    document.getElementById('datos').innerHTML = `<p>Error: ${error}</p>`;
  }
}

function mostrarDatos(datos) {
  const cont = document.getElementById('datos');
  cont.innerHTML = "";

  // CPU
  cont.appendChild(crearCard("CPU", [
    ["Fabricante", datos.cpu?.manufacturer],
    ["Modelo", datos.cpu?.brand],
    ["Núcleos", datos.cpu?.cores],
    ["Velocidad", `${datos.cpu?.speed} GHz`],
    ["Carga actual", `${datos.carga?.currentload?.toFixed(1)} %`]
  ]));

  // Memoria RAM
  cont.appendChild(crearCard("Memoria RAM", [
    ["Total", `${(datos.memoria?.total / 1073741824).toFixed(2)} GB`],
    ["Libre", `${(datos.memoria?.free / 1073741824).toFixed(2)} GB`],
    ["Usada", `${((1 - (datos.memoria?.free / datos.memoria?.total)) * 100).toFixed(1)} %`]
  ]));

  // Disco
  if (datos.disco?.length > 0) {
    cont.appendChild(crearCard("Disco principal", [
      ["Sistema de archivos", datos.disco[0].fs],
      ["Tamaño", `${(datos.disco[0].size / 1073741824).toFixed(2)} GB`],
      ["Usado", `${(datos.disco[0].used / 1073741824).toFixed(2)} GB`],
      ["Libre", `${(datos.disco[0].available / 1073741824).toFixed(2)} GB`]
    ]));
  }

  // Sistema operativo
  cont.appendChild(crearCard("Sistema Operativo", [
    ["Distribución", datos.so?.distro],
    ["Versión", datos.so?.release],
    ["Kernel", datos.so?.kernel],
    ["Arquitectura", datos.so?.arch]
  ]));

  // Red
  if (datos.redes?.length > 0) {
    cont.appendChild(crearCard("Red", [
      ["Interfaz", datos.redes[0].iface],
      ["IPv4", datos.redes[0].ip4],
      ["MAC", datos.redes[0].mac],
      ["Velocidad", `${datos.redes[0].speed || "N/A"} Mbps`]
    ]));
  }

  // Usuarios
  cont.appendChild(crearCard("Usuarios activos", [
    ["Usuarios", datos.usuarios?.map(u => u.user).join(", ") || "Ninguno"]
  ]));

  // Batería (si existe)
  if (datos.bateria) {
    cont.appendChild(crearCard("Batería", [
      ["Presente", datos.bateria.hasbattery ? "Sí" : "No"],
      ["Carga", `${datos.bateria.percent || 0} %`]
    ]));
  }
    // Procesos
cont.appendChild(crearCard("Procesos", [
  ["Total", datos.procesos?.all],
  ["Usuarios", datos.procesos?.list?.map(p => p.user).join(", ").slice(0, 100) + "..."] // muestra solo los primeros para no saturar
]));
    // Tarjeta Gráfica
cont.appendChild(crearCard("Tarjeta Gráfica", [
  ["Modelo", datos.grafica?.controllers[0]?.model],
  ["VRAM", `${datos.grafica?.controllers[0]?.vram} MB`]
]));

  // Fecha
  cont.appendChild(crearCard("Fecha del reporte", [
    ["Actualizado", new Date(datos.fecha).toLocaleString()]
  ]));
}

function crearCard(titulo, pares) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `<h2>${titulo}</h2>`;

  const lista = document.createElement("ul");
  lista.className = "lista";
  pares.forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== "undefined") {
      const li = document.createElement("li");
      li.innerHTML = `<b>${clave}:</b> ${valor}`;
      lista.appendChild(li);
    }
  });

  card.appendChild(lista);
  return card;
}

setInterval(obtenerDatos, 10000);
obtenerDatos();
