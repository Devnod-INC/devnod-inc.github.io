const CONTENEDOR = document.getElementById('content');

// Función principal para cambiar de pestañas en la SPA
function navegarA(pagina) {
    CONTENEDOR.innerHTML = `<div class="loader-placeholder">Conectando con el nodo ${pagina}...</div>`;
    actualizarMenubar(pagina);

    fetch(`./paginas/${pagina}.html`)
        .then(response => {
            if (!response.ok) throw new Error(`No se pudo cargar el fragmento: ${pagina}`);
            return response.text();
        })
        .then(html => {
            // Inyectamos el componente
            CONTENEDOR.innerHTML = html;

            // Damos un respiro de 50ms para que el DOM se asiente antes de meter JavaScript dinámico
            setTimeout(() => {
                if (pagina === 'home') {
                    inicializarHome();
                }
            }, 50);
        })
        .catch(error => {
            console.error(error);
            CONTENEDOR.innerHTML = `
                <div class="loader-placeholder" style="color: #ff7b72;">
                    ⚠️ Error al renderizar el nodo estático. Asegúrate de que 'paginas/${pagina}.html' exista.
                </div>`;
        });
}

// Control visual de los botones del menú superior
function actualizarMenubar(paginaActiva) {
    const botones = document.querySelectorAll('.nav-link');
    botones.forEach(boton => {
        if (boton.getAttribute('onclick').includes(`'${paginaActiva}'`)) {
            boton.classList.add('active');
        } else {
            boton.classList.remove('active');
        }
    });
}

// Consumidor asíncrono para rellenar los datos corporativos
function inicializarHome() {
    // Cache Busting: Forzamos al navegador a leer la última versión del JSON saltándose la caché
    fetch(`./data/data.json?v=${new Date().getTime()}`)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status} (No se encontró data.json)`);
            return res.json();
        })
        .then(data => {
            // Manejo de compatibilidad por si acaso: acepta si viene como objeto directo o dentro de un arreglo
            const info = Array.isArray(data) ? data[0].bienvenida : data.bienvenida;
            
            if (!info) throw new Error("No se encontró el nodo 'bienvenida' en la estructura de datos.");
            
            const titleEl = document.getElementById('hero-title');
            const subtitleEl = document.getElementById('hero-subtitle');
            const descEl = document.getElementById('hero-description');
            const containerPilares = document.getElementById('features-container');

            if (titleEl) titleEl.innerText = info.titulo;
            if (subtitleEl) subtitleEl.innerText = info.subtitulo;
            if (descEl) descEl.innerText = info.descripcion;

            if (containerPilares && info.pilares) {
                containerPilares.innerHTML = info.pilares.map(pilar => `
                    <div class="feature-card">
                        <div class="feature-icon">${pilar.icono}</div>
                        <h3>${pilar.titulo}</h3>
                        <p>${pilar.detalle}</p>
                    </div>
                `).join('');
            }
        })
        .catch(err => {
            console.error("Error crítico detectado:", err);
            const titleEl = document.getElementById('hero-title');
            if (titleEl) {
                titleEl.style.color = "#ff7b72";
                titleEl.innerText = `⚠️ Fallo en el Nodo de Datos: ${err.message}`;
            }
        });
}

// Carga inicial automática de la SPA
window.addEventListener('DOMContentLoaded', () => {
    navegarA('home');
});
