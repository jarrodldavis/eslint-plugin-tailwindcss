#!/usr/bin/env node

import { promises as fs } from "fs";

import run, { Options } from "./cli";
import getInputStyleSheet from "./get-style-sheet";
import extractClasses from "./extract-classes";
import generateTypeScriptSource from "./generate-typescript";

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

if (require.main !== module) {
  throw new Error("This module should not be imported or required; it is a CLI entrypoint.");
}

run(entrypoint);
