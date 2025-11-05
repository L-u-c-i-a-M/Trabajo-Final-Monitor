// Conexión al servidor WebSocket
const socket = io("http://192.168.1.7:3000"); // Ajusta la IP si es necesario

socket.on("connect", () => {
  console.log("🟢 Conectado al servidor de monitoreo");
});

document.addEventListener("DOMContentLoaded", () => {
  crearGraficoCPU();
  crearGraficoMemoria();
});

socket.on("disconnect", () => {
  console.log("🔴 Desconectado del servidor");
});

socket.on("datosSistema", (datos) => {
  console.log("Datos del sistema recibidos:", datos);
  // CPU
  const cpuInfo = document.getElementById("cpuInfo");
  cpuInfo.innerHTML = `
    <span>Fabricante:</span> ${datos.cpu.fabricante} <br>
    <span>Modelo:</span> ${datos.cpu.modelo} <br>
    <span>Núcleos:</span> ${datos.cpu.nucleos} <br>
    <span>Temperatura:</span> ${datos.cpu.temperatura} °C <br>
    <span>Carga:</span> ${datos.cpu.carga} %
  `;

  const usoCPU = parseFloat(datos.cpu.carga);
  document.getElementById("cpuValor").textContent = usoCPU + "%";
  actualizarCirculo("cpuCircle", usoCPU);

  const hora = new Date().toLocaleTimeString();
  cpuChart.data.labels.push(hora);
  cpuChart.data.datasets[0].data.push(usoCPU);
  if (cpuChart.data.labels.length > 10) {
    cpuChart.data.labels.shift();
    cpuChart.data.datasets[0].data.shift();
  }
  cpuChart.update();

  // MEMORIA
  const memInfo = document.getElementById("memInfo");
  memInfo.innerHTML = `
    <span>Total:</span> ${datos.memoria.total} <br>
    <span>Libre:</span> ${datos.memoria.libre} <br>
    <span>Usado:</span> ${datos.memoria.usado}
  `;
  const usoMemoria = parseFloat(
    (
      (parseFloat(datos.memoria.usado) / parseFloat(datos.memoria.total)) *
      100
    ).toFixed(1)
  );
  document.getElementById("memValor").textContent = usoMemoria + "%";
  actualizarCirculo("memCircle", usoMemoria);

  memChart.data.labels.push(hora);
  memChart.data.datasets[0].data.push(usoMemoria);
  if (memChart.data.labels.length > 10) {
    memChart.data.labels.shift();
    memChart.data.datasets[0].data.shift();
  }
  memChart.update();

  // ====== DISCOS ======
  const discosContainer = document.getElementById("discosContainer");
  discosContainer.innerHTML = ""; // limpiar antes de volver a cargar

  if (Array.isArray(datos.discos)) {
    datos.discos.forEach((disco, index) => {
      const total = parseFloat(disco.tamaño);
      const usado = parseFloat(disco.usado);
      const libre = parseFloat(disco.libre);
      const usoPorcentaje = ((usado / total) * 100).toFixed(1);

      // Crear el contenedor de disco con las mismas clases
      const discoItem = document.createElement("div");
      discoItem.classList.add("disco-item");

      discoItem.innerHTML = `
      <h4>${disco.puntoMontaje || disco.filesystem}</h4>
      <div class="chart">
        <svg>
          <circle cx="60" cy="60" r="50"></circle>
          <circle id="discoCircle${index}" cx="60" cy="60" r="50"></circle>
        </svg>
        <div class="value" id="discoValor${index}">${usoPorcentaje}%</div>
      </div>
      <div class="disco-info">
        <p><strong>Tamaño:</strong> ${disco.tamaño}</p>
        <p><strong>Usado:</strong> ${disco.usado}</p>
        <p><strong>Libre:</strong> ${disco.libre}</p>
      </div>
    `;

      discosContainer.appendChild(discoItem);

      // Actualizar el gráfico circular con el porcentaje real
      const circle = discoItem.querySelector(`#discoCircle${index}`);
      const radio = 50;
      const circunferencia = 2 * Math.PI * radio;
      const offset = circunferencia - (usoPorcentaje / 100) * circunferencia;
      circle.style.strokeDasharray = circunferencia;
      circle.style.strokeDashoffset = offset;
    });
  }

  // Red
  console.log("Datos de red:", datos.red);
  let redHtml = "";
  datos.red?.forEach((r) => {
    redHtml += `
    <div class="red-card">
      <p><span>Interfaz:</span> ${r.interfaz || "--"}</p>
      <p><span>IP:</span> ${r.ip4 || "--"}</p>
      <p><span>MAC:</span> ${r.mac || "--"}</p>
      <p><span>Recibido:</span> ${r.recibidoMB} MB</p>
      <p><span>Enviado:</span> ${r.enviadoMB} MB</p>
    </div>
  `;
  });
  document.getElementById("redContainer").innerHTML = redHtml;

  // ====== PROCESOS ======
  const procesosDiv = document.getElementById("procesos");
  procesosDiv.innerHTML = `
  <p>Total de procesos: <strong>${datos.procesos.length}</strong></p>
`;

  // Usuarios
  let usuariosHtml = "";
  datos.usuarios?.forEach((u) => {
    usuariosHtml += `${u.usuario} - ${u.terminal} - ${u.fechaLogin}<br>`;
  });
  document.getElementById("usuarios").innerHTML = usuariosHtml;

  // Sistema operativo
  document.getElementById("sistema").innerHTML = `
        <span>Plataforma:</span> ${datos.sistema.platform} <br>
        <span>Distro:</span> ${datos.sistema.distro} <br>
        <span>Versión:</span> ${datos.sistema.version}
    `;

  // === BATERÍA ===
  if (datos.bateria) {
    const bateria = datos.bateria;
    const bateriaHTML = `
    <p><strong>Porcentaje:</strong> ${bateria.porcentaje}</p>
    <p><strong>Estado:</strong> ${bateria.estado}</p>
  `;
    document.getElementById("bateriaInfo").innerHTML = bateriaHTML;
  }

  // === GRÁFICA ===
  if (datos.grafica) {
    const gpu = datos.grafica;
    const graficaHTML = `
    <p><strong>Fabricante:</strong> ${gpu.vendor}</p>
    <p><strong>Modelo:</strong> ${gpu.model}</p>
    <p><strong>Bus:</strong> ${gpu.bus}</p>
    <p><strong>VRAM:</strong> ${gpu.vram} MB</p>
  `;
    document.getElementById("graficaInfo").innerHTML = graficaHTML;
  }
});

