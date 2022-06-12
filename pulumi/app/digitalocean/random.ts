import * as crypto from "crypto";

export const randomString = () => crypto.randomBytes(4).toString('hex');
