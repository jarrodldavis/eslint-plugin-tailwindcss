import type { ExtractArgs } from "./extract-classes-bin";
import type { Options } from "./options";

import { createHash } from "crypto";
import fs from "fs";
import { execFileSync } from "child_process";
import path from "path";

function readStyles(stylesPath: string | null): [string, string | null] {
  // language=PostCSS
  const DEFAULT_INPUT_STYLE_SHEET = `
    @tailwind base;
    @tailwind utilities;
    @tailwind components;
  `;

  if (stylesPath) {
    return [fs.readFileSync(stylesPath, "utf-8"), path.resolve(stylesPath)];
  } else {
    return [DEFAULT_INPUT_STYLE_SHEET, null];
  }
}

function extractClasses(args: ExtractArgs): string[] {
  const rawClasses = execFileSync(process.argv[0], [path.join(__dirname, "./extract-classes-bin.js")], {
    encoding: "utf-8",
    input: JSON.stringify(args),
  });

  const parsedClasses = JSON.parse(rawClasses) as unknown;
  if (Array.isArray(parsedClasses)) {
    return parsedClasses as string[];
  } else {
    throw new Error("Expected array result from class extraction.");
  }
}

let cachedStylesHash = "";
let cachedClassesValue = [] as string[];

export default function getClasses(options: Options): string[] {
  const [styles, stylesPath] = readStyles(options.stylesheet);

  const stylesHash = createHash("sha1").update(styles).digest("hex");

  if (stylesHash !== cachedStylesHash) {
    const classes = extractClasses({ styles, stylesPath, configPath: options.config });
    cachedStylesHash = stylesHash;
    cachedClassesValue = classes;
  }

  return cachedClassesValue;
}
