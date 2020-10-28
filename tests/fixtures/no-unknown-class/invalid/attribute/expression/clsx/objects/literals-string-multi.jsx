import clsx from "clsx";

export default function Component() {
  return (
    <div
      className={clsx(
        { "class-a class-b": true, "class-c class-d": false },
        { "class-e class-f": true, "class-g class-h": false }
      )}
    ></div>
  );
}
