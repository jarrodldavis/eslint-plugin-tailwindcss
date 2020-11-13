# Enforces usage of Tailwind CSS utility and component classes (`no-unknown-class`)

The [Tailwind CSS](https://tailwindcss.com) framework has a plethora of utility classes, and allows extensive
configuration of which utility classes are available. It also allows for extracting multiple utilities into CSS
component classes. As such, it may be difficult to keep track of what CSS classes are available to use.

Here are some examples:

```jsx
// Bad
function ComponentOne() {
  return <div className="bg-green text-gray-999"></div>;
}

// Good
function ComponentTwo() {
  return <div className="bg-green-100 text-black"></div>;
}
```

## Rule Details

This rule enforces usage of known and enabled Tailwind CSS classes in `className` JSX attributes and configured
"class name builder" functions (by default, `clsx`, `classcat`, `classnames`, and `classNames`). Additionally, it limits usage of dynamic
values to ensure all class name values are checked.

Using the default Tailwind stylesheet, Tailwind configuration file, and rule options:

Examples of **correct** code for this rule:

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */

function Component() {
  return <div className="sm:bg-green-100 lg:bg-green-900"></div>;
}
```

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */

function Component() {
  return <div className={"sm:bg-green-100 lg:bg-green-900"}></div>;
}
```

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */

function Component({ addStyle }) {
  return <div className={addStyle && "sm:bg-green-100 lg:bg-green-900"}></div>;
}
```

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */

function Component({ alternateStyle }) {
  return <div className={alternateStyle ? "bg-green-100" : "bg-green-900"}></div>;
}
```

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */

function Component() {
  const classes = "sm:bg-green-100 lg:bg-green-900";
  return <div className={classes}></div>;
}
```

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */

function Component({ addStyle }) {
  const classes = addStyle && "sm:bg-green-100 lg:bg-green-900";
  return <div className={classes}></div>;
}
```

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */

function Component({ alternateStyle }) {
  const classes = alternateStyle ? "bg-green-100" : "bg-green-900";
  return <div className={classes}></div>;
}
```

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */
import clsx from "clsx";

function Component({ addStyle }) {
  return <div className={clsx({ "sm:bg-green-100 lg:bg-green-900": addStyle })}></div>;
}
```

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */
import clsx from "clsx";

function Component({ alternateStyle }) {
  return <div className={clsx({ "bg-green-100": alternateStyle, "bg-green-900": !alternateStyle })}></div>;
}
```

Examples of **incorrect** code for this rule:

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */

function Component() {
  return <div className="unknown-class"></div>;
}
```

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */

function Component() {
  return <div className={"unknown-class"}></div>;
}
```

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */

function Component({ addStyle }) {
  return <div className={addStyle && "unknown-class"}></div>;
}
```

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */

function Component({ alternateStyle }) {
  return <div className={alternateStyle ? "unknown-class" : "another-bad-class"}></div>;
}
```

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */

function Component() {
  const classes = "unknown-class";
  return <div className={classes}></div>;
}
```

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */

function Component({ addStyle }) {
  const classes = addStyle && "unknown-class";
  return <div className={classes}></div>;
}
```

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */

function Component({ alternateStyle }) {
  const classes = alternateStyle ? "unknown-class" : "another-bad-class";
  return <div className={classes}></div>;
}
```

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */
import clsx from "clsx";

function Component({ addStyle }) {
  return <div className={clsx({ "unknown-class": addStyle })}></div>;
}
```

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */
import clsx from "clsx";

function Component({ alternateStyle }) {
  return <div className={clsx({ "unknown-class": alternateStyle, "another-bad-class": !alternateStyle })}></div>;
}
```

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */

function Component({ styles }) {
  return <div className={styles}></div>;
}
```

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */

function Component({ addStyles, styles }) {
  return <div className={addStyles && styles}></div>;
}
```

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */
import { styles, alternateStyles } from "./style-provider";

function Component({ isAlternate }) {
  return <div className={isAlternate ? alternateStyles : styles}></div>;
}
```

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */
import clsx from "clsx";

function Component({ styles }) {
  return <div className={clsx(styles, "bg-green-100")}></div>;
}
```

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */
import clsx from "clsx";

function Component({ addStyles, styles }) {
  return <div className={clsx(addStyles && styles, "bg-green-100")}></div>;
}
```

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */
import clsx from "clsx";
import { styles, alternateStyles } from "./style-provider";

function Component({ isAlternate }) {
  return <div className={clsx({ [alternateStyles]: isAlternate, [styles]: !isAlternate, "bg-green-100": true })}></div>;
}
```

## Options

This rule takes an optional options object with four properties: `config`, `stylesheet`, `classNameAttributes`, and
`classNameBuilders`.

### `config`

An object value that defaults to `{ "tailwind": null }`. The object can have one (and only one) of two properties:
`postcss` or `tailwind`.

#### `config.postcss`

A boolean value that must be `true`. If `true`, a PostCSS configuration file will be found using the behavior of
`postcss-cli` and other PostCSS tools. Typically, this means the `postcss.config.js` file closest to (but not below)
the current working directory will be used, but see the [`postcss-load-config`] and [`cosmiconfig`] packages for
further details.

[`postcss-load-config`]: https://github.com/postcss/postcss-load-config
[`cosmiconfig`]: https://github.com/davidtheclark/cosmiconfig

#### `config.tailwind`

A string value that defaults to `null`. If non-`null`, this rule will use this as the path to your Tailwind
configuration file, relative to the current working directory. If `null`, the default Tailwind configuration loading
behavior will be used (load `tailwind.config.js` if available, otherwise fallback to Tailwind's built-in default
configuration).

---

Examples of **correct** code for the default `{ "config": { "tailwind": null } }` option:

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error", { "config": { "tailwind": null } }] */
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */ // these are equivalent

function Component() {
  return <div className="sm:bg-green-100 lg:bg-green-900"></div>;
}
```

Examples of **incorrect** code for the `{ "config": { "tailwind": null } }` option:

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error", { "config": { "tailwind": null } }] */
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */ // these are equivalent

function Component() {
  return <div className="unknown-class"></div>;
}
```

---

Using the follwing configuration file:

```js
// tw.config.js
module.exports = {
  future: {},
  purge: [],
  theme: {
    extend: {},
    screens: {
      mobile: '768px',
      desktop: '1024px';
    }
  },
  variants: {},
  plugins: [],
};
```

Examples of **correct** code for the `{ "config": { "tailwind": "tw.config.js" } }` option:

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error", { "config": { "tailwind": "tw.config.js" } }] */

function Component() {
  return <div className="bg-green-100 mobile:bg-green-900"></div>;
}
```

Examples of **incorrect** code for the `{ "config": { "tailwind": "tw.config.js" } }` option:

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error", { "config": { "tailwind": "tw.config.js" } }] */

function Component() {
  return <div className="sm:bg-green-100 lg:bg-green-900"></div>;
}
```

### `stylesheet`

A string value that defaults to `null`. If non-`null`, this rule will use this as the path to your Tailwind-processed
input CSS stylesheet, relative to the current working directory. If `null`, the default Tailwind behavior will be used,
which is equivalent to specifying this stylesheet:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

Using the following stylesheet:

```css
/* styles.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .some-component {
    @apply bg-green-100 text-black;
  }
}
```

Examples of **correct** code for the `{ "stylesheet": "styles.css" }` option:

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error", { "stylesheet": "styles.css" }] */

function Component() {
  return <div className="some-component"></div>;
}
```

Examples of **incorrect** code for the `{ "stylesheet": "styles.css" }` option:

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error", { "stylesheet": "styles.css" }] */

function Component() {
  return <div className="another-component"></div>;
}
```

### `classNameAttributes`

An array-of-strings value that defaults to `["className", "class"]`. If non-empty, it will be used to determine which
JSX attributes will be validated for known Tailwind CSS classes. If empty, `classNameBuilders` must be non-empty.

Examples of **correct** code for the default `{ "classNameAttributes": ["className", "class"] }` option:

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error", { "classNameAttributes": ["className", "class"] }] */
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */ // these are equivalent

function Component() {
  return <div className="bg-green-100 text-black"></div>;
}
```

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error", { "classNameAttributes": ["className", "class"] }] */
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */ // these are equivalent

function Component() {
  return <div someAttr="not-a-class"></div>;
}
```

Examples of **incorrect** code for the default `{ "classNameAttributes": ["className", "class"] }` option:

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error", { "classNameAttributes": ["className", "class"] }] */
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */ // these are equivalent

function Component() {
  return <div className="some-unknown-class"></div>;
}
```

### `classNameBuilders`

An array-of-strings value that defaults to `["clsx", "classcat", "classnames", "classNames"]`. If non-empty, it will be
used to determine what function calls will be validated for known Tailwind CSS classes. If empty, `classNameAttributes`
must be non-empty.

Examples of **correct** code for the default `{ "classNameBuilders": ["clsx", "classcat", "classnames", "classNames"] }` option:

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error", { "classNameBuilders": ["clsx", "classcat", "classnames", "classNames"] }] */
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */ // these are equivalent

import clsx from "clsx";

clsx("bg-green-100", { "text-black": true, "text-gray-900": false });
```

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error", { "classNameBuilders": ["clsx", "classcat", "classnames", "classNames"] }] */
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */ // these are equivalent

import fn from "some-dependency";

fn("not-a-class");
```

Examples of **incorrect** code for the default `{ "classNameBuilders": ["clsx", "classcat", "classnames", "classNames"] }` option:

```jsx
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error", { "classNameBuilders": ["clsx", "classcat", "classnames", "classNames"] }] */
/* eslint @jarrodldavis/tailwindcss/no-unknown-class: ["error"] */ // these are equivalent

import clsx from "clsx";

clsx("bg-green", { "unknown-class": true });
```

## When Not To Use It

Do not use this rule if you do not use Tailwind CSS exclusively, or use highly dynamic CSS solutions like CSS-in-JS or
CSS modules.
