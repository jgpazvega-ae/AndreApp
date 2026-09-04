# Generación de voces (ElevenLabs)

Proceso usado para generar los clips de `apps/web/public/audio/<locale>/`.

## Cómo se generaron los clips de N1 (es-MX)

En esta fase, los clips se generan **a través de una sesión de Claude Code
conectada a ElevenLabs** (conector MCP del workspace), no con un script que
llame a la API con una API key propia. Esto evita gestionar una API key en
CI/entorno y aprovecha el flujo de revisión conversacional (escuchar el
resultado, regenerar si hace falta, antes de guardarlo).

Pasos seguidos para N1:

1. Elegir voz con `creative_list_voices` filtrando por idioma/acento/tono
   (para es-MX: voz "Camila – Bringing Life to Every Word", acento mexicano
   cálido, `voice_id: spPXlKT5a4JMfbhPRAzA`).
2. Generar cada clip con `creative_generate_speech` (modelo
   `eleven_multilingual_v2`, `generations_count: 1`) dentro de un mismo
   `flow_id` para agruparlos.
3. Esperar a `all_completed` con `creative_get_flow_run_status`.
4. Descargar cada `media[].url` (firmada, expira en ~2h) a
   `apps/web/public/audio/<locale>/<archivo>.mp3` con `curl`.
5. Registrar el clip en `packages/i18n/src/voiceManifests/<locale>.ts` con
   `reviewed: false` hasta que un humano lo confirme (obligatorio para
   fonemas aislados — PLAN.md §7; recomendado también para palabras
   completas antes de publicar).

## Para el siguiente nivel (N2-N5, y luego en/pt-BR)

Repetir el mismo proceso: elegir voz apropiada al idioma/tono, generar los
clips necesarios en un flow compartido, descargarlos a
`apps/web/public/audio/<locale>/`, y añadir un manifiesto en
`packages/i18n/src/voiceManifests/<locale>.ts`.

Si el volumen crece y conviene automatizarlo (p. ej. regenerar todo el
catálogo de una vez), se puede migrar a un script Node que llame
directamente a la API REST de ElevenLabs con una API key en variable de
entorno (`ELEVENLABS_API_KEY`, nunca en el repo — ver PLAN.md §13). Por
ahora, con el volumen de esta fase, el flujo manual vía Claude es más
simple y permite revisar cada clip antes de aceptarlo.
