import { promises as fs } from "fs";
import path from "path";

import postcss, { Root, Transformer } from "postcss";
import createSelectorParser from "postcss-selector-parser";
import tailwindcss from "tailwindcss";

// language=PostCSS
const DEFAULT_INPUT_STYLE_SHEET = `
  @tailwind base;
  @tailwind utilities;
  @tailwind components;
`;

async function getInputStyleSheet(styleSheetPath?: string): Promise<[string, string | undefined]> {
  if (styleSheetPath === "-") {
    let inputStyleSheet = "";
    if (!process.stdin.isTTY) {
      for await (const chunk of process.stdin) {
        inputStyleSheet += chunk;
      }
    }
    return [inputStyleSheet, undefined];
  } else if (styleSheetPath) {
    return [await fs.readFile(styleSheetPath, "utf-8"), path.resolve(styleSheetPath)];
  } else {
    return [DEFAULT_INPUT_STYLE_SHEET, undefined];
  }
}

interface ExtractArgs {
  inputStyleSheet: string;
  inputStyleSheetPath: string | undefined;
  configPath?: string;
}

async function extractClasses(args: ExtractArgs): Promise<Iterable<string>> {
  const { inputStyleSheet, inputStyleSheetPath, configPath } = args;

  const classes = new Set<string>();

  const transformer: Transformer = (root: Root): void => {
    const classExtractor = createSelectorParser((selectors) =>
      selectors.walkClasses((node) => {
        classes.add(node.value);
      })
    );

    root.walkRules((rule) => {
      classExtractor.processSync(rule.selector);
    });
  };

  await postcss(tailwindcss(configPath), transformer).process(inputStyleSheet, { from: inputStyleSheetPath });

  return classes;
}

// language=TypeScript
const codeTemplate = `
  import clsx from "clsx";

  type twclsx = (...classes: TailwindUtilityClassValue[]) => string;
  const tw = clsx as twclsx;
  export default tw;

  type TailwindUtilityClassValue =
    | TailwindUtilityClassArray
    | TailwindUtilityClassDictionary
    | TailwindUtilityClass
    | null
    | boolean
    | undefined;

  type TailwindUtilityClassDictionary = {
    [P in TailwindUtilityClass]: null | boolean | undefined
  };

  type TailwindUtilityClassArray = Array<TailwindUtilityClassValue>;

  type TailwindUtilityClass = never;
`
  .replace(/^ {2}/gm, "")
  .trim();

function generateTypeScriptSource(classes: Iterable<string>): string {
  const literals = [];
  for (const cls of classes) {
    literals.push(`  | "${cls}"`);
  }

  if (literals.length === 0) {
    return codeTemplate;
  } else {
    literals.unshift(""); // add initial newline
    return codeTemplate.replace("never", literals.join("\n"));
  }
}

async function work(styleSheetPath?: string, configPath?: string) {
  const [inputStyleSheet, inputStyleSheetPath] = await getInputStyleSheet(styleSheetPath);
  const classes = await extractClasses({ inputStyleSheetPath, inputStyleSheet, configPath });
  return generateTypeScriptSource(classes);
}

work().then(console.log, console.error);
