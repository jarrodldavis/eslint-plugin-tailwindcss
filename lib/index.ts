#!/usr/bin/env node

import "./color";

import ora, { Ora } from "ora";

import run, { Options } from "./cli";
import { wrap } from "./comlink";
import readInput from "./input";
import writeOutput from "./output";

async function entrypoint({ styleSheetPath, configPath, outputPath }: Options = {}): Promise<void> {
  outputPath = outputPath === "-" ? undefined : outputPath;

  let spinner: Ora | undefined;
  try {
    spinner = ora().start("Read input stylesheet");
    const [inputStyleSheet, inputStyleSheetPath] = await readInput(styleSheetPath);
    spinner.succeed();

    spinner = ora().start("Extract CSS classes");
    const extractClasses = wrap<typeof import("./extract-classes").default>("./extract-classes.js");
    const classes = await extractClasses({ inputStyleSheetPath, inputStyleSheet, configPath });
    spinner.succeed();

    spinner = ora().start("Generate TypeScript source");
    const generateTypeScriptSource = wrap<typeof import("./generate-typescript").default>("./generate-typescript.js");
    const typescriptSource = await generateTypeScriptSource(classes);
    spinner.succeed();

    spinner = ora().start(outputPath ? "Write output module to disk" : "Write output module to stdout");
    await writeOutput(outputPath, typescriptSource);
    spinner.succeed();
  } catch (error: unknown) {
    spinner?.fail();

    if (error instanceof Error) {
      delete error.stack;
    }

    throw error;
  }
}

if (require.main !== module) {
  throw new Error("This module should not be imported or required; it is a CLI entrypoint.");
}

run(entrypoint);
