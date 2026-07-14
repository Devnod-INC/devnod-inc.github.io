# devnod-inc.github.io

Arquitectura base para el ecosistema digital de **devnod-inc**.

## Arquitectura de Datos
Este sitio implementa un patrón de **Data-Driven Static Architecture**. La separación de responsabilidades asegura un mantenimiento eficiente y escalabilidad técnica:

- `/data`: Fuente de verdad (*Source of Truth*) en formato JSON (proyectos, servicios, subredes).
- `/paginas`: Estructura modular de contenidos estáticos.
- `/admin`: Capa de lógica administrativa para gestión de contenidos.

## Flujo de Trabajo
El despliegue está orquestado mediante **GitHub Actions**, garantizando una integración continua (CI) que automatiza la sincronización de datos con el frontend estático.

## Principios Técnicos
* **Soberanía del dato:** Control total de la información mediante versionado.
* **Performance:** Carga optimizada sin dependencias de bases de datos centralizadas.
* **Seguridad:** Arquitectura *Serverless* reduciendo drásticamente la superficie de ataque.

---
*Construido con ingeniería pragmática para la web moderna.*
