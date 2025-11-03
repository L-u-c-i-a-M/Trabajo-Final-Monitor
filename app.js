// Conexión al servidor WebSocket
const socket = io('http://localhost:3000'); // Ajusta la IP si es necesario

socket.on("connect", () => {
    console.log("🟢 Conectado al servidor de monitoreo");
});

socket.on("disconnect", () => {
    console.log("🔴 Desconectado del servidor");
});

socket.on("datosSistema", (datos) => {
    // CPU
    document.getElementById("cpu").innerHTML = `
        <h3>CPU</h3>
        <span>Fabricante:</span> ${datos.cpu.fabricante} <br>
        <span>Modelo:</span> ${datos.cpu.modelo} <br>
        <span>Núcleos:</span> ${datos.cpu.nucleos} <br>
        <span>Temperatura:</span> ${datos.cpu.temperatura} <br>
        <span>Carga:</span> ${datos.cpu.carga}
    `;

    // Memoria
    document.getElementById("memoria").innerHTML = `
        <h3>Memoria</h3>
        <span>Total:</span> ${datos.memoria.total} <br>
        <span>Libre:</span> ${datos.memoria.libre} <br>
        <span>Usado:</span> ${datos.memoria.usado}
    `;

    // Discos
    let discosHtml = "<h3>Discos</h3>";
    datos.discos?.forEach(d => {
        discosHtml += `
            <strong>${d.puntoMontaje || d.filesystem}:</strong><br>
            <span>Filesystem:</span> ${d.filesystem} <br>
            <span>Tamaño:</span> ${d.tamaño} <br>
            <span>Usado:</span> ${d.usado} <br>
            <span>Libre:</span> ${d.libre} <br><br>
        `;
    });
    document.getElementById("discos").innerHTML = discosHtml;

    // Red
    let redHtml = "<h3>Red</h3>";
    datos.red?.forEach(r => {
        redHtml += `
            <div style="margin-bottom: 10px;">
                <span>Interfaz:</span> ${r.interfaz} <br>
                <span>IP:</span> ${r.ip4} <br>
                <span>MAC:</span> ${r.mac} <br>
                <span>Recibido:</span> ${r.recibidoMB} MB <br>
                <span>Enviado:</span> ${r.enviadoMB} MB
            </div>
        `;
    });
    document.getElementById("red").innerHTML = redHtml;

    // Procesos
    let procesosHtml = "<h3>Procesos</h3>";
    datos.procesos?.slice(0, 20).forEach(p => {
        procesosHtml += `PID: ${p.pid} | ${p.nombre} | ${p.estado}<br>`;
    });
    document.getElementById("procesos").innerHTML = procesosHtml;

    // Usuarios
    let usuariosHtml = "<h3>Usuarios</h3>";
    datos.usuarios?.forEach(u => {
        usuariosHtml += `${u.usuario} - ${u.terminal} - ${u.fechaLogin}<br>`;
    });
    document.getElementById("usuarios").innerHTML = usuariosHtml;

    // Sistema operativo
    document.getElementById("sistema").innerHTML = `
        <h3>Sistema</h3>
        <span>Plataforma:</span> ${datos.so.plataforma} <br>
        <span>Distro:</span> ${datos.so.distro} <br>
        <span>Versión:</span> ${datos.so.version}
    `;
});
