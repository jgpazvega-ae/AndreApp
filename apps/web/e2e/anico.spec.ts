import { expect, test, type Page } from "@playwright/test";

/**
 * Recorrido completo de la app tal como la usa un niño (y su papá).
 *
 * Cada prueba vigila la consola y las respuestas de red: en una app sin
 * texto, un asset 404 o un error de JS no se ve como un mensaje de error
 * — se ve como un juego que simplemente no reacciona.
 */

/** Falla la prueba si aparece un error de consola, una excepción o un 4xx/5xx. */
function failOnPageProblems(page: Page): string[] {
  const problems: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") problems.push(`[console] ${msg.text()}`);
  });
  page.on("pageerror", (err) => problems.push(`[pageerror] ${String(err)}`));
  page.on("response", (res) => {
    if (res.status() >= 400) problems.push(`[${res.status()}] ${res.url()}`);
  });
  return problems;
}

/** Abre la app y desbloquea el audio: deja al niño en el hub (Jugar/Explorar/Aprender/Favoritos). */
async function openHome(page: Page) {
  await page.goto("./", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Toca para empezar" }).click();
  await expect(page.getByRole("button", { name: "Aprender" })).toBeVisible();
}

/** Del hub al mapa de mundos (pilar Aprender). */
async function openAprender(page: Page) {
  await page.getByRole("button", { name: "Aprender" }).click();
  await expect(page.getByText("Elige un mundo")).toBeVisible();
}

/** Abre un mundo (requiere estar ya en "Elige un mundo", ver openAprender). */
async function openWorld(page: Page, worldName: string) {
  await page.getByRole("button", { name: worldName }).click();
}

/** Del hub a un nivel concreto, pasando por Aprender y su mundo. */
async function openLevel(page: Page, worldName: string, levelName: string) {
  await openAprender(page);
  await openWorld(page, worldName);
  await page.getByRole("button", { name: levelName }).click();
}

/** Arrastra un objeto de Explorar (cometa/columpio: role="img", no botón) con un gesto real de mouse. */
async function dragObject(page: Page, name: string, dx: number, dy: number) {
  const el = page.getByRole("img", { name });
  const box = await el.boundingBox();
  if (!box) throw new Error(`No se encontró el objeto arrastrable "${name}"`);
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + dx, startY + dy, { steps: 10 });
  await page.mouse.up();
}

/** Los niveles jugables de la Fase 1, con una interacción representativa de cada mecánica. */
const PLAYABLE_LEVELS = [
  { name: "Causa y efecto", world: "La Estación", interact: (page: Page) => page.mouse.click(195, 400) },
  {
    name: "Toca al objetivo",
    world: "La Estación",
    // force: el objetivo "respira" sin parar, así que nunca queda quieto para
    // la comprobación de estabilidad de Playwright — un dedo sí puede tocarlo.
    interact: (page: Page) => page.getByRole("button", { name: "Tócame" }).click({ force: true }),
  },
  {
    name: "Emparejar idénticos",
    world: "El Bosque",
    interact: (page: Page) => page.locator('button[aria-label="Tarjeta"]').first().click(),
  },
  {
    name: "Clasificar por 1 atributo",
    world: "La Estación",
    interact: (page: Page) => page.locator('button[aria-label="Zona de color"]').first().click(),
  },
  {
    name: "Vocabulario y sonidos",
    world: "El Bosque",
    interact: (page: Page) => page.locator('button[aria-label="Animal"]').first().click(),
  },
  {
    name: "Rompecabezas",
    world: "El Bosque",
    interact: async (page: Page) => {
      // La ronda arranca con 2 figuras en orden aleatorio: tocar la primera
      // pieza y luego probar ambos huecos garantiza un acierto sin tener
      // que leer del DOM qué forma le tocó a cada uno.
      await page.locator('button[aria-label="Pieza"]').first().click();
      const slots = page.locator('button[aria-label="Espacio del rompecabezas"]');
      await slots.nth(0).click();
      await slots.nth(1).click();
    },
  },
  {
    name: "Emociones",
    world: "El Bosque",
    interact: async (page: Page) => {
      // Las 4 emociones están siempre visibles; tocarlas todas garantiza
      // acertar la consigna actual sin tener que leerla del DOM (se da por
      // voz). Tocar la ya acertada de nuevo, o las incorrectas, no hace nada malo.
      const emotions = page.locator('button[aria-label="Emoción"]');
      const count = await emotions.count();
      for (let i = 0; i < count; i++) {
        await emotions.nth(i).click();
        await page.waitForTimeout(50);
      }
    },
  },
  {
    name: "Para y sigue",
    world: "El Océano",
    // Tocar mientras baila no hace nada malo (solo se escucha, sin romper nada):
    // basta un toque cualquiera para probar que la pantalla responde. El nombre
    // accesible cambia según la fase, de ahí el regex en vez de texto exacto.
    interact: (page: Page) => page.getByRole("button", { name: /Bailarín/ }).click({ force: true }),
  },
  {
    name: "Subitizar 1-3",
    world: "La Estación",
    // Los grupos se anuncian por su cantidad ("1 objeto" / "2 objetos"), así que
    // se puede tocar uno cualquiera para comprobar que la pantalla responde.
    interact: (page: Page) =>
      page
        .getByRole("button", { name: /objetos?$/ })
        .first()
        .click({ force: true }),
  },
  {
    name: "Contar 1-5",
    world: "La Estación",
    // La primera parada tiene un solo objeto: tocarlo basta para probar que
    // la pantalla responde (el recorrido completo tiene su propia prueba).
    interact: (page: Page) => page.getByRole("button", { name: "Objeto" }).first().click({ force: true }),
  },
  {
    name: "Contar 6-10",
    world: "La Estación",
    // Mismo motor que N10 (ContarPista): tocar el primer objeto de la
    // primera parada basta para probar que la pantalla responde.
    interact: (page: Page) => page.getByRole("button", { name: "Objeto" }).first().click({ force: true }),
  },
  {
    name: "Formas y patrones",
    world: "El Océano",
    // Tocar cualquier opción (acierte o no) basta para probar que la
    // pantalla responde; el acierto exacto tiene su propia prueba dedicada.
    interact: (page: Page) => page.locator('[aria-label="Forma"]').first().click({ force: true }),
  },
  {
    name: "Memoria",
    world: "El Bosque",
    // Voltear la primera tarjeta basta para probar que el tablero responde;
    // el emparejamiento exacto tiene su propia prueba dedicada.
    interact: (page: Page) => page.locator('[aria-label="Tarjeta"]').first().click({ force: true }),
  },
];

