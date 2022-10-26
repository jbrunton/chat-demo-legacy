import { QuickDbAuthAdapter } from "@data/quick/auth-adapter";
import { AuthDB } from "@data/quick/auth-db";

export const authDB = AuthDB.createFileSystemDB();
export const adapter = new QuickDbAuthAdapter(authDB);
