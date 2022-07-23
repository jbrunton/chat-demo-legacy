export const bindMethods = (target: any) => {
  Object.getOwnPropertyNames(Object.getPrototypeOf(target)).map((key) => {
    if (target[key] instanceof Function && key !== "constructor") {
      target[key] = target[key].bind(target);
    }
  });
};
