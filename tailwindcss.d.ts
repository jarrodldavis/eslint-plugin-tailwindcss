declare module "tailwindcss" {
  import { Plugin } from "postcss";
  const tailwindcss: Plugin<string>;
  export default tailwindcss;
}
