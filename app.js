const CONTENEDOR = document.getElementById('content');

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

            // Enrutador inteligente: Esperamos un ciclo de renderizado (100ms) para garantizar que el DOM exista
            setTimeout(() => {
                if (pagina === 'home') {
                    inicializarHome();
                } else if (pagina === 'blog_rss') {
                    inicializarFeeds();
                }
            }, 100);
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
        // Validación segura: extraemos el nombre de la página del atributo onclick
        const onclickAttr = boton.getAttribute('onclick') || '';
        if (onclickAttr.includes(`'${paginaActiva}'`)) {
            boton.classList.add('active');
        } else {
            // Corrección: Eliminamos de forma limpia únicamente la clase 'active'
            boton.classList.remove('active');
        }
    });
}

function inicializarHome() {
    fetch(`./data/data.json?v=${new Date().getTime()}`)
        .then(res => res.json())
        .then(data => {
            const info = Array.isArray(data) ? data[0].bienvenida : data.bienvenida;
            if (!info) return;
            if (document.getElementById('hero-title')) document.getElementById('hero-title').innerText = info.titulo;
            if (document.getElementById('hero-subtitle')) document.getElementById('hero-subtitle').innerText = info.subtitulo;
            if (document.getElementById('hero-description')) document.getElementById('hero-description').innerText = info.descripcion;

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
        }).catch(err => console.error(err));
}

function inicializarFeeds() {
    let noticiasLocales = [];
    const contenedor = document.getElementById('rss-container');
    const selectorBusqueda = document.getElementById('rss-search');

    // Si por temas de asincronía el contenedor aún no está listo, cancelamos la ejecución para evitar congelamiento
    if (!contenedor) {
        console.warn("Advertencia: El contenedor 'rss-container' no se encontró en el DOM todavía.");
        return;
    }

    const fuentesConfig = {
        "sophos_threat": { nombre: "Sophos Threat", color: "#ff7b72", bg: "rgba(255,123,114,0.1)" },
        "sophos_ops": { nombre: "Sophos Ops", color: "#ffa657", bg: "rgba(255,166,87,0.1)" },
        "aws_news": { nombre: "AWS What's New", color: "#f29d38", bg: "rgba(242,157,56,0.1)" },
        "gcp_cloud": { nombre: "Google Cloud", color: "#79c0ff", bg: "rgba(121,192,255,0.1)" },
        "suse_news": { nombre: "SUSE Linux", color: "#56d364", bg: "rgba(86,211,100,0.1)" },
        "broadcom_vmware": { nombre: "VMware VCF", color: "#d2a8ff", bg: "rgba(210,168,255,0.1)" },
        "veeam_intel": { nombre: "Veeam Intel", color: "#388bfd", bg: "rgba(56,139,253,0.1)" },
        "hackerrank": { nombre: "HackerRank Tech", color: "#2ea44f", bg: "rgba(46,164,79,0.1)" }
    };

    function pintarEstructura(noticias) {
        if (noticias.length === 0) {
            contenedor.innerHTML = `<div class="loader-placeholder" style="grid-column: 1/-1;">No se encontraron registros de logs disponibles.</div>`;
            return;
        }

        contenedor.innerHTML = noticias.map(item => {
            const srcInfo = fuentesConfig[item.source] || { nombre: item.source, color: "#c9d1d9", bg: "#21262d" };
            
            // Procesamiento seguro de la cadena de fecha evitando colapsos del Inti
            let fechaTexto = "Reciente";
            if (item.date) {
                const fragmentos = item.date.split(' ');
                fechaTexto = fragmentos.length >= 4 ? fragmentos.slice(1, 4).join(' ') : item.date;
            }

            return `
                <article class="rss-card">
                    <div class="card-meta">
                        <span class="source-badge" style="color: ${srcInfo.color}; background-color: ${srcInfo.bg}; border: 1px solid ${srcInfo.color}33;">
                            ${srcInfo.nombre}
                        </span>
                        <time class="card-date">${fechaTexto}</time>
                    </div>
                    <h3 class="card-title">${item.title}</h3>
                    <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="card-link">
                        Leer reporte original ↗
                    </a>
                </article>
            `;
        }).join('');
    }

    if (selectorBusqueda) {
        selectorBusqueda.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtradas = noticiasLocales.filter(item => {
                const fuenteNombre = fuentesConfig[item.source]?.nombre.toLowerCase() || item.source.toLowerCase();
                return item.title.toLowerCase().includes(query) || fuenteNombre.includes(query);
            });
            pintarEstructura(filtradas);
        });
    }

    // Petición directa al JSON relativo a la raíz de la SPA
    fetch(`./data/feeds.json?v=${new Date().getTime()}`)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}: No se pudo acceder a los datos.`);
            return res.json();
        })
        .then(data => {
            noticiasLocales = Array.isArray(data) ? data : [];
            pintarEstructura(noticiasLocales);
        })
        .catch(err => {
            console.error("Error en inicializarFeeds:", err);
            contenedor.innerHTML = `
                <div style="color: #ff7b72; text-align: center; grid-column: 1/-1; padding: 40px;">
                    ⚠️ Error en el flujo de sincronización: Archivo data/feeds.json no encontrado o con formato incorrecto.
                </div>`;
        });
}

window.addEventListener('DOMContentLoaded', () => {
    navegarA('home');
});
