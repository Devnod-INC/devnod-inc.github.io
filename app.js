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

    // Diccionario de mapeo tecnológico a Badges de Shields.io (Estilo Plastic)
    const badgeMap = {
        "HTML5": "https://img.shields.io/badge/html5-%23E34F26.svg?style=plastic&logo=html5&logoColor=white",
        "CSS3": "https://img.shields.io/badge/css3-%231572B6.svg?style=plastic&logo=css3&logoColor=white",
        "JavaScript": "https://img.shields.io/badge/javascript-%23323330.svg?style=plastic&logo=javascript&logoColor=%23F7DF1E",
        "TypeScript": "https://img.shields.io/badge/typescript-%23007ACC.svg?style=plastic&logo=typescript&logoColor=white",
        "Node.js": "https://img.shields.io/badge/Node.js-%23339933.svg?style=plastic&logo=node.js&logoColor=white",
        "Java": "https://img.shields.io/badge/java-%23ED8B00.svg?style=plastic&logo=openjdk&logoColor=white",
        "C++": "https://img.shields.io/badge/C%2B%2B-%2300599C.svg?style=plastic&logo=c%2B%2B&logoColor=white",
        "Markdown": "https://img.shields.io/badge/markdown-%23000000.svg?style=plastic&logo=markdown&logoColor=white",
        "LaTeX": "https://img.shields.io/badge/latex-%23008080.svg?style=plastic&logo=latex&logoColor=white",
        
        // Mapeos adicionales basados en tu proyectos.json
        "Express": "https://img.shields.io/badge/express-%23000000.svg?style=plastic&logo=express&logoColor=white",
        "React": "https://img.shields.io/badge/react-%2320232a.svg?style=plastic&logo=react&logoColor=%2361DAFB",
        "React.js": "https://img.shields.io/badge/react-%2320232a.svg?style=plastic&logo=react&logoColor=%2361DAFB",
        "Spring-Boot": "https://img.shields.io/badge/spring_boot-%236DB33F.svg?style=plastic&logo=spring-boot&logoColor=white",
        "MySQL": "https://img.shields.io/badge/mysql-%2300f.svg?style=plastic&logo=mysql&logoColor=white",
        "Firebase": "https://img.shields.io/badge/firebase-%23039BE5.svg?style=plastic&logo=firebase&logoColor=orange",
        "JWT": "https://img.shields.io/badge/JWT-black.svg?style=plastic&logo=JSON%20web%20tokens",
        "Python": "https://img.shields.io/badge/python-%233776AB.svg?style=plastic&logo=python&logoColor=white",
        "GitHub-Actions": "https://img.shields.io/badge/github%20actions-%232088FF.svg?style=plastic&logo=githubactions&logoColor=white",
        "Linux-Systems": "https://img.shields.io/badge/linux-%23FCC624.svg?style=plastic&logo=linux&logoColor=black",
        "GitOps": "https://img.shields.io/badge/gitops-%23000000.svg?style=plastic&logo=git&logoColor=white",
        "Swagger": "https://img.shields.io/badge/-Swagger-%2385EA2D?style=plastic&logo=swagger&logoColor=black"
    };

    // Consumo local desde tu estructura de carpetas
    fetch(`./data/proyectos.json?v=${new Date().getTime()}`)
        .then(res => res.json())
        .then(data => {
            gridContainer.innerHTML = data.map(p => {
                // Generar las etiquetas img de los badges correspondientes
                const badgesHtml = p.stack.map(tech => {
                    // Si existe en el mapa, usa esa URL; si no, construye uno genérico gris plano
                    const badgeUrl = badgeMap[tech] || `https://img.shields.io/badge/${encodeURIComponent(tech)}-%2321262d.svg?style=plastic&logoColor=white`;
                    return `<img src="${badgeUrl}" alt="${tech}" title="${tech}">`;
                }).join('');

                // Modificar el texto del botón si la propiedad está restringida
                const isRestricted = p.url === "javascript:void(0);";
                const btnText = isRestricted ? "Acceso Restringido" : "Ver Documentación";
                const btnStyle = isRestricted ? "style='opacity: 0.6; cursor: not-allowed;'" : "";

                return `
                    <article class="project-card">
                        <div class="card-header">
                            <h3>${p.nombre}</h3>
                            <span style="color: ${p.estado === 'Activo' ? '#58a6ff' : '#ffa657'}; font-size: 0.85rem; font-weight: 500;">
                                ● ${p.estado}
                            </span>
                        </div>
                        <p class="description">${p.descripcion}</p>
                        <div class="stack-tags">
                            ${badgesHtml}
                        </div>
                        <a href="${p.url}" target="${isRestricted ? '_self' : '_blank'}" class="btn-primary" ${btnStyle}>
                            ${btnText}
                        </div>
                    </article>
                `;
            }).join('');
        })
        .catch(err => {
            console.error("Error al cargar el catálogo local:", err);
            gridContainer.innerHTML = `<p class="error-msg" style="color: #ff7b72; text-align: center; padding: 20px;">⚠️ Error: No se pudo cargar el registro de activos de red.</p>`;
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
