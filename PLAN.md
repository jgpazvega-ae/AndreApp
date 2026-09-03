# Plan Maestro — AndreApp

> **App web (PWA) educativa e interactiva para niños de 0 a 5 años**, instalable en celulares y tabletas (iOS-first, no exclusiva). Inspirada en *Bimi Boo — Juegos para niños & niñas 2-5*, con la meta explícita de **superarla**: más currículo, mejor pedagogía, y diversión real.
>
> Este documento es el plan de producto + técnico + de negocio. La base pedagógica vive en [`docs/CURRICULUM.md`](docs/CURRICULUM.md) y es la fuente de verdad de qué se enseña y en qué orden.

**Decisiones ya confirmadas por el propietario:**
- Plataforma: **PWA** instalable (iOS-first, también Android/tablet).
- Monetización: **Mercado Pago** (MercadoLibre), **por nivel** o **licencia anual**; la licencia se libera tras **validación automática del pago o aprobación manual**.
- Audio: **ElevenLabs** (voces/sonidos).
- Idiomas: **Español (MX)** — etiqueta única "Español" + 🇲🇽 —, **Inglés**, **Português (Brasil)** 🇧🇷.
- Infraestructura: **Neubox** + **Render**.
- El agente asume **autonomía total** en decisiones técnicas; un **agente pedagógico** da feedback continuo.

---

## 1. Visión

Una PWA **offline-first, sin publicidad**, donde un niño de 0-5 aprende jugando a través de un currículo por niveles (ver `docs/CURRICULUM.md`), con **voz e íconos** (nada de texto para el niño), refuerzo positivo y cero castigo. Los padres compran acceso con **Mercado Pago** y gestionan todo desde una **zona de padres** protegida.

**Qué la hace mejor que la referencia** (resumen; detalle pedagógico en el currículo):
1. Currículo completo 0-5 (no solo números) y **adaptativo** (Zona de Desarrollo Próximo).
2. **Narrativa con personaje guía** → aprendizaje con sentido, no ejercicios sueltos.
3. **Nivel gratuito generoso** (sin muro de pago temprano) + compra por nivel o licencia anual.
4. **Localización real** (fonética es-MX / en / pt-BR), no traducción genérica.
5. **Panel de padres** con progreso pedagógico real.

---

## 2. Principios de diseño (producto)

Reglas duras para 0-5 (ver detalle en el currículo, §2):

| Principio | Implicación técnica |
|---|---|
| Audio + apoyo visual | Cada instrucción hablada se acompaña de **icono + demostración animada del gesto** (no "solo audio": excluiría a niños sordos). Texto solo en la zona de padres. |
| Botones grandes | Objetivos táctiles ≥ ~64 px, muy separados. |
| Gestos simples + alternativa | Solo *tocar* y *arrastrar lento*; **todo arrastre ofrece "tocar-tocar"** e **imán con radio de captura generoso**. Nunca multitáctil. |
| Sin castigo | El error nunca da sonido negativo ni bloquea; rebota suave y la pista sube de nivel. |
| Elogio de proceso | Acierto = animación + sonido + voz que felicita el **esfuerzo** ("¡lo intentaste!"), nunca el rasgo ("¡qué listo!"). Sin *loot*/recompensa aleatoria. |
| Sesiones saludables | Finales naturales, pausas activas y **límite de tiempo por defecto por edad**; la franja más pequeña, **uso acompañado** (ver §8). |
| Modo sensorial | Preset agrupado (menos animación + audio suave + ritmo lento) para perfiles neurodivergentes. |
| Zona de padres protegida | Candado para ajustes, compra y enlaces externos. |
| Privacidad primero | Sin datos del niño; sin analítica invasiva; lo sensible, del lado de Mercado Pago. |

