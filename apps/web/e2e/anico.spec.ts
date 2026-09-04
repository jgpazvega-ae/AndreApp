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

async function openHome(page: Page) {
  await page.goto("./", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Toca para empezar" }).click();
  await expect(page.getByText("Elige un mundo")).toBeVisible();
}

/** Los niveles jugables de la Fase 1, con una interacción representativa de cada mecánica. */
const PLAYABLE_LEVELS = [
  { name: "Causa y efecto", interact: (page: Page) => page.mouse.click(195, 400) },
  {
    name: "Toca al objetivo",
    // force: el objetivo "respira" sin parar, así que nunca queda quieto para
    // la comprobación de estabilidad de Playwright — un dedo sí puede tocarlo.
    interact: (page: Page) => page.getByRole("button", { name: "Tócame" }).click({ force: true }),
  },
  {
    name: "Emparejar idénticos",
    interact: (page: Page) => page.locator('button[aria-label="Tarjeta"]').first().click(),
  },
  {
    name: "Clasificar por 1 atributo",
    interact: (page: Page) => page.locator('button[aria-label="Zona de color"]').first().click(),
  },
  {
    name: "Vocabulario y sonidos",
    interact: (page: Page) => page.locator('button[aria-label="Animal"]').first().click(),
  },
  {
    name: "Rompecabezas",
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
    // Tocar mientras baila no hace nada malo (solo se escucha, sin romper nada):
    // basta un toque cualquiera para probar que la pantalla responde. El nombre
    // accesible cambia según la fase, de ahí el regex en vez de texto exacto.
    interact: (page: Page) => page.getByRole("button", { name: /Bailarín/ }).click({ force: true }),
  },
  {
    name: "Subitizar 1-3",
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
    // La primera parada tiene un solo objeto: tocarlo basta para probar que
    // la pantalla responde (el recorrido completo tiene su propia prueba).
    interact: (page: Page) => page.getByRole("button", { name: "Objeto" }).first().click({ force: true }),
  },
];

test.describe("pantalla de inicio", () => {
  test("desbloquea el audio con un gesto y muestra los mundos", async ({ page }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);
    expect(problems).toEqual([]);
  });

  test("los 3 perritos saludan y responden al toque", async ({ page }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);

    const friends = page.getByRole("button", { name: "Amigo" });
    await expect(friends).toHaveCount(3);
    await friends.first().click();

    expect(problems).toEqual([]);
  });

  test("solo los niveles jugables se pueden abrir", async ({ page }) => {
    await openHome(page);
    for (const level of PLAYABLE_LEVELS) {
      await expect(page.getByRole("button", { name: level.name })).toBeEnabled();
    }
  });

  test("un nivel aún no construido no abre una pantalla vacía, pero sí responde al toque", async ({ page }) => {
    await openHome(page);
    const comingSoon = page.getByRole("button", { name: "Contar 6-10" });
    // aria-disabled (no el atributo nativo "disabled"): a propósito, para que
    // el tile pueda reaccionar al toque sin permitir la navegación real —
    // un <button disabled> nativo no reacciona a nada, y eso se sentía roto.
    await expect(comingSoon).toHaveAttribute("aria-disabled", "true");

    // force: Playwright trata aria-disabled como "no accionable" y de otro
    // modo nunca hace clic — pero eso es una heurística del framework, no
    // el comportamiento real del navegador (aria-disabled es semántica para
    // lectores de pantalla, no bloquea eventos de puntero de verdad).
    await comingSoon.click({ force: true });
    // Nunca navega a una pantalla vacía: se queda en el mapa...
    await expect(page.getByText("Elige un mundo")).toBeVisible();
    // ...pero sí avisa que el toque se sintió.
    await expect(page.getByText("Muy pronto")).toBeVisible();
  });
});

test.describe("niveles", () => {
  for (const level of PLAYABLE_LEVELS) {
    test(`${level.name}: se abre, responde al toque y regresa al inicio`, async ({ page }) => {
      const problems = failOnPageProblems(page);
      await openHome(page);

      await page.getByRole("button", { name: level.name }).click();
      await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();
      await page.waitForTimeout(400); // deja entrar la pantalla antes de tocar

      await level.interact(page);
      await page.waitForTimeout(300);

      await page.getByRole("button", { name: "Regresar" }).click();
      await expect(page.getByText("Elige un mundo")).toBeVisible();

      expect(problems).toEqual([]);
    });
  }

  test("cada nivel muestra a su compañero perruno", async ({ page }) => {
    await openHome(page);
    await page.getByRole("button", { name: "Causa y efecto" }).click();
    await expect(page.locator('img[src*="friend-"]')).toHaveCount(1);
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
    await page.getByRole("button", { name: "Rompecabezas" }).click();
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
    await page.getByRole("button", { name: "Emparejar idénticos" }).click();
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

  test("N4: tras varios aciertos aparece la fase nombrada (bolita oculta, se pregunta el color)", async ({ page }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);
    await page.getByRole("button", { name: "Clasificar por 1 atributo" }).click();
    await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();
    await page.waitForTimeout(500);

    const zones = page.locator('button[aria-label="Zona de color"]');
    const otraVez = page.getByRole("button", { name: "Otra vez" });
    async function playOneTrial() {
      await zones.first().click();
      await page.waitForTimeout(200);
      if (await otraVez.isVisible().catch(() => false)) {
        await otraVez.click();
        await page.waitForTimeout(300);
        return;
      }
      if ((await zones.count()) >= 2) {
        await zones.nth(1).click();
        await page.waitForTimeout(200);
        if (await otraVez.isVisible().catch(() => false)) {
          await otraVez.click();
          await page.waitForTimeout(300);
        }
      }
      await page.waitForTimeout(400);
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

  test("N8: 3 congelamientos seguidos disparan la celebración de racha", async ({ page }) => {
    await openHome(page);
    await page.getByRole("button", { name: "Para y sigue" }).click();
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
    await page.getByRole("button", { name: "Contar 1-5" }).click();
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

  test("al completar una ronda aparece la pantalla de logro y no interrumpe el juego", async ({ page }) => {
    const problems = failOnPageProblems(page);
    await openHome(page);
    await page.getByRole("button", { name: "Toca al objetivo" }).click();
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
    await page.getByRole("button", { name: "Mapa" }).click();
    await expect(page.getByText("Elige un mundo")).toBeVisible();
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
    await page.getByRole("button", { name: "Causa y efecto" }).click();
    await expect(page.getByRole("button", { name: "Regresar" })).toBeVisible();
    await page.getByRole("button", { name: "Regresar" }).click();
    await expect(page.getByText("Elige un mundo")).toBeVisible();

    await openParentZone(page);
    // Se muestra el nombre del nivel, no su id interno.
    await expect(page.getByText(/Causa y efecto — 1 vez/)).toBeVisible();
  });
});
