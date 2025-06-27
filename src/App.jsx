import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { sendMessage } from "./api/chat";

function App() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([
    {
      role: "assistant",
      content: "Hi there! 👋 I'm the Mindglobal Assistant. How can I help you today?",
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

const handleSend = async () => {
  if (!input.trim()) return;

  const userMessage = { role: "user", content: input };
  const newHistory = [...history, userMessage];
  setHistory(newHistory);
  setInput("");
  setIsTyping(true);

  const rawReply = await sendMessage(input);

  // ✅ Clean all known citation formats
const cleanedReply = rawReply
  .replace(/\[\d+\]/g, "")                  // [1], [2]
  .replace(/【.*?†.*?】/g, "")              // removes  
  .replace(/\(\d+\)/g, "")                  // (1), (2)
  .replace(/<sup>.*?<\/sup>/gi, "");        // future HTML-style citations

  const assistantMessage = { role: "assistant", content: cleanedReply };
  setHistory((h) => [...h, assistantMessage]);
  setIsTyping(false);
};

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isTyping]);

  // ✅ Eliminate spacing between paragraphs and list items
  const markdownComponents = {
    p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
    li: ({ children }) => <li style={{ margin: 0 }}>{children}</li>,
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>💬 MindGlobal AI Assistant</h2>

      <div style={styles.chatBox}>
        {history.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              ...(msg.role === "user" ? styles.user : styles.assistant),
            }}
          >
            <div
              style={{
                ...styles.bubble,
                ...(msg.role === "user"
                  ? styles.userBubble
                  : styles.assistantBubble),
              }}
            >
              <ReactMarkdown components={markdownComponents}>
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ ...styles.message, ...styles.assistant }}>
            <div style={{ ...styles.bubble, ...styles.assistantBubble }}>
              <i>Assistant is typing...</i>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div style={styles.inputArea}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
          style={styles.input}
        />
        <button onClick={handleSend} style={styles.button}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "sans-serif",
    maxWidth: 600,
    margin: "2rem auto",
    padding: "1rem",
    border: "1px solid #ddd",
    borderRadius: "12px",
    boxShadow: "0 0 10px rgba(0,0,0,0.05)",
    backgroundColor: "#f9f9f9",
  },
  header: {
    textAlign: "center",
    marginBottom: "1rem",
    color: "#333",
  },
  chatBox: {
    height: "400px",
    overflowY: "auto",
    padding: "1rem",
    backgroundColor: "#fff",
    border: "1px solid #eee",
    borderRadius: "8px",
  },
  message: {
    display: "flex",
    marginBottom: "0.5rem",
  },
  user: {
    justifyContent: "flex-end",
  },
  assistant: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "70%",
    padding: "4px 10px",
    borderRadius: "16px",
    fontSize: "0.95rem",
    lineHeight: "1.25",
    wordWrap: "break-word",
    whiteSpace: "pre-wrap",
  },
  userBubble: {
    backgroundColor: "#007bff",
    color: "#fff",
  },
  assistantBubble: {
    backgroundColor: "#e8e8e8",
    color: "#000",
  },
  inputArea: {
    marginTop: "1rem",
    display: "flex",
    gap: "0.5rem",
  },
  input: {
    flex: 1,
    padding: "0.6rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  button: {
    padding: "0.6rem 1rem",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
};

export default App;
