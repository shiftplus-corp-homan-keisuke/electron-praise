import Dexie, { type Table } from 'dexie';

interface SettingsRecord {
  key: string;
  value: unknown;
}

class HachiwarePraiseDB extends Dexie {
  settings!: Table<SettingsRecord, string>;

  constructor() {
    super('HachiwarePraiseDB');
    this.version(1).stores({
      settings: 'key',
    });
  }
}

export const db = new HachiwarePraiseDB();
