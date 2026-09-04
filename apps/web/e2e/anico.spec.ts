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

/** Los 5 niveles jugables de la Fase 1, con una interacción representativa de cada mecánica. */
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
    // Un nivel aún no construido queda bloqueado, no abre una pantalla vacía.
    await expect(page.getByRole("button", { name: "Rompecabezas" })).toBeDisabled();
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