### Restricciones específicas de PWA en iOS (críticas)
Confirmadas en investigación; condicionan la arquitectura:
- **Audio solo tras gesto del usuario** → implementar "desbloqueo de audio" en el primer toque de cada sesión (Howler/WebAudio). Clips **cortos** (evitar el bloqueo de autoplay > ~1 min).
- **Instalación manual** ("Añadir a pantalla de inicio") → onboarding con instrucciones ilustradas para iOS.
- **Cuota de almacenamiento ajustada** → precargar solo el paquete de idioma/nivel activo; el resto bajo demanda con Service Worker.
- **Service Worker con límites** en iOS → offline confiable para *assets* cacheados; no depender de push para lógica de licencia.

---

## 3. Alcance del producto

El **catálogo de juegos = los 22 niveles** del currículo (`docs/CURRICULUM.md`, §4), con dos ejes transversales (🧠 función ejecutiva, ❤️ socioemocional). Agrupación para roadmap:

- **Etapa A — Descubrimiento** (N1-N3): causa-efecto, tocar objetivo, emparejar idénticos. *(gratis, uso acompañado)*
- **Etapa B — Exploración** (N4-N8): clasificar, vocabulario, rompecabezas, ❤️ emociones, 🧠 para y sigue. *(gratis parcial)*
- **Etapa C — Fundamentos** (N9-N16): subitizar, contar 1-5 y 6-10, formas/patrones, memoria, conciencia fonológica oral, seriar/secuencia temporal, trazado. *(de pago)*
- **Etapa D — Preescolar** (N17-N22): números 11-20 y comparar, sumar, 🧠 flexibilidad + 2 atributos, letras/fonética, trazar, lectura temprana. *(de pago)*

**Empaquetado comercial:**
- **Gratis:** Etapa A completa + una muestra de la B (para que el niño se enganche y el padre valore).
- **Compra por nivel/etapa:** desbloqueo granular (por etapa C o D, o por mundos).
- **Licencia anual:** acceso total durante 12 meses, todos los idiomas, futuras actualizaciones incluidas.

---

## 4. Arquitectura técnica

Monorepo con frontend PWA, backend de licencias/pagos y paquetes compartidos.

```mermaid
flowchart TB
    subgraph Cliente["📱 PWA (React + Vite, offline-first)"]
        UI["Juegos + UI kid-friendly"]
        Audio["Motor de audio (Howler) + voces ElevenLabs pregeneradas"]
        SW["Service Worker (Workbox) + IndexedDB (progreso)"]
        Lic["Licencia cacheada (token firmado + validación)"]
    end
    subgraph Render["☁️ Render — Backend (Node + Fastify + TS)"]
        API["API REST"]
        Auth["Auth de padres (JWT / magic link)"]
        Pay["Servicio Mercado Pago (preferencias + webhook)"]
        Admin["Panel admin (aprobación manual)"]
        DB[("Postgres — usuarios, licencias, pagos")]
    end
    subgraph MP["💳 Mercado Pago"]
        Checkout["Checkout Pro"]
        WH["Webhook (x-signature)"]
    end
    subgraph Neubox["🌐 Neubox"]
        Dominio["Dominio + DNS + Correo"]
    end

    UI --> Audio --> SW
    Lic <-->|valida / renueva| API
    Auth --> DB
    Pay <-->|crea preferencia| Checkout
    Checkout -->|paga el padre| WH
    WH -->|notifica| Pay
    Pay -->|libera licencia| DB
    Admin --> DB
    Dominio -.app / api.-> Cliente
    Dominio -.-> Render
```

