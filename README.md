# AndreApp

Repositorio del producto **Anico** — PWA educativa para niños de 0 a 5 años.

- [`PLAN.md`](PLAN.md) — plan de producto, técnico y de negocio.
- [`docs/CURRICULUM.md`](docs/CURRICULUM.md) — mapa curricular (fuente de verdad pedagógica).
- [`docs/AGREGAR-UN-NIVEL.md`](docs/AGREGAR-UN-NIVEL.md) — cómo construir uno de los 17 niveles que faltan.

## Puesta en marcha

```bash
npm install
npm run dev        # desarrollo
npm run build      # build de producción + Service Worker
npm run preview    # sirve el build
```

## Verificación

```bash
npm run check      # lint + tipos + pruebas unitarias (lo mismo que corre CI)
npm run test:e2e   # recorrido completo en un iPhone emulado (requiere build previo)
npm run format     # aplica Prettier
```

`npm run test:e2e` levanta el build por su cuenta. En máquinas con Chromium
preinstalado y sin permiso para descargar navegadores, se le indica cuál usar:

```bash
PLAYWRIGHT_CHROMIUM_PATH=/ruta/a/chromium npm run test:e2e
```

## Estructura

| Ruta                  | Qué vive ahí                                                       |
| --------------------- | ------------------------------------------------------------------ |
| `apps/web`            | La PWA (React + Vite): pantallas, juegos, audio, estado.            |
| `packages/curriculum` | Catálogo declarativo de los 22 niveles y sus etapas.                |
| `packages/i18n`       | Cadenas en es-MX / en / pt-BR y manifiestos de voz.                 |
| `packages/shared`     | Tipos e identidad de marca compartidos (`APP_NAME`).                |
| `scripts/`            | Generación de assets (íconos, recorte de PNG) sin dependencias.     |

## Publicación

`main` se despliega solo a GitHub Pages. Requiere haber habilitado una vez:
**Settings → Pages → Build and deployment → Source: "GitHub Actions"**.
