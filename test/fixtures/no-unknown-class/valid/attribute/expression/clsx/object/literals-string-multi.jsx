import clsx from "clsx";

export default function Component() {
  return <div className={clsx({ "text-white bg-green-900": true, "text-green-100 bg-black": false })}></div>;
}
