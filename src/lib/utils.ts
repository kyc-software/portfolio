type ClassName<State> = string | ((state: State) => string | undefined) | undefined;

export function cn(...classes: (string | undefined)[]): string;
export function cn<State>(
  ...classes: ClassName<State>[]
): string | ((state: State) => string);
export function cn<State>(...classes: ClassName<State>[]) {
  if (classes.some((value) => typeof value === "function")) {
    return (state: State) =>
      classes
        .map((value) => (typeof value === "function" ? value(state) : value))
        .filter(Boolean)
        .join(" ");
  }
  return classes.filter(Boolean).join(" ");
}
