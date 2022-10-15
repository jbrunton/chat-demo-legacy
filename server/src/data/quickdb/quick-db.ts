import { CollectionChain, cloneDeep } from "lodash";
import { default as lodash } from "lodash";
import { QuickDbStore, QuickDbAdapter, QuickDbConfig } from "./types";

export class QuickDb<T> {
  private store: QuickDbStore<T>;
  private readonly config: QuickDbConfig<T>;

  get adapter(): QuickDbAdapter<T> {
    return this.config.adapter;
  }

  constructor(config: QuickDbConfig<T>) {
    this.config = config;
    this.store = this.initStore();
  }

  get<K extends keyof T>(name: K): CollectionChain<T[K]> {
    const collection = this.store[name];
    return lodash(collection).chain();
  }

  set<K extends keyof T>(name: K, collection: Array<T[K]>) {
    this.store[name] = collection;
  }

  read() {
    this.store = this.adapter.readStore() ?? this.store;
  }

  write(): void {
    this.adapter.writeStore(this.store);
  }

  private initStore() {
    let store = this.adapter.readStore();
    if (!store) {
      store = cloneDeep(this.config.initStore());
      this.adapter.writeStore(store);
    }
    return store;
  }
}
