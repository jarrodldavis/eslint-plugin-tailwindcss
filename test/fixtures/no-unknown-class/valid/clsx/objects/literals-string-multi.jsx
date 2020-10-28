import clsx from "clsx";

export default function Component() {
  const classes = clsx(
    { "text-white bg-green-900": true, "text-green-100 bg-black": false },
    { "px-2 py-3": true, "px-5 py-10": false }
  );
}