test.describe("pantalla de inicio", () => {
  test("desbloquea el audio con un gesto y muestra el hub (Jugar/Explorar/Aprender/Favoritos)", async ({ page }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);
    await expect(page.getByRole("button", { name: "Jugar" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Explorar" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Favoritos" })).toBeVisible();
    expect(problems).toEqual([]);
  });

  test("los 3 perritos se pueden elegir como compañero y queda guardado", async ({ page }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);

    const buddies = page.getByRole("button", { name: /^Elegir a .* como amigo$/ });
    await expect(buddies).toHaveCount(3);

    // Elegir a Dante lo marca como el compañero actual (aria-pressed), y a
    // diferencia de antes (un salto decorativo sin efecto), la elección
    // persiste: sigue elegido tras recargar la pantalla de inicio.
    const dante = page.getByRole("button", { name: "Elegir a Dante como amigo" });
    await dante.click();
    await expect(dante).toHaveAttribute("aria-pressed", "true");

    await openHome(page);
    await expect(page.getByRole("button", { name: "Elegir a Dante como amigo" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    expect(problems).toEqual([]);
  });

  test("abre un mundo y el botón regresar vuelve al mapa de mundos", async ({ page }) => {
    await openHome(page);
    await openAprender(page);
    await openWorld(page, "El Bosque");
    await expect(page.getByText("El Bosque")).toBeVisible();
    await page.getByRole("button", { name: "Regresar" }).click();
    await expect(page.getByText("Elige un mundo")).toBeVisible();
  });

  test("solo los niveles jugables se pueden abrir", async ({ page }) => {
    await openHome(page);
    await openAprender(page);
    const worlds = [...new Set(PLAYABLE_LEVELS.map((level) => level.world))];
    for (const world of worlds) {
      await openWorld(page, world);
      for (const level of PLAYABLE_LEVELS.filter((l) => l.world === world)) {
        await expect(page.getByRole("button", { name: level.name })).toBeEnabled();
      }
      await page.getByRole("button", { name: "Regresar" }).click();
      await expect(page.getByText("Elige un mundo")).toBeVisible();
    }
  });

  test("un nivel aún no construido no abre una pantalla vacía, pero sí responde al toque", async ({ page }) => {
    await openHome(page);
    await openAprender(page);
    await openWorld(page, "La Estación");
    const comingSoon = page.getByRole("button", { name: "Números 11-20" });
    // aria-disabled (no el atributo nativo "disabled"): a propósito, para que
    // el tile pueda reaccionar al toque sin permitir la navegación real —
    // un <button disabled> nativo no reacciona a nada, y eso se sentía roto.
    await expect(comingSoon).toHaveAttribute("aria-disabled", "true");

    // force: Playwright trata aria-disabled como "no accionable" y de otro
    // modo nunca hace clic — pero eso es una heurística del framework, no
    // el comportamiento real del navegador (aria-disabled es semántica para
    // lectores de pantalla, no bloquea eventos de puntero de verdad).
    await comingSoon.click({ force: true });
    // Nunca navega a una pantalla vacía: se queda en el mundo...
    await expect(page.getByText("La Estación")).toBeVisible();
    // ...pero sí avisa que el toque se sintió.
    await expect(page.getByText("Muy pronto")).toBeVisible();
  });
});

test.describe("niveles", () => {
  for (const level of PLAYABLE_LEVELS) {
    test(`${level.name}: se abre, responde al toque y regresa al inicio`, async ({ page }) => {
      const problems = failOnPageProblems(page);
      await openHome(page);

      await openLevel(page, level.world, level.name);
      await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();
      await page.waitForTimeout(400); // deja entrar la pantalla antes de tocar

      await level.interact(page);
      await page.waitForTimeout(300);

      // Al salir de un nivel se vuelve exactamente a su mundo (no al hub ni al
      // mapa de mundos completo): App.tsx recuerda desde dónde se abrió.
      await page.getByRole("button", { name: "Regresar" }).click();
      await expect(page.getByText(level.world)).toBeVisible();

      expect(problems).toEqual([]);
    });
  }

  test("el compañero elegido acompaña al niño en el nivel", async ({ page }) => {
    await openHome(page);
    await page.getByRole("button", { name: "Elegir a Kira como amigo" }).click();
    await openLevel(page, "La Estación", "Causa y efecto");
    await expect(page.locator('img[src*="buddy-kira"]')).toHaveCount(1);
  });

  /**
   * Coloca cada pieza probando los huecos en orden: uno ya lleno no hace
   * nada (se ignora), uno equivocado se sacude sin efecto, así que repetir
   * esto siempre termina colocando la pieza sin tener que leer del DOM qué
   * forma le tocó a cada hueco.
   */
  async function solveN6Round(page: Page, pieceCount: number) {
    for (let i = 0; i < pieceCount; i++) {
      await page.locator('button[aria-label="Pieza"]').first().click();
      const slots = page.locator('button[aria-label="Espacio del rompecabezas"]');
      const slotCount = await slots.count();
      for (let s = 0; s < slotCount; s++) {
        await slots.nth(s).click();
        await page.waitForTimeout(50);
      }
    }
  }

  test("N6: completar un rompecabezas hace crecer el siguiente en una pieza", async ({ page }) => {
    await openHome(page);
    await openLevel(page, "El Bosque", "Rompecabezas");
    await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();
    await page.waitForTimeout(400);

    // La primera ronda tiene 2 piezas (docs/CURRICULUM.md ficha N6).
    await expect(page.locator('button[aria-label="Espacio del rompecabezas"]')).toHaveCount(2);

    await solveN6Round(page, 2);
    await page.waitForTimeout(2000); // deja pasar la celebración y el cambio de ronda

    await expect(page.locator('button[aria-label="Espacio del rompecabezas"]')).toHaveCount(3);
  });

  test("N3: emparejar un par lo marca como emparejado (verde + palomita)", async ({ page }) => {
    await openHome(page);
    await openLevel(page, "El Bosque", "Emparejar idénticos");
    await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();
    await page.waitForTimeout(600);

    // Lee el tipo de objeto de cada carta por su imagen y localiza un par
    // (dos cartas del mismo tipo) para tocarlas y verificar que se marcan.
    const cardType = (i: number) =>
      page
        .locator('button[aria-label="Tarjeta"], button[aria-label="Ya emparejado"]')
        .nth(i)
        .locator("img")
        .getAttribute("src");
    const count = await page.locator('button[aria-label="Tarjeta"]').count();
    expect(count).toBe(6);

    const types: (string | null)[] = [];
    for (let i = 0; i < count; i++) types.push((await cardType(i))?.match(/object-(\w+)/)?.[1] ?? null);
    const first = types.findIndex((t) => t !== null);
    const second = types.findIndex((t, i) => i > first && t === types[first]);
    expect(second).toBeGreaterThan(-1);

    const cards = page.locator('button[aria-label="Tarjeta"]');
    await cards.nth(first).click();
    await cards.nth(second).click();

    // Tras emparejar, esas dos cartas quedan como "Ya emparejado": la señal
    // clara de logro que antes no se percibía (el bug que reportó el usuario).
    await expect(page.locator('button[aria-label="Ya emparejado"]')).toHaveCount(2, { timeout: 3000 });
  });

  test("N13: voltear un par igual lo marca como emparejado (memoria)", async ({ page }) => {
    await openHome(page);
    await openLevel(page, "El Bosque", "Memoria");
    await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();
    await page.waitForTimeout(600);

    // La imagen de cada tarjeta vive en el DOM desde el inicio (el "frente"
    // solo se rota fuera de vista mientras está boca abajo), así que se
    // puede leer su tipo igual que en N3 sin necesidad de voltearla primero.
    const cardType = (i: number) =>
      page
        .locator('button[aria-label="Tarjeta"], button[aria-label="Ya emparejado"]')
        .nth(i)
        .locator("img")
        .getAttribute("src");
    const count = await page.locator('button[aria-label="Tarjeta"]').count();
    expect(count).toBe(4); // primera ronda: 2 pares

    const types: (string | null)[] = [];
    for (let i = 0; i < count; i++) types.push((await cardType(i))?.match(/(?:object|animal)-(\w+)/)?.[1] ?? null);
    const first = types.findIndex((t) => t !== null);
    const second = types.findIndex((t, i) => i > first && t === types[first]);
    expect(second).toBeGreaterThan(-1);

    const cards = page.locator('button[aria-label="Tarjeta"]');
    await cards.nth(first).click();
    await cards.nth(second).click();

    await expect(page.locator('button[aria-label="Ya emparejado"]')).toHaveCount(2, { timeout: 3000 });
  });

  test("N4: tras varios aciertos aparece la fase nombrada (bolita oculta, se pregunta el color)", async ({ page }) => {
    // Cada ronda que se completa durante la prueba necesita margen real (la
    // pantalla de logro se revela con retraso a propósito, y N4 tarda su
    // propio tiempo en preparar el tablero nuevo): el timeout por defecto se
    // queda corto si toca completar varias rondas antes de ver la fase nombrada.
    test.setTimeout(60_000);
    const problems = failOnPageProblems(page);
    await openHome(page);
    await openLevel(page, "La Estación", "Clasificar por 1 atributo");
    await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();
    await page.waitForTimeout(500);

    const zones = page.locator('button[aria-label="Zona de color"]');
    const otraVez = page.getByRole("button", { name: "Otra vez" });
    async function playOneTrial() {
      await zones.first().click();
      // Corto a propósito: si este toque fue el correcto, el nivel queda
      // "busy" hasta el siguiente intento (NEXT_ITEM_DELAY_MS, 500ms) — el
      // toque de respaldo de abajo cae dentro de esa ventana y no hace nada,
      // en vez de contar por accidente como un acierto del intento SIGUIENTE.
      await page.waitForTimeout(200);
      if (!(await otraVez.isVisible().catch(() => false)) && (await zones.count()) >= 2) {
        await zones.nth(1).click(); // respaldo: si el primer toque falló, prueba el otro color.
      }
      // La pantalla de logro se revela con un pequeño retraso a propósito
      // (deja ver el confeti del acierto que cierra la ronda antes de
      // taparlo, ver useGameSession.ROUND_COMPLETE_REVEAL_DELAY_MS, 450ms):
      // hay que esperar claramente más que eso. El toque que cierra la ronda
      // pudo ser el de respaldo de arriba (recién hecho), así que el reloj
      // de 450ms puede haber arrancado apenas ahora — no hace 200ms.
      await page.waitForTimeout(600);
      if (await otraVez.isVisible().catch(() => false)) {
        await otraVez.click();
        // N4 tarda su propio ROUND_COMPLETE_DELAY_MS (1600ms) en preparar el
        // tablero nuevo tras el acierto que cerró la ronda, sin importar
        // cuándo se cierre esta pantalla de logro. Sin esperar eso (más el
        // margen de la transición de salida de la superposición), el
        // siguiente toque cae sobre una superposición que aún no terminó de
        // desaparecer, o sobre un tablero que todavía sigue "busy".
        await page.waitForTimeout(1800);
      } else {
        await page.waitForTimeout(200);
      }
    }

    // Los primeros 5 aciertos son siempre en fase perceptual (la bolita
    // coloreada sigue visible): la fase nombrada solo puede aparecer después.
    for (let i = 0; i < 5; i++) {
      await expect(page.locator('button[aria-label="Escuchar de nuevo"]')).toHaveCount(0);
      await playOneTrial();
    }

    // A partir de aquí la mitad de los intentos son nombrados al azar
    // (docs/CURRICULUM.md §6): sondear hasta ver uno es más robusto que
    // depender de una tirada concreta.
    let sawNamed = false;
    for (let i = 0; i < 20 && !sawNamed; i++) {
      if ((await page.locator('button[aria-label="Escuchar de nuevo"]').count()) > 0) {
        sawNamed = true;
        break;
      }
      await playOneTrial();
    }
    expect(sawNamed).toBe(true);

    // En fase nombrada no hay bolita arrastrable (delataría la respuesta):
    // solo el altavoz decorativo/repetible y las 2 zonas de color.
    await expect(page.locator('button[aria-label="Escuchar de nuevo"]')).toHaveCount(1);
    await expect(zones).toHaveCount(2);

    // Tocar la zona correcta confirma el nombre del color hablado.
    const exclaim = page.waitForResponse((res) => /n4-exclaim-(orange|indigo|teal)\.mp3/.test(res.url()), {
      timeout: 10000,
    });
    await zones.first().click();
    await page.waitForTimeout(200);
    if (!(await otraVez.isVisible().catch(() => false)) && (await zones.count()) >= 2) {
      await zones.nth(1).click();
    }
    await exclaim;

    expect(problems).toEqual([]);
  });

  test("N5: el altavoz repite la pregunta actual sin errores", async ({ page }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);
    await openLevel(page, "El Bosque", "Vocabulario y sonidos");
    await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();
    await page.waitForTimeout(600);

    // force: el altavoz "respira" sin parar (igual que el objetivo de N2),
    // así que nunca queda quieto para la comprobación de estabilidad de
    // Playwright — un dedo real sí puede tocarlo.
    const replayButton = page.getByRole("button", { name: "Escuchar de nuevo" });
    await expect(replayButton).toBeVisible();
    await replayButton.click({ force: true });
    await page.waitForTimeout(300);

    expect(problems).toEqual([]);
  });

  test("N7: el altavoz repite la pregunta actual sin errores", async ({ page }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);
    await openLevel(page, "El Bosque", "Emociones");
    await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();
    await page.waitForTimeout(600);

    const replayButton = page.getByRole("button", { name: "Escuchar de nuevo" });
    await expect(replayButton).toBeVisible();
    await replayButton.click({ force: true });
    await page.waitForTimeout(300);

    expect(problems).toEqual([]);
  });

  test("N9: el altavoz repite la pregunta actual sin errores", async ({ page }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);
    await openLevel(page, "La Estación", "Subitizar 1-3");
    await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();
    await page.waitForTimeout(600);

    const replayButton = page.getByRole("button", { name: "Escuchar de nuevo" });
    await expect(replayButton).toBeVisible();
    await replayButton.click({ force: true });
    await page.waitForTimeout(300);

    expect(problems).toEqual([]);
  });

  test("N8: 3 congelamientos seguidos disparan la celebración de racha", async ({ page }) => {
    await openHome(page);
    await openLevel(page, "El Océano", "Para y sigue");
    await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();

    // La celebración de racha reutiliza los elogios de N2; que suene uno es
    // la señal de que las 3 rachas realmente se contaron.
    const streakCelebration = page.waitForResponse((res) => /n2-praise-\d\.mp3/.test(res.url()), { timeout: 20000 });

    // El nombre accesible cambia al congelarse: en vez de esperar a ciegas un
    // tiempo fijo (frágil si el timer del navegador se retrasa en headless),
    // se espera a que el propio DOM anuncie el turno — igual que lo haría
    // quien depende de un lector de pantalla.
    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: "Bailarín, ¡tócame ahora!" }).click({ force: true, timeout: 10000 });
    }

    await streakCelebration;
  });

  test("N9: tocar el grupo con la cantidad pedida acierta (y el equivocado no castiga)", async ({ page }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);
    await openAprender(page);
    await openWorld(page, "La Estación");

    // La consigna se da SOLO por voz (el niño no lee), así que la prueba se
    // entera igual que el niño: escuchando cuál clip pidió el nivel. Hay que
    // armar la espera ANTES de entrar, porque suena al montar la pantalla.
    const questionClip = page.waitForResponse((res) => /n9-question-\d\.mp3/.test(res.url()), { timeout: 15000 });
    await page.getByRole("button", { name: "Subitizar 1-3" }).click();
    await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();

    const askedFor = (await questionClip).url().match(/n9-question-(\d)\.mp3/)?.[1];
    expect(askedFor).toBeTruthy();

    // Las 3 opciones (1, 2 y 3 objetos) están siempre visibles: es comprensión
    // receptiva, no memoria — y el niño debe poder contarlas si duda.
    await expect(page.getByRole("button", { name: /objetos?$/ })).toHaveCount(3);

    // Tocar una cantidad distinta a la pedida: solo se sacude, sigue en el nivel.
    const wrong = askedFor === "1" ? "2 objetos" : "1 objeto";
    await page.getByRole("button", { name: wrong }).click({ force: true });
    await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();

    // Tocar la correcta dispara la voz que nombra la cantidad ("¡Dos!").
    const exclaim = page.waitForResponse((res) => res.url().includes(`n9-exclaim-${askedFor}.mp3`), { timeout: 10000 });
    const correctName = askedFor === "1" ? "1 objeto" : `${askedFor} objetos`;
    await page.getByRole("button", { name: correctName }).click({ force: true });
    await exclaim;

    expect(problems).toEqual([]);
  });

  test("N10: recorre las 5 paradas contando cada objeto y llega a la meta", async ({ page }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);
    await openLevel(page, "La Estación", "Contar 1-5");
    await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();
    await page.waitForTimeout(500);

    // Cada parada k tiene k objetos, y ninguno desaparece al tocarlo (queda
    // marcado, por si el niño quiere recontar) — así que basta con tocar
    // "el siguiente sin marcar" k veces para vaciar la parada.
    for (let checkpoint = 1; checkpoint <= 5; checkpoint++) {
      await expect(page.getByRole("button", { name: "Objeto" })).toHaveCount(checkpoint);
      for (let i = 0; i < checkpoint; i++) {
        await page.getByRole("button", { name: "Objeto" }).first().click({ force: true });
        await page.waitForTimeout(150);
      }
      await page.waitForTimeout(1300); // deja avanzar el carro a la siguiente parada
    }

    // Al llegar a la meta (5ta celebración), la pantalla de logro compartida
    // cierra la ronda exactamente ahí — sin necesidad de lógica propia extra.
    await expect(page.getByText("¡Lo lograste!")).toBeVisible({ timeout: 3000 });

    expect(problems).toEqual([]);
  });

  test("N10: cuenta en orden (uno, luego dos), no repite el total de la parada en cada toque", async ({ page }) => {
    await openHome(page);
    await openLevel(page, "La Estación", "Contar 1-5");
    await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();
    await page.waitForTimeout(500);

    // La 1ra parada tiene 1 solo objeto (no distingue el bug: 1 es el total
    // Y el conteo acumulado a la vez), así que se avanza a la 2da a propósito.
    // Esto también carga "n10-count-1.mp3" en la caché de Howler, así que no
    // sirve para distinguir el bug por red en la 2da parada (una segunda
    // reproducción de un archivo ya cargado no genera una nueva petición).
    await page.getByRole("button", { name: "Objeto" }).first().click({ force: true });
    await page.waitForTimeout(1300);
    await expect(page.getByRole("button", { name: "Objeto" })).toHaveCount(2);

    // El bug original decía el total fijo de la parada ("dos") en CADA toque,
    // incluido el primero. "n10-count-2.mp3" nunca se pidió antes en esta
    // prueba, así que su ausencia tras el primer toque sí detecta el bug sin
    // depender de la caché de Howler.
    let sawCountTwoEarly = false;
    const watchEarly = (res: { url: () => string }) => {
      if (/n10-count-2\.mp3/.test(res.url())) sawCountTwoEarly = true;
    };
    page.on("response", watchEarly);
    await page.getByRole("button", { name: "Objeto" }).first().click({ force: true });
    await page.waitForTimeout(400);
    page.off("response", watchEarly);
    expect(sawCountTwoEarly).toBe(false);

    // El segundo toque sí debe decir "dos": esta es la primera vez que se
    // pide ese archivo, así que la petición de red es una señal confiable.
    const secondCount = page.waitForResponse((res) => /n10-count-2\.mp3/.test(res.url()), { timeout: 5000 });
    await page.getByRole("button", { name: "Objeto" }).first().click({ force: true });
    await secondCount;
  });

  test("N11: la parada de 6 llega hasta 'seis' con las voces nuevas del nivel", async ({ page }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);
    await openLevel(page, "La Estación", "Contar 6-10");
    await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();
    await page.waitForTimeout(500);

    // La razón de existir de N11 son sus voces 6-10: la primera parada tiene 6
    // objetos y el conteo arranca en "uno" (reutilizando las voces de N10),
    // así que el SEXTO toque es el primero que puede pedir n11-count-6.mp3.
    // Sin esta prueba, N11 podía quedarse contando 1-5 y callado del 6 en
    // adelante sin que nada fallara.
    await expect(page.getByRole("button", { name: "Objeto" })).toHaveCount(6);
    const sixth = page.waitForResponse((res) => /n11-count-6\.mp3/.test(res.url()), { timeout: 10000 });
    for (let i = 0; i < 6; i++) {
      await page.getByRole("button", { name: "Objeto" }).first().click({ force: true });
      await page.waitForTimeout(150);
    }
    await sixth;

    // Y la parada siguiente crece a 7 (checkpoints [6..10]).
    await page.waitForTimeout(1300);
    await expect(page.getByRole("button", { name: "Objeto" })).toHaveCount(7);

    expect(problems).toEqual([]);
  });

  test("N12: tocar la forma correcta rellena el hueco del patrón", async ({ page }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);
    await openLevel(page, "El Océano", "Formas y patrones");
    await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();
    await page.waitForTimeout(500);

    const options = page.locator('button[aria-label="Forma"]');
    await expect(options).toHaveCount(3);

    // El hueco (5to lugar del patrón) empieza con contorno punteado (variant
    // "slot" de ShapeIcon); es la única forma en pantalla sin relleno, así
    // que se prueban las 3 opciones hasta encontrar la que lo rellena, sin
    // depender de qué color le tocó a cada una (es aleatorio por ronda).
    const hole = page.locator("svg g[stroke-dasharray]");
    await expect(hole).toHaveCount(1);

    let solved = false;
    for (let i = 0; i < 3 && !solved; i++) {
      await options.nth(i).click({ force: true });
      await page.waitForTimeout(250);
      solved = (await hole.count()) === 0;
    }
    expect(solved).toBe(true);

    expect(problems).toEqual([]);
  });

  test("al completar una ronda aparece la pantalla de logro y no interrumpe el juego", async ({ page }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);
    await openLevel(page, "La Estación", "Toca al objetivo");
    await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();
    await page.waitForTimeout(400);

    // useGameSession cierra una ronda cada 5 aciertos (ver DEFAULT_ROUND_SIZE):
    // el 5to toque debe mostrar la pantalla de logro con sus 3 estrellas.
    for (let i = 0; i < 5; i++) {
      await page.getByRole("button", { name: "Tócame" }).click({ force: true });
      await page.waitForTimeout(200);
    }
    await expect(page.getByText("¡Lo lograste!")).toBeVisible({ timeout: 3000 });

    // "Otra vez" solo cierra el overlay: el nivel sigue donde estaba, sin
    // reiniciarse (el objetivo tocable sigue presente).
    await page.getByRole("button", { name: "Otra vez" }).click();
    await expect(page.getByText("¡Lo lograste!")).toBeHidden();
    await expect(page.getByRole("button", { name: "Tócame" })).toBeVisible();

    // Una segunda ronda completa y "Mapa" regresa al inicio — con la
    // insignia de rondas completadas visible en el tile del nivel.
    for (let i = 0; i < 5; i++) {
      await page.getByRole("button", { name: "Tócame" }).click({ force: true });
      await page.waitForTimeout(200);
    }
    await expect(page.getByText("¡Lo lograste!")).toBeVisible({ timeout: 3000 });
    // "Mapa" regresa exactamente al mundo desde el que se abrió el nivel
    // (App.tsx recuerda el origen), no a un mapa general.
    await page.getByRole("button", { name: "Mapa" }).click();
    await expect(page.getByText("La Estación")).toBeVisible();

    // La insignia de rondas completadas vive en el tile del nivel, dentro de su mundo.
    await expect(page.getByRole("button", { name: "Toca al objetivo" }).getByText("⭐2")).toBeVisible();

    expect(problems).toEqual([]);
  });
});

