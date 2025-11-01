import Dexie from "dexie";

// ✅ 「export interface」で明示的にエクスポートする
export interface DiaryEntry {
  id?: number;
  title: string;
  content: string;
  date: string;
}

// ✅ Dexieクラスを定義
export class DiaryDB extends Dexie {
  diary!: Dexie.Table<DiaryEntry, number>;

  constructor() {
    super("diaryDatabase");
    this.version(1).stores({
      diary: "++id,date,title,content",
    });
  }
}

// ✅ インスタンスをエクスポート
export const db = new DiaryDB();
