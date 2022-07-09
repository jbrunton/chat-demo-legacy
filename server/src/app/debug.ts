import * as _debug from "debug";

export const debug = {
  email: _debug.debug("chat-demo:email"),
  messages: _debug.debug("chat-demo:messages"),
  auth: _debug.debug("chat-demo:auth"),
  log: _debug.debug("chat-demo:log"),
};

export const requireDev = () => {
  console.log(process.env);
  if (process.env.NODE_ENV === "development" || process.env.ENABLE_DEV_API) {
    throw new Error("Expected NODE_ENV=development or ENABLE_DEV_API=1");
  }
};