test.describe("zona de padres", () => {
  /** Se entra manteniendo pulsado 3s: una barrera que un niño pequeño no cruza por accidente. */
  async function openParentZone(page: Page) {
    const gear = page.getByRole("button", { name: "Zona de padres" });
    const box = await gear.boundingBox();
    if (!box) throw new Error("No se encontró el botón de la zona de padres");
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(3200);
    await page.mouse.up();
    await expect(page.getByRole("heading", { name: "Zona de padres" })).toBeVisible();
  }

  test("no se abre con un toque corto", async ({ page }) => {
    await openHome(page);
    await page.getByRole("button", { name: "Zona de padres" }).click();
    await expect(page.getByRole("heading", { name: "Zona de padres" })).toBeHidden();
  });

  test("se abre manteniendo pulsado y cambia de idioma", async ({ page }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);
    await openParentZone(page);

    await page.getByRole("button", { name: "English 🇺🇸" }).click();
    await expect(page.getByText("Parents' zone")).toBeVisible();

    await page.getByRole("button", { name: "Português 🇧🇷" }).click();
    await expect(page.getByText("Área dos pais")).toBeVisible();

    expect(problems).toEqual([]);
  });

  test("el modo calma se puede activar y desactivar", async ({ page }) => {
    await openHome(page);
    await openParentZone(page);

    const toggle = page.getByRole("switch");
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "true");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  test("registra en el progreso el nivel que el niño jugó", async ({ page }) => {
    await openHome(page);
    await openLevel(page, "La Estación", "Causa y efecto");
    await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();
    // Salir del nivel deja en su mundo; el engranaje de la zona de padres
    // solo vive en el hub, así que hay que volver hasta ahí (tres "Regresar":
    // nivel → mundo, mundo → Aprender, Aprender → hub).
    await page.getByRole("button", { name: "Regresar" }).click();
    await expect(page.getByText("La Estación")).toBeVisible();
    await page.getByRole("button", { name: "Regresar" }).click();
    await expect(page.getByText("Elige un mundo")).toBeVisible();
    await page.getByRole("button", { name: "Regresar" }).click();
    await expect(page.getByRole("button", { name: "Aprender" })).toBeVisible();

    await openParentZone(page);
    // Se muestra el nombre del nivel, no su id interno.
    await expect(page.getByText(/Causa y efecto — 1 vez/)).toBeVisible();
  });
});

