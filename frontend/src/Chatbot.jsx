import React, { useState } from "react";
import axios from "axios";
import { MessagesSquare, X } from "lucide-react"; // Import Lucide icons

function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/chat", { message: input });
      const botReply = response.data.reply || "Sorry, no response.";
      setMessages(prev => [
        ...prev,
        { text: input, user: true },
        { text: botReply, user: false }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { text: input, user: true },
        { text: "Error: Could not get response.", user: false }
      ]);
    } finally {
      setInput("");
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // Floating Lucide icon button
  const chatbotBtnStyle = "fixed bottom-8 right-8 bg-purple-700 text-white rounded-full shadow-lg p-4 cursor-pointer z-50 flex items-center hover:bg-purple-900";

  // Close button style
  const closeBtnStyle = "absolute top-3 right-4 bg-purple-200 text-purple-700 p-1 rounded-full cursor-pointer font-bold flex items-center";

  return (
    <>
      {/* Chatbot Icon/Button (visible when chatbot is hidden) */}
      {!showChatbot && (
        <button
          className={chatbotBtnStyle}
          onClick={() => setShowChatbot(true)}
          aria-label="Open Chatbot"
          title="Open Chatbot"
        >
          <MessagesSquare size={32} strokeWidth={2.5} />
        </button>
      )}
      {/* Chatbot chat window/modal */}
      {showChatbot && (
        <div className="fixed bottom-6 right-6 w-96 bg-white shadow-2xl rounded-2xl p-5 z-50 border border-purple-300">
          <span className={closeBtnStyle} onClick={() => setShowChatbot(false)} title="Close">
            <X size={20} strokeWidth={3} />
          </span>
          <h2 className="text-xl font-bold mb-3 text-purple-800">Ask Habit Coach</h2>
          <div className="h-64 overflow-y-auto mb-3 space-y-2 bg-purple-50 rounded-xl p-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={msg.user ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    msg.user
                      ? "bg-purple-400 text-white px-4 py-2 rounded-xl max-w-[70%] text-right shadow font-semibold"
                      : "bg-orange-200 text-purple-900 px-4 py-2 rounded-xl max-w-[70%] text-left shadow"
                  }
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <span className="italic text-gray-600">Habit Coach is typing...</span>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask me anything…"
              className="flex-1 border border-purple-300 rounded-lg p-2 shadow"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-purple-700 hover:bg-purple-900 text-white px-4 py-2 rounded-lg font-bold shadow"
            >
              {loading ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
