import type { Rule } from "eslint";

type Schema = Rule.RuleMetaData["schema"];

export interface Options {
  config: { postcss: true } | { tailwind: string | null };
  stylesheet: string | null;
  classNameAttributes: string[];
  classNameBuilders: string[];
}

const DEFAULT_OPTIONS: Options = {
  config: { tailwind: null },
  stylesheet: null,
  classNameAttributes: ["className", "class"],
  classNameBuilders: ["clsx", "classcat", "classnames", "classNames"],
};

export const schema: Schema = [
  {
    $schema: "http://json-schema.org/draft-04/schema#",
    $id: "no-unknown-class",
    type: "object",
    definitions: {
      config: {
        title: "Configuration",
        description: "PostCSS or Tailwind configuration.",
        type: "object",
        oneOf: [
          {
            properties: {
              postcss: {
                title: "PostCSS Configuration",
                description: "Use additional PostCSS plugins declared in postcss.config.js (or similar configuration).",
                type: "boolean",
                enum: [true],
              },
            },
            additionalProperties: false,
            required: ["postcss"],
          },
          {
            properties: {
              tailwind: {
                title: "Tailwind Configuration",
                description: "The path to the Tailwind configuration file, relative to the current working directory.",
                type: "string",
              },
            },
            additionalProperties: false,
          },
        ],
        default: DEFAULT_OPTIONS.config,
      },
      stylesheet: {
        title: "Input Stylesheet",
        description: "The path to the source Tailwind stylesheet, relative to the current working directory.",
        type: "string",
        default: DEFAULT_OPTIONS.stylesheet,
      },
      classNameAttributes: {
        title: "CSS Class Attributes",
        description: "JSX prop names corresponding to the `class` HTML attribute and `className` Element property.",
        type: "array",
        items: {
          type: "string",
        },
        default: DEFAULT_OPTIONS.classNameAttributes,
      },
      classNameBuilders: {
        title: "ClassName Builder Functions",
        description: "Names of functions that build `class`/`className` values.",
        type: "array",
        items: {
          type: "string",
        },
        default: DEFAULT_OPTIONS.classNameBuilders,
      },
    },
    oneOf: [
      {
        properties: {
          config: { $ref: "#/definitions/config" },
          stylesheet: { $ref: "#/definitions/stylesheet" },
        },
        additionalProperties: false,
      },
      {
        properties: {
          config: { $ref: "#/definitions/config" },
          stylesheet: { $ref: "#/definitions/stylesheet" },
          classNameAttributes: { allOf: [{ $ref: "#/definitions/classNameAttributes" }, { minItems: 1 }] },
          classNameBuilders: { allOf: [{ $ref: "#/definitions/classNameBuilders" }, { maxItems: 0 }] },
        },
        additionalProperties: false,
        required: ["classNameAttributes"],
      },
      {
        properties: {
          config: { $ref: "#/definitions/config" },
          stylesheet: { $ref: "#/definitions/stylesheet" },
          classNameAttributes: { allOf: [{ $ref: "#/definitions/classNameAttributes" }, { maxItems: 0 }] },
          classNameBuilders: { allOf: [{ $ref: "#/definitions/classNameBuilders" }, { minItems: 1 }] },
        },
        additionalProperties: false,
        required: ["classNameBuilders"],
      },
      {
        properties: {
          config: { $ref: "#/definitions/config" },
          stylesheet: { $ref: "#/definitions/stylesheet" },
          classNameAttributes: { allOf: [{ $ref: "#/definitions/classNameAttributes" }, { minItems: 1 }] },
          classNameBuilders: { allOf: [{ $ref: "#/definitions/classNameBuilders" }, { minItems: 1 }] },
        },
        additionalProperties: false,
        required: ["classNameAttributes", "classNameBuilders"],
      },
    ],
  },
];

export function getOptions(options: unknown[]): Options {
  const providedOptions = options[0];
  if (typeof providedOptions === "object") {
    return { ...DEFAULT_OPTIONS, ...providedOptions };
  } else {
    return { ...DEFAULT_OPTIONS };
  }
}
