import clsx from "clsx";

export default function Component() {
  return <div className={clsx({ "text-white bg-green-900": true }, { "px-2 py-3": true })}></div>;
}
