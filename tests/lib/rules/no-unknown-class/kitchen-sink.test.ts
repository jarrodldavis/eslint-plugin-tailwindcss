import { RuleTester } from "eslint";

import loadTestCases from "../../../load-test-cases";

import * as rule from "../../../../lib/rules/no-unknown-class";

const tester = new RuleTester({
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
    ecmaFeatures: { jsx: true },
  },
});

// "everything but the kitchen sink"
// - all variants for all utilities are enabled
// - all official plugins are enabled:
//   * Tailwind UI
//   * Tailwind Custom Forms (included by Tailwind UI)
//   * Tailwind Typography (included by Tailwind UI)
//   * Tailwind Aspect Ratio

tester.run(
  "no-unknown-class/kitchen-sink",
  rule,
  loadTestCases("no-unknown-class/kitchen-sink", {
    options: [{ config: { tailwind: "./tailwind.config.js" } }],
  })
);
