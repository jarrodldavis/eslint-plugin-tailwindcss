import type { RuleTester } from "eslint";

import fs from "fs";
import path from "path";

interface TestCases {
  valid: RuleTester.ValidTestCase[];
  invalid: RuleTester.InvalidTestCase[];
}

function read(...segments: string[]): string {
  return fs.readFileSync(path.join(...segments), { encoding: "utf-8" });
}

export default function loadTestCases(rule: string): TestCases {
  const fixtureRoot = path.join(__dirname, "fixtures", rule);

  const valid = fs.readdirSync(path.join(fixtureRoot, "valid")).map((name) => ({
    filename: path.basename(name, path.extname(name)),
    code: read(fixtureRoot, "valid", name),
  }));

  const invalid = fs
    .readdirSync(path.join(fixtureRoot, "invalid"))
    .filter((name) => path.extname(name) === ".jsx")
    .map((name) => path.basename(name, path.extname(name)))
    .map((name) => ({
      filename: name,
      code: read(fixtureRoot, "invalid", `${name}.jsx`),
      errors: JSON.parse(read(fixtureRoot, "invalid", `${name}.json`)) as RuleTester.TestCaseError[],
    }));

  return { valid, invalid };
}
