// Type definitions for postcss-load-config 2.0
// Project: https://github.com/michael-ciniawsky/postcss-load-config#readme
// Definitions by: Bob Matcuk <https://github.com/bmatcuk>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.8

declare module "postcss-load-config" {
  import type { AcceptedPlugin, ProcessOptions } from "postcss";
  // eslint-disable-next-line node/no-missing-import
  import type { Options as CosmiconfigOptions } from "cosmiconfig";

  // In the ConfigContext, these three options can be instances of the
  // appropriate class, or strings. If they are strings, postcss-load-config will
  // require() them and pass the instances along.
  interface ProcessOptionsPreload {
    parser?: string | ProcessOptions["parser"];
    stringifier?: string | ProcessOptions["stringifier"];
    syntax?: string | ProcessOptions["syntax"];
  }

  // The remaining ProcessOptions, sans the three above.
  type RemainingProcessOptions = Pick<ProcessOptions, Exclude<keyof ProcessOptions, keyof ProcessOptionsPreload>>;

  // Additional context options that postcss-load-config understands.
  interface Context {
    cwd?: string;
    env?: string;
  }

  // The full shape of the ConfigContext.
  type ConfigContext = Context & ProcessOptionsPreload & RemainingProcessOptions;

  // Result of postcssrc is a Promise containing the filename plus the options
  // and plugins that are ready to pass on to postcss.
  interface Result {
    file: string;
    options: ProcessOptions;
    plugins: AcceptedPlugin[];
  }

  declare function postcssrc(ctx?: ConfigContext, path?: string, options?: CosmiconfigOptions): Promise<Result>;

  declare namespace postcssrc {
    function sync(ctx?: ConfigContext, path?: string, options?: CosmiconfigOptions): Result;
  }

  export = postcssrc;
}