let cpuChart;
let memChart;

function crearGraficoCPU() {
  const ctxCPU = document.getElementById("cpuChart").getContext("2d");
  cpuChart = new Chart(ctxCPU, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Uso de CPU (%)",
          borderColor: "#f5a623",
          borderWidth: 2,
          data: [],
        },
      ],
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true, max: 100 } },
    },
  });
}

function crearGraficoMemoria() {
  const ctxMem = document.getElementById("memChart").getContext("2d");
  memChart = new Chart(ctxMem, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Uso de Memoria (%)",
          borderColor: "#4caf50",
          borderWidth: 2,
          data: [],
        },
      ],
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true, max: 100 } },
    },
  });
}
function actualizarCirculo(id, porcentaje) {
  const circle = document.getElementById(id);
  const radio = 50;
  const circunferencia = 2 * Math.PI * radio;
  const offset = circunferencia - (porcentaje / 100) * circunferencia;
  circle.style.strokeDasharray = circunferencia;
  circle.style.strokeDashoffset = offset;
}

function actualizarReloj() {
  const ahora = new Date();
  const horas = ahora.getHours().toString().padStart(2, "0");
  const minutos = ahora.getMinutes().toString().padStart(2, "0");
  const segundos = ahora.getSeconds().toString().padStart(2, "0");

  const horaActual = `${horas}:${minutos}:${segundos}`;
  document.getElementById("reloj").textContent = horaActual;
}

// Ejecutar una vez al cargar
actualizarReloj();

// Actualizar cada segundo
setInterval(actualizarReloj, 1000);
