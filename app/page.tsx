"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (saved) setToken(saved);
  }, []);

  const register = async () => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    alert(data.message);
  };

  const login = async () => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      alert("Login successful");
    } else {
      alert(data.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setNotes([]);
  };

  const addNote = async () => {
    if (!token) return alert("Login first");
    await fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ title, content }),
    });
    setTitle("");
    setContent("");
    loadNotes();
  };

  const loadNotes = async () => {
    if (!token) return alert("Login first");
    const res = await fetch("/api/notes", {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    setNotes(data);
  };

  const deleteNote = async (id: number) => {
    if (!token) return alert("Login first");
    await fetch("/api/notes", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ id }),
    });
    loadNotes();
  };

  const summarizeWithAI = async () => {
    if (!content) return alert("Write some content first");

    try {
      const res = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();
      alert("AI Summary:\n\n" + data.summary);
    } catch (err) {
      console.error(err);
      alert("AI request failed");
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase())
  );

  const theme = darkMode ? styles.darkPage : styles.page;
  const cardTheme = darkMode ? styles.darkCard : styles.card;
  const inputTheme = darkMode ? styles.darkInput : styles.input;

  return (
    <div style={theme}>
      <div style={cardTheme}>
        <h1 style={styles.heading}>AI Notes App</h1>

        <button style={styles.toggleBtn} onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>

        <h3>Add Note</h3>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputTheme}
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ ...inputTheme, minHeight: 60 }}
        />
        <button style={styles.greenBtn} onClick={addNote}>Add Note</button>
        <button style={styles.blueBtn} onClick={summarizeWithAI}>
          Summarize with AI
        </button>

        <hr style={styles.hr} />

        <h3>Account</h3>
        <input placeholder="Name" onChange={(e) => setName(e.target.value)} style={inputTheme}/>
        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} style={inputTheme}/>
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} style={inputTheme}/>

        <div>
          <button style={styles.blueBtn} onClick={register}>Register</button>
          <button style={styles.blueBtn} onClick={login}>Login</button>
          <button style={styles.redBtn} onClick={logout}>Logout</button>
        </div>

        <hr style={styles.hr} />

        <h3>My Notes</h3>
        <input
          placeholder="🔍 Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputTheme}
        />

        <button style={styles.blueBtn} onClick={loadNotes}>Load Notes</button>

        {filteredNotes.map((note) => (
          <div key={note.id} style={styles.noteCard}>
            <h4>{note.title}</h4>
            <p>{note.content}</p>
            <button style={styles.redBtn} onClick={() => deleteNote(note.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: any = {
  page: { background: "#f2f6fc", minHeight: "100vh", padding: 30 },
  darkPage: { background: "#121212", minHeight: "100vh", padding: 30, color: "white" },

  card: { maxWidth: 500, margin: "auto", background: "white", padding: 20, borderRadius: 8 },
  darkCard: { maxWidth: 500, margin: "auto", background: "#1e1e1e", padding: 20, borderRadius: 8 },

  heading: { textAlign: "center", marginBottom: 20 },

  input: { width: "100%", padding: 8, marginBottom: 8 },
  darkInput: { width: "100%", padding: 8, marginBottom: 8, background: "#333", color: "white", border: "1px solid #555" },

  hr: { margin: "20px 0" },

  toggleBtn: { marginBottom: 15, padding: "6px 10px", cursor: "pointer" },

  greenBtn: { background: "#28a745", color: "white", padding: "8px 12px", border: "none", cursor: "pointer", marginRight: 10 },
  blueBtn: { background: "#007bff", color: "white", padding: "6px 10px", border: "none", cursor: "pointer", marginRight: 5 },
  redBtn: { background: "#dc3545", color: "white", padding: "6px 10px", border: "none", cursor: "pointer" },

  noteCard: { border: "1px solid #ddd", padding: 10, marginTop: 10, borderRadius: 5 },
};