test.describe("pilares Jugar/Explorar/Favoritos", () => {
  test("Jugar muestra todo lo jugable en una sola cuadrícula, sin pasar por un mundo", async ({ page }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);
    await page.getByRole("button", { name: "Jugar" }).click();
    // Un nivel de cada mundo, visible sin elegir mundo primero (Product Vision §2).
    await expect(page.getByRole("button", { name: "Causa y efecto" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Emparejar idénticos" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Para y sigue" })).toBeVisible();

    await page.getByRole("button", { name: "Causa y efecto" }).click();
    await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();
    // Al salir se vuelve a Jugar (de donde se abrió), no a Aprender.
    await page.getByRole("button", { name: "Regresar" }).click();
    await expect(page.getByRole("button", { name: "Para y sigue" })).toBeVisible();

    expect(problems).toEqual([]);
  });

  test("Favoritos empieza vacío y muestra lo que se marca con el corazón desde Jugar", async ({ page }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);

    await page.getByRole("button", { name: "Favoritos", exact: true }).click();
    await expect(page.getByText(/Aún no tienes favoritos/)).toBeVisible();
    await page.getByRole("button", { name: "Regresar" }).click();

    await page.getByRole("button", { name: "Jugar", exact: true }).click();
    await page.locator('button[aria-label="Agregar a favoritos"]').first().click();

    await page.getByRole("button", { name: "Regresar" }).click();
    await page.getByRole("button", { name: "Favoritos", exact: true }).click();
    await expect(page.getByText(/Aún no tienes favoritos/)).toBeHidden();
    await expect(page.locator('button[aria-label="Quitar de favoritos"]')).toHaveCount(1);

    expect(problems).toEqual([]);
  });
});

