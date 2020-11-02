import type { RuleTester } from "eslint";

import fs from "fs";
import path from "path";

interface TestCases {
  valid: RuleTester.ValidTestCase[];
  invalid: RuleTester.InvalidTestCase[];
}

type AdditionalTestCaseOptions = Omit<RuleTester.ValidTestCase, "filename" | "code" | "cwd">;

export default function loadTestCases(rule: string, additional?: AdditionalTestCaseOptions): TestCases {
  const fixtureRoot = path.join(__dirname, "fixtures", rule);

  function* getFixtures(type: "valid" | "invalid", dir = ""): Generator<string> {
    const fulldir = path.join(fixtureRoot, type, dir);
    for (const entry of fs.readdirSync(fulldir, { withFileTypes: true })) {
      const name = path.join(dir, entry.name);
      if (entry.isFile()) {
        const extname = path.extname(entry.name);
        if (extname === ".jsx") {
          yield name.slice(0, -extname.length);
        } else if (type === "invalid" && extname === ".json") {
          continue;
        } else {
          throw new Error(`Unexpected file '${name}'.`);
        }
      } else if (entry.isDirectory()) {
        yield* getFixtures(type, name);
      } else {
        throw new Error(`Directory entry '${name}' is neither a file nor a directory.`);
      }
    }
  }

  function read(type: "valid" | "invalid", name: string, extname: string): string {
    return fs.readFileSync(path.join(fixtureRoot, type, `${name}${extname}`), { encoding: "utf-8" });
  }

  const valid = Array.from(getFixtures("valid")).map((name) => ({
    ...additional,
    filename: name,
    code: read("valid", name, ".jsx"),
    cwd: fixtureRoot,
  }));

  const invalid = Array.from(getFixtures("invalid")).map((name) => ({
    ...additional,
    filename: name,
    code: read("invalid", name, ".jsx"),
    errors: JSON.parse(read("invalid", name, ".json")) as RuleTester.TestCaseError[],
    cwd: fixtureRoot,
  }));

  return { valid, invalid };
}
