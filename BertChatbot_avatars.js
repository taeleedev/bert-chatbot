import React, { useState } from "react";

export default function BertChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = {
      role: "user",
      text: input,
      time: formatTime(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      const botMsg = {
        role: "bot",
        text: data.response,
        confidence: data.confidence,
        time: formatTime(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "서버 오류! 연결 실패",
          time: formatTime(),
        },
      ]);
    }

    setInput("");
  };

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-semibold mb-4 text-center">🤖 BERT 챗봇</h2>
      <div className="bg-white border h-96 overflow-y-auto p-4 rounded shadow">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start mb-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "bot" && (
              <img
                src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png"
                alt="bot"
                className="w-8 h-8 mr-2 rounded-full"
              />
            )}
            <div
              className={`rounded-xl px-4 py-2 max-w-[70%] text-sm relative ${
                msg.role === "user"
                  ? "bg-blue-100 text-right"
                  : "bg-gray-100 text-left"
              }`}
            >
              <div className="font-semibold text-xs mb-1">
                {msg.role === "user" ? "나" : "BERT 봇"}
              </div>
              {msg.text}
              <div className="text-[10px] text-gray-500 mt-1 flex justify-between">
                {msg.confidence && <span>{Math.round(msg.confidence * 100)}% 확신</span>}
                <span>{msg.time}</span>
              </div>
            </div>
            {msg.role === "user" && (
              <img
                src="https://cdn-icons-png.flaticon.com/512/4086/4086679.png"
                alt="user"
                className="w-8 h-8 ml-2 rounded-full"
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex mt-4 gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          전송
        </button>
      </div>
    </div>
  );
}
