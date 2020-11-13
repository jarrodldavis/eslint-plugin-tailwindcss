import type { RuleTester } from "eslint";

import fs from "fs";
import path from "path";

import { getOptions } from "../lib/util/options";
import getClasses from "../lib/util/get-classes";

interface TestCases {
  valid: RuleTester.ValidTestCase[];
  invalid: RuleTester.InvalidTestCase[];
}

type AdditionalTestCaseOptions = Omit<RuleTester.ValidTestCase, "filename" | "code" | "cwd">;

const ONE_SECOND = 1_000;
const ONE_MINUTE = 60 * ONE_SECOND;

const LOAD_TEST_SLOW = 5 * ONE_SECOND;
const LOAD_TEST_TIMEOUT = 2 * ONE_MINUTE;

export default function loadTestCases(rule: string, additional?: AdditionalTestCaseOptions): TestCases {
  const fixtureRoot = path.join(process.cwd(), "tests/fixtures", rule);

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

  describe(rule, function () {
    it("loads classes without error", function () {
      this.slow(LOAD_TEST_SLOW).timeout(LOAD_TEST_TIMEOUT);
      getClasses(getOptions(additional?.options ?? []), fixtureRoot);
    });
  });

  return { valid, invalid };
}
