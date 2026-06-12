const CONTENEDOR = document.getElementById('content');

async function navegarA(pagina) {
    CONTENEDOR.innerHTML = `<div class="loader-placeholder">Conectando con el nodo ${pagina}...</div>`;
    actualizarMenubar(pagina);

    try {
        const response = await fetch(`./paginas/${pagina}.html?v=${Date.now()}`);
        if (!response.ok) throw new Error("Nodo no encontrado");
        
        const html = await response.text();
        CONTENEDOR.innerHTML = html;

        // Llamada a la función específica según la página
        const inicializadores = {
            'home': inicializarHome,
            'blog_rss': inicializarFeeds,
            'quienes_somos': inicializarQuienesSomos,
            'mision_vision': inicializarMisionVision,
            'politica': inicializarPolitica,
            'acerca': inicializarAcerca
        };

        if (inicializadores[pagina]) {
            await inicializadores[pagina]();
        }
    } catch (error) {
        console.error("Error crítico de carga:", error);
        CONTENEDOR.innerHTML = `<div class="error">⚠️ Error de conexión: ${error.message}</div>`;
    }
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

    // Diccionario completo basado en tu feeds.json
    const fuentesConfig = {
        "sophos_threat": { nombre: "Sophos Threat", color: "#ff7b72" },
        "sophos_ops": { nombre: "Sophos Ops", color: "#ff9f43" },
        "aws_news": { nombre: "AWS News", color: "#f29d38" },
        "gcp_cloud": { nombre: "Google Cloud", color: "#79c0ff" },
        "suse_news": { nombre: "SUSE News", color: "#73d13d" },
        "broadcom_vmware": { nombre: "VMware", color: "#e83e8c" },
        "veeam_intel": { nombre: "Veeam", color: "#6f42c1" },
        "hackerrank": { nombre: "HackerRank", color: "#28a745" }
    };

    function pintar(noticias) {
        if (!contenedor) return;
        contenedor.innerHTML = noticias.map(item => {
            const config = fuentesConfig[item.source] || { nombre: "General", color: "#8b949e" };
            
            return `
                <article class="rss-card">
                    <div class="rss-badge" style="background: ${config.color}">
                        ${config.nombre}
                    </div>
                    <h3>${item.title}</h3>
                    <a href="${item.link}" target="_blank">Leer reporte ↗</a>
                </article>`;
        }).join('');
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
            
            // Actualización de encabezados
            const titleEl = document.getElementById('about-title');
            const subtitleEl = document.getElementById('about-subtitle');
            const storyEl = document.getElementById('about-story');
            const valuesEl = document.getElementById('values-container');

            if (titleEl) titleEl.innerText = info.titulo;
            if (subtitleEl) subtitleEl.innerText = info.subtitulo;
            if (storyEl) storyEl.innerText = info.historia;
            
            if (valuesEl && info.valores) {
                valuesEl.innerHTML = info.valores.map(v => `
                    <div class="value-card">
                        <h4>${v.concepto}</h4>
                        <p>${v.definición}</p>
                    </div>`).join('');
            }
        })
        .catch(err => console.error("Error en sincronización de componentes:", err));
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
