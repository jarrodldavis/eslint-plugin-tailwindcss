import { promises as fs } from "fs";

export default async function writeOutput(outputPath: string | undefined, typescriptSource: string): Promise<void> {
  if (outputPath) {
    await fs.writeFile(outputPath, typescriptSource, "utf-8");
  } else if (process.stdout.isTTY) {
    throw new Error("Refusing to write to stdout because it is a TTY.");
  } else {
    process.stdout.write(typescriptSource);
  }
}
