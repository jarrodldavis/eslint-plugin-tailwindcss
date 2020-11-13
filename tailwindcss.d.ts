declare module "tailwindcss" {
  import { OldPlugin } from "postcss";
  const tailwindcss: OldPlugin<string>;
  export default tailwindcss;
}
