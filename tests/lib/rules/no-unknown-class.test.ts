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

tester.run("no-unknown-class", rule, loadTestCases("no-unknown-class"));
