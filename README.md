# @jarrodldavis/eslint-plugin-tailwindcss

> An ESLint plugin to enforce usage of Tailwind CSS utility and component classes.

## Install

Install with `npm` or `yarn`:

```sh
npm install --save-dev @jarrodldavis/eslint-plugin-tailwindcss
```

```sh
yarn add --dev @jarrodldavis/eslint-plugin-tailwindcss
```

## Usage

In your `.eslintrc.json` (or other `.eslintrc.*` configuration file):

```json
{
  "plugins": ["@jarrodldavis/tailwindcss"],
  "rules": {
    "@jarrodldavis/tailwindcss/no-unknown-class": "error"
  }
}
```

The same can be accomplished using the `recommended` config:

```json
{
  "extends": ["plugin:@jarrodldavis/tailwindcss/recommended"]
}
```

## Rule Options

See the [rule documentation][rule-docs] for details about using and configuring the `no-unknown-classes` rule.

[rule-docs]: https://github.com/jarrodldavis/eslint-plugin-tailwindcss/blob/main/docs/rules/no-unknown-class.md