### 4.1 Frontend (PWA)
- **React + Vite + TypeScript**, PWA con **Workbox** (manifest, offline, precache selectivo).
- **Escenas de juego:** DOM/SVG + **framer-motion** para la mayoría; **canvas (Konva/PixiJS)** para trazado y juegos con dibujo. *(Phaser opcional si algún mundo pide arcade.)*
- **Audio:** **Howler.js** (compatibilidad + desbloqueo iOS). Voces **ElevenLabs pregeneradas** por idioma como *assets* estáticos (no TTS en runtime → barato, offline y consistente).
- **Estado/persistencia:** **Zustand** + **IndexedDB** (localForage) para progreso offline.
- **i18n:** **react-i18next**, locales `es-MX`, `en`, `pt-BR`.
- **Licencia en cliente:** token de entitlements **firmado** (JWT) cacheado, con caducidad + **revalidación** online periódica y **periodo de gracia** offline.

### 4.2 Backend (Render)
- **Node + Fastify + TypeScript**, **Prisma + Postgres** (Render Managed Postgres).
- **Auth de padres:** cuenta por correo (magic link o correo+contraseña) → JWT de sesión. El niño no tiene cuenta ni PII.
- **Pagos:** **Mercado Pago Checkout Pro** — crea preferencia, redirige, recibe **webhook** con validación **`x-signature`**; sandbox para pruebas.
- **Licencias:** tabla de *entitlements* (por nivel/etapa o anual all-access) ligada a la cuenta; emisión del token firmado que consume la PWA.
- **Panel admin:** ver ventas, **aprobar/liberar licencias manualmente**, reembolsos, estados de pago.
- **Cron (Render):** caducidad de licencias anuales, correos de recibo/renovación.

### 4.3 Infraestructura (Neubox + Render)
- **Neubox:** **dominio + DNS + correo** profesional (`hola@dominio`). *(Su hosting es cPanel/PHP y su VPS soporta Docker; no es ideal para un Node persistente, por eso el backend va en Render. Opcional a futuro: servir el frontend estático desde cPanel o consolidar en su VPS con Docker.)*
- **Render:** **backend web service** + **Postgres** + **cron**. El **frontend estático** puede ir en Render Static Site/CDN.
- **DNS:** `app.<dominio>` → PWA (CDN/Render Static), `api.<dominio>` → backend Render. TLS automático.
- **Secretos** (Mercado Pago, JWT, ElevenLabs) **solo en variables de entorno de Render**, nunca en el repo.

---

## 5. Flujo de pago y liberación de licencia

Soporta **liberación automática** (webhook) **y aprobación manual** (requisito del propietario).

```mermaid
sequenceDiagram
    participant P as Padre (PWA)
    participant API as Backend (Render)
    participant MP as Mercado Pago
    participant Admin as Propietario (Panel)

    P->>API: Elegir nivel / licencia anual
    API->>MP: Crear preferencia de pago
    MP-->>P: Checkout Pro (redirección)
    P->>MP: Paga
    MP-->>API: Webhook (payment.updated) + x-signature
    API->>MP: Consultar pago (verificar estado real)
    alt Modo automático y pago aprobado
        API->>API: Emitir/extender licencia + token firmado
        API-->>P: Licencia activa (revalida al abrir)
    else Modo revisión manual
        API->>Admin: Pago "pendiente de aprobación"
        Admin->>API: Aprobar y liberar
        API-->>P: Licencia activa
    end
```

Detalles clave:
- **Verificación doble:** nunca confiar solo en la redirección; validar `x-signature` **y** reconsultar el pago en la API de Mercado Pago antes de liberar.
- **Idempotencia:** un `payment.id` procesado dos veces no duplica licencias.
- **Interruptor por producto:** cada SKU puede configurarse como *auto* o *manual*.
- **PCI:** no tocamos datos de tarjeta; los maneja Mercado Pago.

---

## 6. Contenido y assets (ElevenLabs)

- **Voces por idioma** (es-MX cálida, en, pt-BR): instrucciones, números, nombres, frases de ánimo (con el nombre del niño si se configura). Se **pregeneran** con ElevenLabs mediante un **script versionado** (`scripts/gen-voices`), se revisan y se guardan como *assets* estáticos cacheados por el SW.
- **Efectos** (acierto, estrella, aplausos) y **música** suave con opción de silenciar.
- **Ilustraciones y animaciones** (personaje guía + celebraciones Lottie).
- ⚠️ **Licencias de assets:** todo con licencia clara para uso comercial. Voces ElevenLabs bajo su licencia comercial. Definir antes de la Fase 1.

