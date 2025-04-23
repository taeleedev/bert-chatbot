
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import SurveyForm from "./SurveyForm";

export default function BertChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showSurvey, setShowSurvey] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("bert_chat_log");
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  useLayoutEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("bert_chat_log", JSON.stringify(messages));
  }, [messages]);

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

    if (["그만", "종료", "고마워"].includes(input.trim())) {
      setShowSurvey(true);
      setInput("");
      return;
    }

    try {
      const res = await fetch("http://ec2-3-35-21-64.ap-northeast-2.compute.amazonaws.com:8000/chat", {
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

  const handleSurveySubmit = async (answers) => {
    await fetch("https://ec2-3-35-21-64.ap-northeast-2.compute.amazonaws.com:8000/survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
    });
    setShowSurvey(false);
  };

  const clearConversation = () => {
    setMessages([]);
    localStorage.removeItem("bert_chat_log");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const exitChatbot = () => {
    setShowSurvey(true);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-semibold mb-4 text-center">🤖 BERT 챗봇</h2>
      <div className="flex justify-end gap-2 mb-2">
        <button onClick={clearConversation} className="text-sm text-blue-600 underline">대화 초기화</button>
        <button onClick={exitChatbot} className="text-sm text-red-600 underline">챗봇 종료</button>
      </div>
      <div className="bg-white border overflow-y-auto h-[400px] p-4 rounded shadow">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start mb-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "bot" && (
              <img
                src="https://cdn-icons-png.flaticon.com/128/773/773330.png"
                alt="bot"
                className="w-8 h-8 mr-2 rounded-full"
              />
            )}
            <div
              className={`rounded-xl px-4 py-2 max-w-[70%] text-sm ${
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
                src="https://cdn-icons-png.flaticon.com/128/763/763724.png"
                alt="user"
                className="w-8 h-8 ml-2 rounded-full"
              />
            )}
          </div>
        ))}
        {messages.length > 0 && <div ref={endRef} />}
      </div>

      {showSurvey ? (
        <div className="mt-6 p-4 border rounded shadow bg-gray-50">
          <SurveyForm onSubmit={handleSurveySubmit} />
        </div>
      ) : (
        <div className="flex mt-4 gap-2">
          <input
            onKeyDown={handleKeyDown}
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
      )}
    </div>
  );
}
