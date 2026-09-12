import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

/**
 * El código ya traía comentarios `eslint-disable` sin que ESLint estuviera
 * instalado: esas excepciones no las verificaba nadie.
 *
 * La regla que más importa aquí es react-hooks/exhaustive-deps: los juegos
 * viven de temporizadores y callbacks, y una dependencia mal declarada se
 * manifiesta como un nivel que deja de responder — algo que un niño de 2
 * años no puede reportar.
 */
export default tseslint.config(
  { ignores: ["**/dist/**", "**/node_modules/**", "**/dev-dist/**", "**/playwright-report/**", "**/test-results/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Scripts de generación de assets: corren en Node, no en el navegador.
    files: ["scripts/**/*.mjs", "*.config.{js,mjs,ts}"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Los assets y el audio se referencian por nombre; un console.warn
      // es la única señal cuando falta un archivo.
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
);
