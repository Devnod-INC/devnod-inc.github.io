const CONTENEDOR = document.getElementById('content');

function navegarA(pagina) {
    CONTENEDOR.innerHTML = `<div class="loader-placeholder">Conectando con el nodo ${pagina}...</div>`;
    actualizarMenubar(pagina);

    // Agregamos './' explícito para garantizar que busque dentro de las carpetas de tu repositorio
    fetch(`./paginas/${pagina}.html`)
        .then(response => {
            if (!response.ok) throw new Error(`No se pudo cargar el fragmento: ${pagina}`);
            return response.text();
        })
        .then(html => {
            CONTENEDOR.innerHTML = html;

            // Si es la home, gatillamos la inyección del JSON
            if (pagina === 'home') {
                inicializarHome();
            }
        })
        .catch(error => {
            console.error(error);
            CONTENEDOR.innerHTML = `
                <div class="loader-placeholder" style="color: #ff7b72;">
                    ⚠️ Error al renderizar el nodo estático. Asegúrate de que 'paginas/${pagina}.html' exista.
                </div>`;
        });
}

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

function inicializarHome() {
    // Aseguramos la ruta relativa al JSON con './'
    fetch('./data/data.json')
        .then(res => {
            if (!res.ok) throw new Error("No se pudo leer data.json");
            return res.json();
        })
        .then(data => {
            const info = data.bienvenida;
            
            // Inyectamos los textos en el HTML que se acaba de cargar
            if(document.getElementById('hero-title')) {
                document.getElementById('hero-title').innerText = info.titulo;
                document.getElementById('hero-subtitle').innerText = info.subtitulo;
                document.getElementById('hero-description').innerText = info.descripcion;
            }

            const containerPilares = document.getElementById('features-container');
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
        .catch(err => console.error("Error cargando los datos institucionales:", err));
}

// Arrancar la SPA cargando la Home por defecto
window.addEventListener('DOMContentLoaded', () => {
    navegarA('home');
});
