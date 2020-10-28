import clsx from "clsx";

export default function Component() {
  return (
    <div
      className={clsx({ "text-white": true, "text-green-100": false }, { "bg-green-900": true, "bg-black": false })}
    ></div>
  );
}
