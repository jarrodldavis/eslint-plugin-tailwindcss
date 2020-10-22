import { expose } from "./comlink";

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
    [P in TailwindUtilityClass]?: null | boolean | undefined;
  };

  type TailwindUtilityClassArray = Array<TailwindUtilityClassValue>;

  type TailwindUtilityClass = never;
`
  .replace(/^ {2}/gm, "")
  .trimStart();

export default function generateTypeScriptSource(classes: Iterable<string>): string {
  const literals = [];
  for (const cls of classes) {
    literals.push(`  | "${cls}"`);
  }

  if (literals.length === 0) {
    return codeTemplate;
  } else {
    literals.unshift(""); // add initial newline
    return codeTemplate.replace(" never", literals.join("\n"));
  }
}

expose(generateTypeScriptSource);
