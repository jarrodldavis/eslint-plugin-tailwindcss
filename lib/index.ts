import * as noUnknownClass from "./rules/no-unknown-class";

export = {
  rules: {
    "no-unknown-class": noUnknownClass,
  },
  configs: {
    recommended: {
      plugins: ["@jarrodldavis/tailwindcss"],
      rules: {
        "@jarrodldavis/tailwindcss/no-unknown-class": "error",
      },
    },
  },
};
