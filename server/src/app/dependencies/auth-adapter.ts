import { LowAuthAdapter } from "@data/low/auth-adapter";
import { AuthDB } from "@data/low/auth-db";

export const authDB = AuthDB.createFileSystemDB();
export const adapter = new LowAuthAdapter(authDB);
