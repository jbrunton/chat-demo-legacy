import { QuickDbAdapter, QuickDbStore } from "../types";

export class QuickDbMemoryAdapter<T> implements QuickDbAdapter<T> {
  private store: QuickDbStore<T> | null = null;

  constructor(store?: QuickDbStore<T>) {
    this.store = store ?? null;
  }

  readStore(): QuickDbStore<T> | null {
    return this.store;
  }

  writeStore(store: QuickDbStore<T>): void {
    this.store = store;
  }
}
