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
            'acerca': inicializarAcerca,
            'proyectos': inicializarProyectos,
            'contacto': inicializarContacto
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
            
            // Actualización de Títulos
            const mTitle = document.getElementById('mision-title');
            const vTitle = document.getElementById('vision-title');
            
            if (mTitle) mTitle.innerText = info.mision_titulo;
            if (vTitle) vTitle.innerText = info.vision_titulo;
            
            // Actualización de Textos
            const mText = document.getElementById('mision-text');
            const vText = document.getElementById('vision-text');
            
            if (mText) mText.innerText = info.mision_texto;
            if (vText) vText.innerText = info.vision_texto;
        })
        .catch(err => console.error("Error al sincronizar vectores de misión:", err));
}

function inicializarPolitica() {
    fetch(`./data/data.json?v=${new Date().getTime()}`)
        .then(res => res.json())
        .then(data => {
            const info = data.politica;
            if (!info) return;

            // Actualizar Título e Intro
            const titleEl = document.getElementById('policy-title');
            const introEl = document.getElementById('policy-intro');
            const containerEl = document.getElementById('policy-container');

            if (titleEl) titleEl.innerText = info.titulo;
            if (introEl) introEl.innerText = info.intro;

            // Actualizar Grid de políticas
            if (containerEl && info.secciones) {
                containerEl.innerHTML = info.secciones.map(s => `
                    <div class="policy-card">
                        <h3>${s.titulo}</h3>
                        <p>${s.contenido}</p>
                    </div>`).join('');
            }
        })
        .catch(err => {
            console.error("Error crítico al cargar políticas:", err);
            const titleEl = document.getElementById('policy-title');
            if (titleEl) titleEl.innerText = "Error al cargar políticas";
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

function inicializarProyectos() {
    const gridContainer = document.getElementById('proyectos-grid');
    if (!gridContainer) return;

    // Diccionario estandarizado (Clave en minúsculas para evitar fallos de case-sensitivity)
    const badgeMap = {
        "html5": "https://img.shields.io/badge/html5-%23E34F26.svg?style=plastic&logo=html5&logoColor=white",
        "css3": "https://img.shields.io/badge/css3-%231572B6.svg?style=plastic&logo=css3&logoColor=white",
        "javascript": "https://img.shields.io/badge/javascript-%23323330.svg?style=plastic&logo=javascript&logoColor=%23F7DF1E",
        "javascript-async": "https://img.shields.io/badge/javascript-%23323330.svg?style=plastic&logo=javascript&logoColor=%23F7DF1E",
        "typescript": "https://img.shields.io/badge/typescript-%23007ACC.svg?style=plastic&logo=typescript&logoColor=white",
        "node.js": "https://img.shields.io/badge/Node.js-%23339933.svg?style=plastic&logo=node.js&logoColor=white",
        "java": "https://img.shields.io/badge/java-%23ED8B00.svg?style=plastic&logo=openjdk&logoColor=white",
        "c++": "https://img.shields.io/badge/C%2B%2B-%2300599C.svg?style=plastic&logo=c%2B%2B&logoColor=white",
        "core-c++": "https://img.shields.io/badge/C%2B%2B-%2300599C.svg?style=plastic&logo=c%2B%2B&logoColor=white",
        "markdown": "https://img.shields.io/badge/markdown-%23000000.svg?style=plastic&logo=markdown&logoColor=white",
        "latex": "https://img.shields.io/badge/latex-%23008080.svg?style=plastic&logo=latex&logoColor=white",
        "express": "https://img.shields.io/badge/express-%23000000.svg?style=plastic&logo=express&logoColor=white",
        "react": "https://img.shields.io/badge/react-%2320232a.svg?style=plastic&logo=react&logoColor=%2361DAFB",
        "react.js": "https://img.shields.io/badge/react-%2320232a.svg?style=plastic&logo=react&logoColor=%2361DAFB",
        "spring-boot": "https://img.shields.io/badge/spring_boot-%236DB33F.svg?style=plastic&logo=spring-boot&logoColor=white",
        "mysql": "https://img.shields.io/badge/mysql-%2300758F.svg?style=plastic&logo=mysql&logoColor=white",
        "firebase": "https://img.shields.io/badge/firebase-%23039BE5.svg?style=plastic&logo=firebase&logoColor=orange",
        "jwt": "https://img.shields.io/badge/JWT-black.svg?style=plastic&logo=JSON%20web%20tokens",
        "python": "https://img.shields.io/badge/python-%233776AB.svg?style=plastic&logo=python&logoColor=white",
        "github-actions": "https://img.shields.io/badge/github%20actions-%232088FF.svg?style=plastic&logo=githubactions&logoColor=white",
        "linux-systems": "https://img.shields.io/badge/linux-%23FCC624.svg?style=plastic&logo=linux&logoColor=black",
        "gitops": "https://img.shields.io/badge/gitops-%23000000.svg?style=plastic&logo=git&logoColor=white",
        "swagger": "https://img.shields.io/badge/-Swagger-%2385EA2D?style=plastic&logo=swagger&logoColor=black",
        "prisma-orm": "https://img.shields.io/badge/Prisma-2BN24E?style=plastic&logo=Prisma&logoColor=white",
        "jekyll": "https://img.shields.io/badge/Jekyll-%23CC0000.svg?style=plastic&logo=jekyll&logoColor=white"
    };

    fetch(`./data/proyectos.json?v=${new Date().getTime()}`)
        .then(res => res.json())
        .then(data => {
            gridContainer.innerHTML = data.map(p => {
                // Validación de seguridad por si alguna tarjeta viene corrupta en el JSON
                if (!p.nombre || !p.stack) return '';

                // Generación segura de Badges
                const badgesHtml = p.stack.map(tech => {
                    const normalizedTech = tech.toLowerCase().trim();
                    // Si existe en el mapa lo usa; si no, genera dinámicamente un badge neutro sin romper el flujo
                    const badgeUrl = badgeMap[normalizedTech] || `https://img.shields.io/badge/${encodeURIComponent(tech)}-%2321262d.svg?style=plastic`;
                    return `<img src="${badgeUrl}" alt="${tech}" title="${tech}" style="margin-right: 4px; margin-bottom: 4px; height: 20px; vertical-align: middle;">`;
                }).join('');

                // Control del estado del botón (Proyectos privados vs públicos)
                const isRestricted = p.url === "javascript:void(0);" || !p.url;
                const btnText = isRestricted ? "Propiedad Restringida" : "Ver Documentación";
                const btnClass = isRestricted ? "btn-primary restricted-btn" : "btn-primary";
                const targetAttr = isRestricted ? "" : 'target="_blank"';

                return `
                    <article class="project-card">
                        <div class="card-header">
                            <h3>${p.nombre}</h3>
                            <span class="status-indicator" style="color: ${p.estado === 'Activo' ? '#58a6ff' : '#ffa657'}">
                                ● ${p.estado}
                            </span>
                        </div>
                        <p class="description">${p.descripcion}</p>
                        <div class="stack-tags" style="display: flex; flex-wrap: wrap; margin-bottom: 15px;">
                            ${badgesHtml}
                        </div>
                        <a href="${p.url}" ${targetAttr} class="${btnClass}">
                            ${btnText}
                        </a>
                    </article>
                `;
            }).join('');
        })
        .catch(err => {
            console.error("Error crítico en el catálogo:", err);
            gridContainer.innerHTML = `<p class="error-msg">⚠️ Error del SOC: No se pudo sincronizar el registro de activos.</p>`;
        });
}

function inicializarContacto() {
    const checkAuth = setInterval(() => {
        if (window.auth) {
            clearInterval(checkAuth);
            
            const authArea = document.getElementById('auth-area');
            const contactForm = document.getElementById('contactForm');
            const btnLogin = document.getElementById('btn-login');
            const btnSubmit = document.getElementById('btn-submit');
            const successMsg = document.getElementById('success-message');
            const selectServicio = document.getElementById('servicio');
            const userInfo = document.getElementById('user-info');
            
            if (!authArea || !contactForm) return;

            // 1. Gestión de estado de Firebase Auth
            window.auth.onAuthStateChanged(user => {
                if (user) {
                    authArea.style.display = 'none';
                    contactForm.style.display = 'block';
                    if (userInfo) userInfo.innerText = `Autenticado como: ${user.email}`;
                    
                    document.getElementById('user_name').value = user.displayName || "Usuario Google";
                    document.getElementById('user_email').value = user.email;

                    fetch(`./data/servicios.json?v=${new Date().getTime()}`)
                        .then(res => res.json())
                        .then(servicios => {
                            selectServicio.innerHTML = '<option value="">-- Seleccione una categoría --</option>' + 
                                servicios.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
                        })
                        .catch(err => console.error("Error al cargar servicios:", err));
                } else {
                    authArea.style.display = 'block';
                    contactForm.style.display = 'none';
                    
                    btnLogin.onclick = async () => {
                        try {
                            const { GoogleAuthProvider, signInWithPopup } = await import("https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js");
                            await signInWithPopup(window.auth, new GoogleAuthProvider());
                        } catch (err) {
                            console.error("Error en login:", err);
                        }
                    };
                }
            });

            // 2. Gestión de envío AJAX (sin recarga)
            contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                btnSubmit.disabled = true;
                btnSubmit.innerText = "Enviando al SOC...";

                const formData = new FormData(contactForm);
                try {
                    const response = await fetch("https://formspree.io/f/xzdqyzba", {
                        method: "POST",
                        body: formData,
                        headers: { 'Accept': 'application/json' }
                    });

                    if (response.ok) {
                        contactForm.style.display = 'none';
                        if (successMsg) successMsg.style.display = 'block';
                    } else {
                        throw new Error("Respuesta no OK de Formspree");
                    }
                } catch (err) {
                    console.error("Error de envío:", err);
                    alert("Error en la transmisión. Intenta de nuevo.");
                    btnSubmit.disabled = false;
                    btnSubmit.innerText = "Enviar Solicitud al SOC";
                }
            });
        }
    }, 50);
}

window.addEventListener('DOMContentLoaded', () => navegarA('home'));
