import { LowAuthAdapter } from "src/data/low/auth-adapter";
import { AuthDB } from "src/data/low/auth-db";

export const adapter = new LowAuthAdapter(AuthDB.createFileSystemDB());
