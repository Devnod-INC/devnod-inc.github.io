const CONTENEDOR = document.getElementById('content');

/**
 * Función central de enrutamiento.
 * Carga el fragmento HTML, inyecta el contenido y dispara el inicializador correspondiente.
 */
function navegarA(pagina) {
    CONTENEDOR.innerHTML = `<div class="loader-placeholder">Conectando con el nodo ${pagina}...</div>`;
    actualizarMenubar(pagina);

    fetch(`./paginas/${pagina}.html`)
        .then(response => {
            if (!response.ok) throw new Error(`No se pudo cargar el fragmento: ${pagina}`);
            return response.text();
        })
        .then(html => {
            CONTENEDOR.innerHTML = html;

            // Esperamos un breve tiempo para asegurar que el DOM está renderizado
            setTimeout(() => {
                const nodos = {
                    'home': inicializarHome,
                    'blog_rss': inicializarFeeds,
                    'quienes_somos': inicializarQuienesSomos,
                    'mision_vision': inicializarMisionVision,
                    'politica': inicializarPolitica,
                    'acerca': inicializarAcerca
                };

                if (nodos[pagina]) {
                    nodos[pagina]();
                }
            }, 200);
        })
        .catch(error => {
            console.error(error);
            CONTENEDOR.innerHTML = `<div class="loader-placeholder" style="color: #ff7b72;">⚠️ Error: ${error.message}</div>`;
        });
}

function actualizarMenubar(paginaActiva) {
    document.querySelectorAll('.nav-link').forEach(boton => {
        const onclickAttr = boton.getAttribute('onclick') || '';
        boton.classList.toggle('active', onclickAttr.includes(`'${paginaActiva}'`));
    });
}

// --- Inicializadores de Nodos ---

function inicializarHome() {
    fetch(`./data/data.json?v=${new Date().getTime()}`)
        .then(res => res.json())
        .then(data => {
            const info = data.bienvenida;
            if (!info) return;
            if (document.getElementById('hero-title')) document.getElementById('hero-title').innerText = info.titulo;
            if (document.getElementById('hero-subtitle')) document.getElementById('hero-subtitle').innerText = info.subtitulo;
            if (document.getElementById('hero-description')) document.getElementById('hero-description').innerText = info.descripcion;

            const container = document.getElementById('features-container');
            if (container && info.pilares) {
                container.innerHTML = info.pilares.map(p => `
                    <div class="feature-card">
                        <div class="feature-icon">${p.icono}</div>
                        <h3>${p.titulo}</h3>
                        <p>${p.detalle}</p>
                    </div>`).join('');
            }
        });
}

function inicializarFeeds() {
    const contenedor = document.getElementById('rss-container');
    const selectorBusqueda = document.getElementById('rss-search');
    let noticiasLocales = [];

    const fuentesConfig = {
        "sophos_threat": { nombre: "Sophos Threat", color: "#ff7b72" },
        "aws_news": { nombre: "AWS What's New", color: "#f29d38" },
        "gcp_cloud": { nombre: "Google Cloud", color: "#79c0ff" }
    };

    function pintar(noticias) {
        contenedor.innerHTML = noticias.map(item => `
            <article class="rss-card">
                <h3>${item.title}</h3>
                <a href="${item.link}" target="_blank">Leer reporte ↗</a>
            </article>`).join('');
    }

    fetch(`./data/feeds.json?v=${new Date().getTime()}`)
        .then(res => res.json())
        .then(data => {
            noticiasLocales = data;
            pintar(noticiasLocales);
        });

    if (selectorBusqueda) {
        selectorBusqueda.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            pintar(noticiasLocales.filter(i => i.title.toLowerCase().includes(query)));
        });
    }
}

function inicializarQuienesSomos() {
    fetch(`./data/data.json?v=${new Date().getTime()}`)
        .then(res => res.json())
        .then(data => {
            const info = data.quienes_somos;
            document.getElementById('about-title').innerText = info.titulo;
            document.getElementById('about-story').innerText = info.historia;
            document.getElementById('values-container').innerHTML = info.valores.map(v => `
                <div class="value-card"><h4>${v.concepto}</h4><p>${v.definición}</p></div>`).join('');
        });
}

function inicializarMisionVision() {
    fetch(`./data/data.json?v=${new Date().getTime()}`)
        .then(res => res.json())
        .then(data => {
            const info = data.mision_vision;
            document.getElementById('mision-text').innerText = info.mision_texto;
            document.getElementById('vision-text').innerText = info.vision_texto;
        });
}

function inicializarPolitica() {
    fetch(`./data/data.json?v=${new Date().getTime()}`)
        .then(res => res.json())
        .then(data => {
            const info = data.politica;
            document.getElementById('policy-container').innerHTML = info.secciones.map(s => `
                <div class="policy-card"><h3>${s.titulo}</h3><p>${s.contenido}</p></div>`).join('');
        });
}

function inicializarAcerca() {
    fetch(`./data/data.json?v=${new Date().getTime()}`)
        .then(res => res.json())
        .then(data => {
            const info = data.acerca;
            document.getElementById('about-title').innerText = info.titulo;
            document.getElementById('about-desc').innerText = info.descripcion;
            document.getElementById('stack-container').innerHTML = info.tecnologias.map(t => `
                <div class="tech-badge" style="border-color: ${t.color}">
                    <strong>${t.nombre}</strong><br><small>${t.tag}</small>
                </div>`).join('');
            document.getElementById('security-title').innerText = info.seguridad.titulo;
            document.getElementById('security-text').innerText = info.seguridad.texto;
        });
}

window.addEventListener('DOMContentLoaded', () => navegarA('home'));
