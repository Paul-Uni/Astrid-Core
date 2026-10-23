import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
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