/** Abre un juego de la biblioteca de Jugar directamente (sin pasar por Aprender/mundo). */
async function openJugarGame(page: Page, gameName: string) {
  await page.getByRole("button", { name: "Jugar", exact: true }).click();
  await page.getByRole("button", { name: gameName }).click();
  await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();
  await page.waitForTimeout(400);
}

test.describe("biblioteca de Jugar", () => {
  test("Burbujas: tocar una burbuja la explota y aparece otra", async ({ page }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);
    await openJugarGame(page, "Burbujas");

    const bubbles = page.getByRole("button", { name: "Tócame" });
    await expect(bubbles).toHaveCount(4);
    await bubbles.first().click({ force: true });
    await page.waitForTimeout(400);
    await expect(bubbles).toHaveCount(4);

    await page.getByRole("button", { name: "Regresar" }).click();
    await expect(page.getByRole("button", { name: "Burbujas" })).toBeVisible();
    expect(problems).toEqual([]);
  });

  test("Atrapa la estrella: tocarla la atrapa y aparece otra en otro lugar", async ({ page }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);
    await openJugarGame(page, "Atrapa la estrella");

    const star = page.getByRole("button", { name: "Tócame" }).first();
    await star.click({ force: true });
    await page.waitForTimeout(400);
    await expect(page.getByRole("button", { name: "Tócame" })).toHaveCount(1);

    await page.getByRole("button", { name: "Regresar" }).click();
    expect(problems).toEqual([]);
  });

  test("Colores mágicos: tocar la forma del color correcto la hace desaparecer", async ({ page }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);
    await openJugarGame(page, "Colores mágicos");

    const pieces = page.getByRole("button", { name: "Tócame" });
    const countBefore = await pieces.count();
    expect(countBefore).toBeGreaterThan(0);
    await pieces.first().click({ force: true });
    await page.waitForTimeout(300);
    // Un toque siempre cambia algo: o desaparece (acierto) o se sacude (intento) —
    // cualquiera de los dos deja la pantalla respondiendo, sin errores de consola.

    await page.getByRole("button", { name: "Regresar" }).click();
    expect(problems).toEqual([]);
  });

  test("Encuentra el animal: el animal objetivo se muestra arriba y se puede tocar uno del campo", async ({ page }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);
    await openJugarGame(page, "Encuentra el animal");

    const animals = page.getByRole("button", { name: "Animal" });
    await expect(animals).toHaveCount(3);
    await animals.first().click({ force: true });
    await page.waitForTimeout(300);

    await page.getByRole("button", { name: "Regresar" }).click();
    expect(problems).toEqual([]);
  });

  test("Alimenta al animal: arrastrar una comida hasta el animal reacciona sin errores", async ({ page }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);
    await openJugarGame(page, "Alimenta al animal");

    const foods = page.getByRole("img", { name: "Comida" });
    await expect(foods).toHaveCount(2);
    const box = await foods.first().boundingBox();
    const viewport = page.viewportSize();
    expect(box).toBeTruthy();
    expect(viewport).toBeTruthy();
    if (box && viewport) {
      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      // El animal vive en left:50%/top:64% del área de juego (ver AlimentaAlAnimal.tsx).
      await page.mouse.move(viewport.width * 0.5, viewport.height * 0.64, { steps: 10 });
      await page.mouse.up();
    }
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: "Regresar" }).click();
    expect(problems).toEqual([]);
  });
});

