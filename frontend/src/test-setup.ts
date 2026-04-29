import "@testing-library/jest-dom/vitest";

const createMemoryStorage = (): Storage => {
  let entries = new Map<string, string>();

  return {
    get length() {
      return entries.size;
    },
    clear() {
      entries = new Map<string, string>();
    },
    getItem(key: string) {
      return entries.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(entries.keys())[index] ?? null;
    },
    removeItem(key: string) {
      entries.delete(key);
    },
    setItem(key: string, value: string) {
      entries.set(key, value);
    },
  };
};

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: createMemoryStorage(),
});
