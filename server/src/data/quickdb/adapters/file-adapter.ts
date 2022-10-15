import * as fs from "fs";
import * as path from "path";
import { QuickDbAdapter, QuickDbStore } from "../types";

export class QuickDbFileAdapter<T> implements QuickDbAdapter<T> {
  private store: QuickDbStore<T> | null = null;
  private readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  readStore(): QuickDbStore<T> | null {
    this.store = readStore(this.name);
    return this.store;
  }

  writeStore(store: QuickDbStore<T>): void {
    writeStore(this.name, store);
    this.store = store;
  }
}

const getFileName = (dbname: string) => path.join(process.cwd(), dbname);

const readStore = <T>(dbname: string): QuickDbStore<T> | null => {
  const fileName = getFileName(dbname);
  try {
    const content = fs.readFileSync(fileName);
    const store = JSON.parse(content.toString());
    return store;
  } catch (e) {
    if (e.code !== "ENOENT") {
      console.error(e);
    }
    return null;
  }
};

const writeStore = <T>(dbname: string, store: QuickDbStore<T>) => {
  const fileName = getFileName(dbname);
  const content = JSON.stringify(store);
  fs.writeFileSync(fileName, content);
};
