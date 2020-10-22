import color from "supports-color";

// By default, `chalk` detects color support based on stdout
// Since `ora` writes to stderr, force colors on if stderr supports it, even if stdout doesn't
// This will happen when piping or redirecting stdout to a file (e.g. twclsx gen > output.ts)
process.env.FORCE_COLOR = color.stderr.level.toString();
delete require.cache[require.resolve("supports-color")];
