import { promises as fs } from "fs";

import getInputStyleSheet from "./get-style-sheet";
import extractClasses from "./extract-classes";
import generateTypeScriptSource from "./generate-typescript";

interface Options {
  styleSheetPath?: string;
  configPath?: string;
  outputPath?: string;
}

async function entrypoint({ styleSheetPath, configPath, outputPath }: Options = {}): Promise<void> {
  const [inputStyleSheet, inputStyleSheetPath] = await getInputStyleSheet(styleSheetPath);
  const classes = await extractClasses({ inputStyleSheetPath, inputStyleSheet, configPath });
  const typescriptSource = generateTypeScriptSource(classes);

  if (outputPath) {
    await fs.writeFile(outputPath, typescriptSource, "utf-8");
  } else {
    process.stdout.write(typescriptSource);
  }
}

entrypoint().catch(console.error);
