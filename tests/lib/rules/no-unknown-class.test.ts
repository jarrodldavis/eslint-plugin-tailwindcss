import fs from "fs";
import path from "path";

import { RuleTester } from "eslint";

import loadTestCases from "../../load-test-cases";

import * as rule from "../../../lib/rules/no-unknown-class";

const tester = new RuleTester({
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
    ecmaFeatures: { jsx: true },
  },
});

function postcssConfigTestCase(): RuleTester.ValidTestCase {
  const fixtureRoot = path.join(__dirname, "../../fixtures/no-unknown-class/postcss-config");

  function read(filename: string): string {
    return fs.readFileSync(path.join(fixtureRoot, filename), { encoding: "utf-8" });
  }

  return {
    filename: "postcss-config",
    code: read("Component.jsx"),
    options: [{ config: { postcss: true }, stylesheet: "styles.css" }],
    cwd: fixtureRoot,
  };
}

const cases = loadTestCases("no-unknown-class/default");
cases.valid.push(postcssConfigTestCase());
tester.run("no-unknown-class", rule, cases);
