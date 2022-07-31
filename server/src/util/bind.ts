// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const bindMethods = (target: any) => {
  Object.getOwnPropertyNames(Object.getPrototypeOf(target)).map((key) => {
    if (target[key] instanceof Function && key !== "constructor") {
      // eslint-disable-next-line @typescript-eslint/ban-types
      target[key] = (target[key] as Function).bind(target);
    }
  });
};