---

## 7. Internacionalización

- Selector con **tres opciones**: **Español 🇲🇽** (etiqueta única "Español"), **English 🇺🇸**, **Português 🇧🇷**. *(La bandera de inglés es ajustable.)*
- Cada idioma tiene su **paquete de voces** y sus textos de la zona de padres.
- **Conciencia fonológica oral, letras y lectura (N14, N20, N22) rediseñados por idioma**, no traducidos (ver currículo §11): español silábico/CV, inglés opaco (rima + CVC, secuencia *s-a-t-p-i-n*), portugués con vocales nasales/dígrafos.
- **Revisión humana obligatoria** de los clips de **fonemas aislados** (ElevenLabs tiende a añadir "schwa"): no publicar sonidos de letras sin validarlos.
- Idioma persistente por dispositivo; cambiable desde la zona de padres.

---

## 8. Seguridad, privacidad y salud (app infantil)

- **Sin PII del niño** (a lo más, un nombre/apodo local para personalizar la voz, guardado en el dispositivo).
- **Tiempo de pantalla saludable** (OMS/AAP): **< ~18-24 m** solo uso acompañado; **2-5 años** hasta ~1 h/día con co-juego. **Límites por defecto por edad** en la zona de padres, con finales de sesión y pausas activas (ver currículo §8).
- **Zona de padres** con candado ante compras/ajustes/enlaces externos.
- Cumplimiento con la ley mexicana de datos (**LFPDPPP**) y buenas prácticas tipo **COPPA/GDPR-K** si se expande; **pagos y datos financieros** los procesa Mercado Pago.
- Analítica **mínima y respetuosa** (o nula en el MVP).
- Política de privacidad y términos publicados antes de cobrar.

---

## 9. Estructura del repositorio (propuesta)

```
AndreApp/
├─ apps/
│  ├─ web/                 # PWA (React + Vite): app/, juegos, motor de audio, i18n, SW
│  └─ api/                 # Backend (Fastify + Prisma): auth, pagos MP, licencias, admin
├─ packages/
│  ├─ curriculum/          # Datos de los 14 niveles (config declarativa de cada juego)
│  ├─ shared/              # Tipos compartidos (licencias, entitlements, DTOs)
│  └─ i18n/                # Cadenas + índice de paquetes de voz por idioma
├─ scripts/
│  └─ gen-voices/          # Generación de voces ElevenLabs (versionado)
├─ docs/
│  └─ CURRICULUM.md        # Fuente de verdad pedagógica
└─ PLAN.md                 # Este documento
```

---

## 10. Roadmap por fases

Estrategia: **validar la diversión y la pedagogía antes de cobrar.** Primero un MVP jugable y gratis; el pago llega cuando ya hay algo que valga la pena comprar.

| Fase | Entregable | Contenido |
|---|---|---|
| **0 · Fundaciones** | La PWA corre, instala y suena | Monorepo, PWA shell + manifest + SW offline, sistema de diseño kid-friendly, motor de audio con desbloqueo iOS, i18n base, store de progreso, pantalla de inicio con selector de mundos. |
| **1 · MVP jugable (gratis)** | 4-5 juegos en es-MX | Niveles **N1-N5** (Etapas A y B), voces ElevenLabs es-MX, progreso local, instalable, zona de padres básica. **Sin pagos aún.** Meta: ponerla en manos de Andre y medir enganche. |
| **2 · Cuentas y nube** | Padres + progreso sincronizado | Backend en Render, auth de padres, progreso en la nube, **panel de padres** con lectura pedagógica. |
| **3 · Monetización** | Cobro y licencias | **Mercado Pago Checkout Pro**, licencias **por nivel** y **anual**, webhook + validación, **panel admin con aprobación manual**, tokens de licencia en cliente + revalidación. |
| **4 · Currículo completo + idiomas** | Etapas C y D + en/pt-BR | Niveles **N6-N22** (incluye ejes 🧠 función ejecutiva y ❤️ socioemocional, subitización, conciencia fonológica oral), adaptividad (ZDP), trazado (canvas), fonética por idioma, paquetes de voz **en** y **pt-BR**. |
| **5 · Pulido y lanzamiento** | Listo para usuarios | Accesibilidad, música/animaciones finas, onboarding de instalación iOS, analítica respetuosa, términos/privacidad, dominio Neubox + despliegue productivo. |

