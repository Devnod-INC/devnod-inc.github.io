// Configuración de las rutas de nuestra SPA
const CONTENEDOR = document.getElementById('content');

// Función principal para navegar entre secciones sin recargar la página
function navegarA(pagina) {
    // 1. Mostrar estado de carga en el contenedor central
    CONTENEDOR.innerHTML = `<div class="loader-placeholder">Conectando con el nodo ${pagina}...</div>`;

    // 2. Actualizar el estado visual del Menubar (botones activos)
    actualizarMenubar(pagina);

    // 3. Ir a buscar el fragmento HTML correspondiente
    fetch(`paginas/${pagina}.html`)
        .then(response => {
            if (!response.ok) throw new Error(`No se pudo cargar el fragmento: ${pagina}`);
            return response.text();
        })
        .then(html => {
            // Inyectamos el HTML del componente en el contenedor central
            CONTENEDOR.innerHTML = html;

            // Lógica especial: Si entramos a la 'home', vamos a alimentar sus IDs con el data.json
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

// Función para cambiar la interfaz del menú de navegación
function actualizarMenubar(paginaActiva) {
    const botones = document.querySelectorAll('.nav-link');
    botones.forEach(boton => {
        // Buscamos el atributo onclick para saber a qué página apunta el botón
        if (boton.getAttribute('onclick').includes(`'${paginaActiva}'`)) {
            boton.classList.add('active');
        } else {
            boton.classList.remove('active');
        }
    });
}

// Función encargada de consumir el data.json e inyectarlo en la Home
function inicializarHome() {
    fetch('data/data.json')
        .then(res => res.json())
        .then(data => {
            const info = data.bienvenida;
            
            // Inyectamos los textos principales del JSON corporativo
            document.getElementById('hero-title').innerText = info.titulo;
            document.getElementById('hero-subtitle').innerText = info.subtitulo;
            document.getElementById('hero-description').innerText = info.descripcion;

            // Renderizamos los pilares tecnológicos dinámicamente
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

// Inicialización automática: Cuando la web carga por primera vez, abrimos la Home
window.addEventListener('DOMContentLoaded', () => {
    navegarA('home');
});