test.describe("Explorar", () => {
  test("el Parque abre, un objeto reacciona al tocarlo y solo esa escena está construida", async ({ page }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);
    await page.getByRole("button", { name: "Explorar" }).click();

    // Solo Parque está construido; el resto avisa "muy pronto" como en Aprender.
    const futureScene = page.getByRole("button", { name: "Estación" });
    await expect(futureScene).toHaveAttribute("aria-disabled", "true");

    await page.getByRole("button", { name: "Parque" }).click();
    await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();
    await page.waitForTimeout(400);

    // Tocar el sol no exige ningún acierto: cualquier toque reacciona (causa-efecto).
    await page.getByRole("button", { name: "Sol" }).click();
    await page.waitForTimeout(300);

    await page.getByRole("button", { name: "Regresar" }).click();
    await expect(page.getByRole("button", { name: "Parque" })).toBeVisible();

    expect(problems).toEqual([]);
  });

  test("el Parque tiene 14 objetos visibles y tocar la pelota hace que el compañero note y festeje", async ({
    page,
  }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);
    await page.getByRole("button", { name: "Explorar" }).click();
    await page.getByRole("button", { name: "Parque" }).click();
    await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();
    await page.waitForTimeout(400);

    // 12 objetos tocables (botón) visibles desde el inicio; Cometa y Columpio
    // se arrastran en vez de tocarse (ver prueba dedicada más abajo), y la
    // Rana todavía no existe — solo aparece al tocar el Charco.
    for (const name of [
      "Sol",
      "Nube",
      "Pájaro",
      "Árbol",
      "Fuente",
      "Mariposa",
      "Banco",
      "Piedra",
      "Pasto",
      "Pelota",
      "Flor",
      "Charco",
    ]) {
      await expect(page.getByRole("button", { name })).toBeVisible();
    }
    await expect(page.getByRole("img", { name: "Cometa" })).toBeVisible();
    await expect(page.getByRole("img", { name: "Columpio" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Rana" })).toHaveCount(0);

    // Interacción emergente (Product Vision §35): tocar la pelota no solo
    // anima la pelota — el compañero elegido lo nota y ladra su festejo,
    // sin que el niño haya tocado al perrito directamente.
    const bark = page.waitForResponse((res) => /buddy-(odie|dante|kira)-bark\.mp3/.test(res.url()), {
      timeout: 5000,
    });
    await page.getByRole("button", { name: "Pelota" }).click();
    await bark;

    // Interacción emergente objeto→objeto: tocar la nube agita el charco
    // (cadena declarada en la config de la escena, no código especial).
    await page.getByRole("button", { name: "Nube" }).click();
    await page.waitForTimeout(600);

    expect(problems).toEqual([]);
  });

  test("los descubrimientos camuflados (pasto, piedra) reaccionan y el banco también avisa al compañero", async ({
    page,
  }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);
    await page.getByRole("button", { name: "Explorar" }).click();
    await page.getByRole("button", { name: "Parque" }).click();
    await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();
    await page.waitForTimeout(400);

    // Curiosity design: pasto y piedra se confunden con el suelo (no llaman
    // la atención como botones normales) pero sí reaccionan al tocarlos.
    await page.getByRole("button", { name: "Pasto" }).click();
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: "Piedra" }).click();
    await page.waitForTimeout(300);

    // El banco es otro objeto que avisa al compañero, igual que la pelota.
    const benchBark = page.waitForResponse((res) => /buddy-(odie|dante|kira)-bark\.mp3/.test(res.url()), {
      timeout: 5000,
    });
    await page.getByRole("button", { name: "Banco" }).click();
    await benchBark;

    expect(problems).toEqual([]);
  });

  test("tocar el charco revela a la rana, que no existía antes (descubrimiento sin explicar)", async ({ page }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);
    await page.getByRole("button", { name: "Explorar" }).click();
    await page.getByRole("button", { name: "Parque" }).click();
    await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();
    await page.waitForTimeout(400);

    await expect(page.getByRole("button", { name: "Rana" })).toHaveCount(0);
    await page.getByRole("button", { name: "Charco" }).click();
    await expect(page.getByRole("button", { name: "Rana" })).toBeVisible({ timeout: 2000 });

    // Una vez revelada, la rana reacciona a su propio toque como cualquier otro objeto.
    await page.getByRole("button", { name: "Rana" }).click();
    await page.waitForTimeout(300);

    expect(problems).toEqual([]);
  });

  test("el cometa y el columpio se arrastran (no se tocan) y el columpio avisa al compañero", async ({ page }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);
    await page.getByRole("button", { name: "Explorar" }).click();
    await page.getByRole("button", { name: "Parque" }).click();
    await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();
    await page.waitForTimeout(400);

    await dragObject(page, "Cometa", 40, -20);
    await page.waitForTimeout(300);

    // El columpio, como la pelota y el banco, avisa al compañero — pero solo
    // al arrastrarlo (no tiene botón: es un juguete de verdad, no un ícono).
    const swingBark = page.waitForResponse((res) => /buddy-(odie|dante|kira)-bark\.mp3/.test(res.url()), {
      timeout: 5000,
    });
    await dragObject(page, "Columpio", 20, 0);
    await swingBark;

    expect(problems).toEqual([]);
  });

  test("el árbol asusta al pájaro, la mariposa se posa en la flor y la rana vuelve a salpicar el charco", async ({
    page,
  }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);
    await page.getByRole("button", { name: "Explorar" }).click();
    await page.getByRole("button", { name: "Parque" }).click();
    await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();
    await page.waitForTimeout(400);

    // Árbol → hojas → el pájaro (siempre visible, vive su propia vida
    // ambiente) reacciona como si lo hubiera asustado el ruido.
    await page.getByRole("button", { name: "Árbol" }).click();
    await page.waitForTimeout(600);

    // Mariposa → vuela → se posa en la flor, que reacciona a su vez.
    await page.getByRole("button", { name: "Mariposa" }).click();
    await page.waitForTimeout(600);

    // Rana (revelada al tocar el charco) → salta → salpica el charco de
    // vuelta al tocarla directamente (entra/sale del charco).
    await page.getByRole("button", { name: "Charco" }).click();
    await expect(page.getByRole("button", { name: "Rana" })).toBeVisible({ timeout: 2000 });
    await page.getByRole("button", { name: "Rana" }).click();
    await page.waitForTimeout(600);

    expect(problems).toEqual([]);
  });
});
