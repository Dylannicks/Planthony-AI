'use client';

import { useState, useRef, useEffect } from 'react';

export default function Widget() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm Planthony 🌱 Ask me about plant care or our products." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
      });
      const data = await res.json();

      if (data.answer) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: "Sorry, something went wrong. Please try again." },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>🌱 Planthony</div>

      <div style={styles.messages}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.bubble,
              ...(msg.role === 'user' ? styles.userBubble : styles.assistantBubble),
            }}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div style={{ ...styles.bubble, ...styles.assistantBubble }}>Typing...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputRow}>
        <textarea
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about plant care..."
          rows={1}
        />
        <button style={styles.sendButton} onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    maxWidth: '400px',
    margin: '0 auto',
    fontFamily: 'system-ui, sans-serif',
    border: '1px solid #ddd',
  },
  header: {
    padding: '12px 16px',
    background: '#2d6a4f',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    background: '#f7f7f5',
  },
  bubble: {
    padding: '10px 14px',
    borderRadius: '12px',
    maxWidth: '80%',
    fontSize: '14px',
    lineHeight: 1.4,
    whiteSpace: 'pre-wrap',
  },
  userBubble: {
    alignSelf: 'flex-end',
    background: '#2d6a4f',
    color: 'white',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    background: 'white',
    color: '#222',
    border: '1px solid #e0e0e0',
  },
  inputRow: {
    display: 'flex',
    gap: '8px',
    padding: '12px',
    borderTop: '1px solid #ddd',
    background: 'white',
  },
  input: {
    flex: 1,
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '14px',
    resize: 'none',
    fontFamily: 'inherit',
  },
  sendButton: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    background: '#2d6a4f',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};
