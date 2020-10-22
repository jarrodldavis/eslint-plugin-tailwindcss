import color from "supports-color";

// By default, `chalk` detects color support based on stdout
// Since `ora` writes to stderr, force colors on if stderr supports it, even if stdout doesn't
// This will happen when piping or redirecting stdout to a file (e.g. twclsx gen > output.ts)

let level: number;
if (color.stderr === false) {
  level = 0;
} else if (color.stderr === true) {
  level = 1;
} else {
  level = color.stderr.level;
}

process.env.FORCE_COLOR = level.toString();
delete require.cache[require.resolve("supports-color")];
