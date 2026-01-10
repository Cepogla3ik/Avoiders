import type { EntityNetData, ImmutableNetDataProps, MutableEntityNetData } from "@shared/types/NetData.ts";

export default class EntityNetDataStorage<T extends EntityNetData> {
  private full: T;
  private changed: Partial<Omit<T, ImmutableNetDataProps>> = {};
  
  constructor(defaultNetData: T) {
    this.full = structuredClone(defaultNetData);
  }

  set<K extends keyof MutableEntityNetData<T>>(key: K, value: MutableEntityNetData<T>[K]) {
    if (this.full[key] === value) return;
    this.full[key] = value;
    this.changed[key] = value;
  }

  clearChanged() { this.changed = {}; }

  getFull(): Readonly<T> { return this.full; }
  getChanged(): Partial<Omit<T, ImmutableNetDataProps>> & Pick<T, ImmutableNetDataProps> | undefined {
    if (Object.keys(this.changed).length === 0) return undefined;

    return {
      id: this.full.id,
      type: this.full.type,
      ...this.changed
    };
  }
}