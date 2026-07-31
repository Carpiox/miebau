let boton = document.getElementById("boton");
let resultado = document.getElementById("resultado");
let progresoInterval = null;

// Función que hace la barra de carga
function cargarPDF(url, asignatura, comunidad, anyo) {

    // limpiar si había una barra previa
    if (progresoInterval) clearInterval(progresoInterval);

    resultado.innerHTML = `
        <div style="width:100%;background:#ddd;border-radius:8px;overflow:hidden;height:22px;margin:12px 0;">
            <div id="barra" style="width:0%;height:100%;background:#4A90E2;"></div>
        </div>
        <p>Cargando PDF examen ${asignatura} ${anyo}, ${comunidad}, espera un momento...</p>
    `;

    let barra = resultado.querySelector("#barra");
    let progreso = 0;

    progresoInterval = setInterval(() => {
        progreso++;
        barra.style.width = progreso + "%";

        if (progreso >= 100) {
            clearInterval(progresoInterval);
            resultado.innerHTML = `
                <iframe src="${url}" width="100%" height="600px" style="border:none;"></iframe>
            `;
        }

    }, 50); // 100 pasos × 50 ms = 5 segundos
}

// Cuando le das al botón
boton.addEventListener("click", ()=>{
    
    let asignatura = document.getElementById("asignatura").value.trim();
    let comunidad  = document.getElementById("comunidad").value.trim();
    let anyo       = document.getElementById("anyo").value;



    let datos = examenes?.[anyo]?.[asignatura]?.[comunidad];

    if(!datos){
        resultado.innerHTML = `
            <p style="color:red;margin-top:20px;">
                ❌ No hay exámenes disponibles para esta combinación.
            </p>
        `;
        return;
    }

    // Mostrar los botones en lugar de los iframes
    resultado.innerHTML = `
        <h3>Exámenes disponibles</h3>

        <p>Examenes de ${asignatura}, ${comunidad}, ${anyo}</p>
        <button id="btnOrd"
            style="padding:10px;margin:10px 0;width:100%;font-size:16px;text-align:center">
            Descargar convocatoria Ordinaria
        </button>

        <button id="btnExt"
            style="padding:10px;margin:10px 0;width:100%;font-size:16px;">
            Descargar convocatoria Extraordinaria
        </button>
    `;

    // Eventos de los botones
    document.getElementById("btnOrd").onclick = () => cargarPDF(datos.ordinaria , asignatura, comunidad, anyo);
    document.getElementById("btnExt").onclick = () => cargarPDF(datos.extraordinaria, asignatura, comunidad, anyo);
});
