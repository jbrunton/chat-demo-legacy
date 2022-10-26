export type QuickDbStore<T> = {
  [K in keyof T]: Array<T[K]>;
};

export interface QuickDbAdapter<T> {
  readStore(): QuickDbStore<T> | null;
  writeStore(store: QuickDbStore<T>): void;
}

export interface QuickDbConfig<T> {
  adapter: QuickDbAdapter<T>;
  initStore: () => QuickDbStore<T>;
}
