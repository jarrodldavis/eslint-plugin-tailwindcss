export default function Component() {
  const classes = true ? "class-a class-b" : "class-c class-d";
  return <div className={classes}></div>;
}
