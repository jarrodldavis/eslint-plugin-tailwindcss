import postcss, { Root, Transformer } from "postcss";
import createSelectorParser from "postcss-selector-parser";
import tailwindcss from "tailwindcss";

async function extractClasses(): Promise<Iterable<string>> {
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

  const css = "@tailwind base; @tailwind utilities; @tailwind components;";

  await postcss(tailwindcss, transformer).process(css, { from: undefined });

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

extractClasses().then(generateTypeScriptSource).then(console.log).catch(console.error);
