import React, { useState } from "react";

const HMPIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "👋 I’m your HMPI Advisor. Ask me about Heavy Metal Pollution Index calculation or heavy metals."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔑 IMPORTANT: Replace this with a NEW valid API Key. 
  // The console confirmed your previous key is EXPIRED.
  const API_KEY = "AIzaSyA1QiIsLjJCl5ObhWq9N-hixsi6Z5uOxbU";

  // 🤖 Using the exact model name from your provided metadata
  const MODEL = "gemini-2.5-flash";

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // System instructions force the model to stick to the rules
            system_instruction: {
              parts: [{ 
                text: "You are an Environmental Science Assistant. Rules: 1. Technical but simple. 2. Keep responses between 4-6 lines. 3. For HMPI calculation questions, explain the formula: HPI = Σ(Wi * Qi) / ΣWi. 4. Define Qi = (Mi/Si) * 100."
              }]
            },
            contents: [
              {
                role: "user",
                parts: [{ text: currentInput }]
              }
            ],
            generationConfig: {
              maxOutputTokens: 800,
              temperature: 0.5,
            }
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "API Request Failed");
      }

      const botReply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "⚠️ No response received.";

      setMessages((prev) => [...prev, { role: "bot", text: botReply }]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: `⚠️ Error: ${error.message}. Please check your API key.`
        }
      ]);
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        position: "fixed", bottom: "20px", right: "20px",
        width: isOpen ? "350px" : "60px", height: isOpen ? "480px" : "60px",
        backgroundColor: "#0f172a", borderRadius: "16px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.4)", display: "flex",
        flexDirection: "column", overflow: "hidden", zIndex: 9999, transition: "all 0.3s ease"
      }}
    >
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: "100%", height: "100%", borderRadius: "16px",
            backgroundColor: "#2563eb", border: "none", color: "white", fontSize: "24px", cursor: "pointer"
          }}
        >
          💬
        </button>
      )}

      {isOpen && (
        <>
          <div
            style={{
              background: "#2563eb", padding: "10px", fontWeight: "bold",
              fontSize: "14px", display: "flex", justifyContent: "space-between",
              alignItems: "center", color: "white"
            }}
          >
            HMPI Advisor (v2.5)
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              flex: 1, padding: "10px", overflowY: "auto",
              fontSize: "13px", color: "white"
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "12px",
                  textAlign: msg.role === "user" ? "right" : "left"
                }}
              >
                <div
                  style={{
                    background: msg.role === "user" ? "#2563eb" : "#1e293b",
                    padding: "8px 12px", borderRadius: "12px",
                    display: "inline-block", maxWidth: "85%",
                    whiteSpace: "pre-wrap" // Allows multi-line formulas
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && <div style={{ fontSize: "12px", color: "#94a3b8" }}>Consulting database...</div>}
          </div>

          <div
            style={{
              display: "flex", padding: "8px", borderTop: "1px solid #1e293b"
            }}
          >
            <input
              type="text"
              placeholder="Ask about HMPI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              style={{
                flex: 1, padding: "8px", borderRadius: "8px", border: "none",
                outline: "none", fontSize: "13px", backgroundColor: "#1e293b", color: "white"
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                marginLeft: "8px", backgroundColor: "#2563eb", border: "none",
                color: "white", padding: "0 15px", borderRadius: "8px", cursor: "pointer"
              }}
            >
              ➤
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default HMPIChatBot;