**Sugerencia de secuencia mínima para ver valor pronto:** Fase 0 + Fase 1 (jugable con Andre) → luego decidir con datos reales antes de invertir en backend/pagos.

---

## 11. Métricas de éxito

- **Pedagógicas:** el niño progresa de nivel por **dominio** (no por edad) y transfiere aprendizajes fuera de la app.
- **De producto:** enganche (vuelve por gusto), sesiones sin frustración, tasa de finalización de rondas.
- **De negocio:** conversión de gratis→pago, renovación anual, reembolsos bajos.

---

## 12. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Límites de PWA en iOS (audio, cuota, instalación) | Desbloqueo de audio por gesto, clips cortos, precarga selectiva, onboarding de instalación. |
| Fraude/duplicidad de licencias | Validar `x-signature` + reconsulta a MP + idempotencia por `payment.id`. |
| Neubox no corre Node persistente | Backend en Render; Neubox solo dominio/DNS/correo (VPS Docker opcional a futuro). |
| Costos/licencia de voces ElevenLabs | Pregenerar (no runtime), revisar licencia comercial, cachear. |
| Alcance grande | Fases; MVP gratis primero; currículo por niveles permite entregar por partes. |
| Contenido no apto por edad | Validación del **agente pedagógico** en cada fase (ver currículo §11). |

---

## 13. Lo que necesitaré del propietario (para fases con infra/pago)

*(No bloquea las Fases 0-1, que son 100% locales.)*
- **Dominio** deseado (para configurarlo en Neubox) y acceso a DNS.
- **Credenciales de Mercado Pago** (Access Token productivo y de prueba) — se cargan como **variables de entorno en Render**, nunca en el repo.
- **API key de ElevenLabs** (para el script de generación de voces) — también por variable de entorno.
- **Cuenta de Render** conectada al repo.
- **Precios** por nivel/etapa y de la licencia anual, y qué SKUs son de **aprobación manual** vs **automática**.
- **Identidad de marca:** nombre y estilo del **personaje guía**, paleta y logo (o me das libertad para proponerlos).

---

## 14. Decisiones abiertas y feedback pedagógico

- **Bandera de inglés:** 🇺🇸 por defecto (ajustable a 🇬🇧 o globo neutro).
- **Auth de padres:** magic link (menos fricción) vs correo+contraseña — se define en Fase 2.
- **Motor de juego:** DOM/SVG + framer-motion por defecto; PixiJS/Phaser solo donde un mundo lo justifique.
- **Feedback del agente pedagógico:** se integra aquí y en `docs/CURRICULUM.md` en cada iteración. *(Ronda 1 **incorporada**: ejes de función ejecutiva y socioemocional, conciencia fonológica oral, sentido numérico corregido, tiempo de pantalla saludable, elogio de proceso e inclusión reforzada — ver `docs/CURRICULUM.md` §13.)*

---

## 15. Siguiente paso

Con el plan y el currículo validados por el especialista, arrancar la **Fase 0**: dejar la PWA corriendo (instalable, con audio y selector de mundos) y el primer juego **N1 · Causa y efecto** en español mexicano.
