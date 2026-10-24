import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  { ignores: [".next/**", "playwright-report/**", "test-results/**"] },
  {
    rules: {
      // Enforce the CTRL+zoom contract: no arbitrary px classes in Tailwind.
      // Composition values must come from design tokens (rem) or responsive units.
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/\\[[0-9]+px\\]/]",
          message:
            "Arbitrary px Tailwind classes (e.g. w-[720px]) break CTRL+zoom. Use design tokens (rem) or percentage/vh/vw units.",
        },
      ],
    },
  },
];

export default config;
