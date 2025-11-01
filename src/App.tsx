import { useEffect, useState } from "react";
import { db, DiaryEntry } from "./db";
import "./App.css";

function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  // 起動時に保存済みデータを読み込み
  useEffect(() => {
    db.diary.orderBy("date").reverse().toArray().then(setEntries);
  }, []);

  // 保存ボタン
  const handleSave = async () => {
    if (!content.trim()) return; // 空は無視

    const entry: DiaryEntry = {
      title: title || "無題",
      content,
      date: new Date().toISOString(),
    };

    await db.diary.add(entry);
    setEntries(await db.diary.orderBy("date").reverse().toArray());

    setTitle("");
    setContent("");
  };

  // 削除ボタン
  const handleDelete = async (id?: number) => {
    if (!id) return;
    await db.diary.delete(id);
    setEntries(await db.diary.orderBy("date").reverse().toArray());
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <span className="app-icon">📔</span>
          <h1 className="app-title">日記アプリ</h1>
        </div>
      </header>

      <main className="app-main">
        <section className="entry-form">
          <div className="form-group">
            <input
              className="input-title"
              placeholder="タイトル"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <textarea
              className="textarea-content"
              placeholder="今日の出来事や気分を書こう..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
            />
          </div>

          <button className="btn-save" onClick={handleSave}>
            <span className="btn-icon">💾</span>
            保存する
          </button>
        </section>

        <section className="entries-section">
          <h2 className="section-title">
            <span className="section-icon">📚</span>
            過去の日記
          </h2>
          
          {entries.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📝</span>
              <p className="empty-text">まだ日記がありません</p>
              <p className="empty-subtext">思い出を残してみましょう</p>
            </div>
          ) : (
            <div className="entries-list">
              {entries.map((e) => (
                <article key={e.id} className="entry-card">
                  <div className="entry-header">
                    <time className="entry-date">
                      {new Date(e.date).toLocaleString("ja-JP", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(e.id)}
                      aria-label="削除"
                    >
                      🗑️
                    </button>
                  </div>
                  <h3 className="entry-title">{e.title}</h3>
                  <p className="entry-content">{e.content}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
