    let boton = document.getElementById("boton");
    let intervalos = []; //Almacenaje de intervalos activos y para limpiarlos

    let diccionario = {
        Andalucia: [{
                nombre: "Universidad de Almería (UAL)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Andalucia/Andalucia.pdf"
            },
            {
                nombre: "Universidad de Granada (UGR)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Andalucia/Andalucia.pdf"
            },
            {
                nombre: "Universidad de Málaga (UMA)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Andalucia/Andalucia.pdf"
            },
            {
                nombre: "Universidad Internacional de Andalucía (UNIA)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Andalucia/Andalucia.pdf"
            },
            {
                nombre: "Universidad de Sevilla (US)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Andalucia/Andalucia.pdf"
            },
            {
                nombre: "Universidad Pablo de Olavide (UPO)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Andalucia/Andalucia.pdf"
            },
            {
                nombre: "Universidad Internac. Menéndez Pelayo (UIMP)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Andalucia/Andalucia.pdf"
            },
            {
                nombre: "Universidad de Cádiz (UCA)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Andalucia/Andalucia.pdf"
            },
            {
                nombre: "Universidad de Córdoba (UCO)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Andalucia/Andalucia.pdf"
            },
            {
                nombre: "Universidad de Jaén (UJAEN)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Andalucia/Andalucia.pdf"
            },
            {
                nombre: "Universidad de Huelva (UHU)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Andalucia/Andalucia.pdf"
            },
        ],

        Aragón: [{
                nombre: "Universidad de Zaragoza (UNIZAR)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Aragon/Aragon.pdf"
            },
            {
                nombre: "Universidad Internacional. Menéndez Pelayo (UIMP)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Aragon/Aragon.pdf"
            }
        ],

        Asturias: [{
            nombre: "Universidad de Oviedo (UNIOVI)",
            pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Asturias/Asturias.pdf"
        }, ],

        Cantabria: [{
                nombre: "Universidad de Cantabria (UNICAN)",
                pdf: "https://calculadoraevau.netlify.appPonderaciones/Cantabria/Cantabria.pdf"
            },
            {
                nombre: "Universidad Internac. Menéndez Pelayo (UIMP)",
                pdf: "https://calculadoraevau.netlify.appPonderaciones/Cantabria/Cantabria.pdf"
            },
            {
                nombre: "Universidad Europea del Atlántico",
                pdf: "https://calculadoraevau.netlify.appPonderaciones/Cantabria/Cantabria.pdf"
            }

        ],

        Castilla_la_Mancha: [{
                nombre: "Universidad de Castilla la Mancha (UCLM)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Castilla_la_macha/Castilla_la_manta.pdf"
            },
            {
                nombre: "Universidad Internac. Menéndez Pelayo (UIMP)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Castilla_la_macha/Castilla_la_manta.pdf"
            },

        ],

        Castilla_y_Leon: [{
                nombre: "Universidad de Burgos (UBU)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Castilla_y_leon/UBU_-_Universidad_de_Burgos.pdf"
            },
            {
                nombre: "Universidad de León (ULE)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Castilla_y_leon/ULE_-_Universidad_de_León.pdf"
            },
            {
                nombre: "Universidad de Salamanca (USAL)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Castilla_y_leon/USAL_-_Universidad_de_Salamanca.pdf"
            },
            {
                nombre: "Universidad de Valladolid (UVA)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Castilla_y_leon/UVA_-_Universidad_de_Valladolid.pdf"
            },

        ],

        Catalunya: [{
                nombre: "Universitat Autónoma de Barcelona (UAB)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Catalunya/Catalunya.pdf"
            },
            {
                nombre: "Universitat de Barcelona (UB)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Catalunya/Catalunya.pdf"
            },
            {
                nombre: "Universitat Politécnica de Catalunya (UPC)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Catalunya/Catalunya.pdf"
            },
            {
                nombre: "Universitat Pompeu Fabra (UPF)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Catalunya/Catalunya.pdf"
            },
            {
                nombre: "Universidad Internac. Menéndez Pelayo (UIMP)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Catalunya/Catalunya.pdf"
            },
            {
                nombre: "Universitat de Lleida (UDL)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Catalunya/Catalunya.pdf"
            },
            {
                nombre: "Universitat de Girona (UDG)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Catalunya/Catalunya.pdf"
            },
            {
                nombre: "Universitat Rovira i Virgilu (URV)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Catalunya/Catalunya.pdf"
            }
        ],

        Comunidad_Valenciana: [{
                nombre: "Universidad de Alicante (UA)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Comunidad_Valenciana/Comunidad_Valenciana.pdf"
            },
            {
                nombre: "Universidad Miguel Hernández de Elche (UMH)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Comunidad_Valenciana/Comunidad_Valenciana.pdf"
            },
            {
                nombre: "Universitat Jaume I (UJI)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Comunidad_Valenciana/Comunidad_Valenciana.pdf"
            },
            {
                nombre: "Universitat Politécnica de Valencia (UPV)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Comunidad_Valenciana/Comunidad_Valenciana.pdf"
            },
            {
                nombre: "Universitat de Valencia (UV)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Comunidad_Valenciana/Comunidad_Valenciana.pdf"
            },
            {
                nombre: "Universidad Internac. Menéndez Pelayo (UIMP)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Comunidad_Valenciana/Comunidad_Valenciana.pdf"
            },
        ],

        Extremadura: [{
                nombre: "Universidad de Extremadura (UNEX)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Extremadura/Extremadura.pdf"
            },

        ],

        Galicia: [{
                nombre: "Universidade da Coruña (UDC)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Galicia/Galicia.pdf"
            },
            {
                nombre: "Univ. de Santiago de Compostela (USC)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Galicia/Galicia.pdf"
            },
            {
                nombre: "Universidad Internac. Menéndez Pelayo (UIMP)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Galicia/Galicia.pdf"
            },
            {
                nombre: "Universidade de Vigo (UVIGO)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Galicia/Galicia.pdf"
            },
        ],

        Islas_Baleares: [{
                nombre: "Universidad de las Islas Baleares (UIB)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Islas_Baleares/Islas_Baleares.pdf"
            },
            {
                nombre: "Escola Superior de Disseny de les Illes Balears",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Islas_Baleares/Islas_Baleares.pdf"
            },
        ],

        Islas_Canarias: [{
                nombre: "Universidad de la Laguna (ULL)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Islas_Canarias/Islas_Canarias.pdf"
            },
            {
                nombre: "Universidad Internac. Menéndez Pelayo (UIMP)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Islas_Canarias/Islas_Canarias.pdf"
            },
            {
                nombre: "Univ. de las Palmas de Gran Canaria (ULPGC)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Islas_Canarias/Islas_Canarias.pdf"
            },
        ],

        La_Rioja: [{
            nombre: "Universidad de La Rioja (UNIRIOJA)",
            pdf: "https://calculadoraevau.netlify.app/Ponderaciones/La_Rioja/La_Rioja.pdf"
        }, ],

        Madrid: [{
                nombre: "Universidad de Alcalá (UAH)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Madrid/UAH_-_Universidad_de_Alcalá.pdf"
            },
            {
                nombre: "Universidad Autónoma de Madrid (UAM)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Ponderaciones/Madrid/UAM_-_Universidad_Autónoma_de _Madrid.pdf"
            },
            {
                nombre: "Universidad Carlos III de Madrid (UC3M)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Madrid/UC3M_-_Universidad_Carlos_III_de_Madrid.pdf"
            },
            {
                nombre: "Universidad Complutense de Madrid (UCM)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Madrid/UCM_-_Universidad_Complutense_de_Madrid.pdf"
            },
            {
                nombre: "Universidad Politécnica de Madrid(UPM)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Madrid/UPM_-_Universidad_Politécnica_de_Madrid.pdf"
            },
            {
                nombre: "Universidad Rey Juan Carlos (URJC)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Madrid/URJC_-_Universidad_Rey_Juan_Carlos.pdf"
            },
        ],

        Murcia: [{  
                nombre: "Universidad de Murcia (UM)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Murcia/UM_-_Universidad_de_Murcia.pdf"
            },
            {
                nombre: "Universidad Politécnica de Cartagena (UPCT)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Murcia/UPCT_-_Universidad_Polit%C3%A9cnica_de_Cartagena2025.pdf"
            },

        ],

        Navarra: [{
                nombre: "Universidad Pública de Navarra (UNAVARRA)",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Navarra/Navarra.pdf"
            },

        ],

        Pais_Vasco: [{
                nombre: "Universidad del País Vasco",
                pdf: "https://calculadoraevau.netlify.app/Ponderaciones/Pais_Vasco/pais_vasco.pdf"
            },

        ]
    };

    boton.addEventListener("click", () => {
        let ponderaciones = document.getElementById("ponderaciones");
        let select = document.getElementById("comunidades");
        let comunidades = select.value;
        let nombreComunidad = select.options[select.selectedIndex].text;

        //Universidades publicas pertenecientes a la comunidad autonoma seleccionada
        ponderaciones.innerHTML = `<h2>Universidades de ${nombreComunidad}</h2>`;




        let lista = diccionario[comunidades];

        lista.forEach(universidad => {
            //Creo un div para posteriormente mostrar datos
            let div = document.createElement("div");
            div.style.textAlign = "center";
            div.style.padding = "20px";
            div.style.margin = "20px auto";
            div.style.border = "2px solid #ccc"; // grosor + color
            div.style.borderRadius = "15px";
            div.style.maxWidth = "600px"; // opcional: ancho máximo para mejor lectura
            div.style.backgroundColor = "#fafafa"; // fondo claro para resaltar
            div.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)"; // sombra suave

            let nombre = document.createElement("strong");
            nombre.style.display = "block"; // fuerza a ocupar línea completa
            nombre.style.marginBottom = "15px"; // espacio antes del botón
            nombre.textContent = universidad.nombre;
            div.appendChild(nombre);

            let botonPDF = document.createElement("button");
            botonPDF.textContent = "Mostrar PDF";
            botonPDF.style.marginBottom = "20px";
            div.appendChild(botonPDF);

            let iframeContenedor = document.createElement("div");
            div.appendChild(iframeContenedor);

            let progresoInterval; // Para cada universidad
            botonPDF.addEventListener("click", () => {
                // Si ya hay un iframe, lo quitamos y salimos
                if (iframeContenedor.querySelector("iframe")) {
                    iframeContenedor.innerHTML = "";
                    return;
                }

                // Limpiar intervalos previos si existiesen
                if (progresoInterval) clearInterval(progresoInterval);

                // Crear barra de progreso
                iframeContenedor.innerHTML = `
        <div style="width:100%;background:#eee;border-radius:8px;overflow:hidden;height:20px;margin:10px 0;">
            <div id="barra" style="width:0%;height:100%;background:#4A90E2;"></div>
        </div>
        <p>Cargando PDF...</p>
    `;
                let barra = iframeContenedor.querySelector("#barra");
                let progreso = 0;

                // Intervalo para llenar la barra en 5s
                progresoInterval = setInterval(() => {
                    progreso += 1;
                    barra.style.width = progreso + "%";
                    if (progreso >= 100) {
                        clearInterval(progresoInterval);
                        iframeContenedor.innerHTML = `
                <iframe src="${universidad.pdf}" width="100%" height="600px" style="border:none;"></iframe>
            `;
                    }
                }, 50);
            });
            ponderaciones.appendChild(div);
        });
    });
