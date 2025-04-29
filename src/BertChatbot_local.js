import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import SurveyForm from "./SurveyForm";

export default function BertChatbot() {
  const sanitize = (str) => {
    const temp = document.createElement("div");
    temp.textContent = str;
    return temp.innerHTML;
  };

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [categoryQuestions] = useState({
    "Apps & Software": ["Can I update apps automatically?", "How to connect to the TV via the SmartThings app?", "How do I install apps on the TV?"],
    "Battery & Power": ["How do I check battery usages ?"],
    "Camera & Media": ["How can I setup a shutter sound on my camera?", "How do I troubleshoot video issues ?", "Can I turn on Video Description?"],
    "Connectivity": ["How to connect to Internet network?", "How to reset network?", "How do I listen to the TV through Bluetooth devices?"],
    "Customer Support": ["Can I request for service?", "I am facing problems in my TV. How do I get Remote Support?", "What is Remote Support?"],
    "Display & Screen": ["How can I Show the notifications on Display ?", "Can I fix the screen color issues?", "How can I enable screenshot toolbar?"],
    "General": ["What is Universal remote?", "How do I lock a current channel?", "How do I reset Smart Hub?"],
    "Navigation": ["How do I use Google Maps?", "How do I select memory location?"],
    "Settings": ["I want to change Game Mode settings. How to do this?", "Where do I find the DNS values in IP Settings?", "Can I change the content and settings for Ambient Mode?"]
  });

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
    if (!input.trim() || surveyCompleted) return;
    const userMsg = { role: "user", text: sanitize(input), time: formatTime() };
    setMessages((prev) => [...prev, userMsg]);

    if (["그만", "종료", "고마워"].includes(input.trim())) {
      setMessages((prev) => [...prev, { role: "bot", text: "챗봇이 종료되었습니다. 설문에 참여해주세요 😊", time: formatTime() }]);
      setShowSurvey(true);
      setInput("");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: input }) });
      const data = await res.json();
      const botMsg = { role: "bot", text: data.best_answer, confidence: data.confidence, suggestions: data.best_answer === "We couldn't find a sufficiently relevant answer to your inquiry." ? [] : data.suggestions || [], time: formatTime() };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: "서버 오류! 연결 실패", time: formatTime() }]);
    }

    setInput("");
  };

  const handleSurveySubmit = async (answers) => {
    await fetch("http://127.0.0.1:8000/survey", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(answers) });
    alert("설문이 성공적으로 제출되었습니다. 감사합니다!");
    setShowSurvey(false);
    setSurveyCompleted(true);
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
    setMessages((prev) => [...prev, { role: "bot", text: "챗봇이 종료되었습니다. 설문에 참여해주세요 😊", time: formatTime() }]);
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4 flex gap-4">
      <div className="w-1/3 bg-gray-50 border rounded p-3 shadow-sm h-[600px] overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">📚 추천 질문</h3>
        {Object.entries(categoryQuestions).map(([category, questions]) => (
          <div key={category} className="mb-3">
            <div className="text-xs font-bold text-gray-600 mb-1">{category}</div>
            <div className="flex flex-wrap gap-2">
              {questions.map((q, i) => (
                <button key={i} onClick={() => setInput(q)} className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {q}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="w-2/3 flex flex-col">
        <div className="flex justify-between mb-2">
          <h2 className="text-2xl font-semibold">🤖 BERT 챗봇</h2>
          <div className="flex gap-2">
            <button onClick={clearConversation} className="text-sm text-blue-600 underline">대화 초기화</button>
            <button onClick={exitChatbot} disabled={surveyCompleted} className={`text-sm underline ${surveyCompleted ? "text-gray-400 cursor-not-allowed" : "text-red-600"}`}>챗봇 종료</button>
          </div>
        </div>
        <div className="text-xs text-gray-600 mb-4">
          📝 챗봇을 종료하려면 "챗봇 종료" 버튼 클릭 OR "그만", "고마워", "종료" 중 하나를 입력해주세요.<br/>
          📢 This chatbot accepts inquiries in English only, and provides responses exclusively in English.<br/>
          It specializes in QA services related to Samsung S10 devices and Smart TVs.<br/>
          이 챗봇은 영어로만 질문을 받으며, 답변 또한 영어로 제공됩니다. 삼성 S10 및 스마트 TV 제품 관련 질의응답(QA) 서비스를 전문으로 지원합니다.
        </div>

        <div className="bg-white border overflow-y-auto h-[400px] p-4 rounded shadow">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-start mb-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "bot" && <img src="https://cdn-icons-png.flaticon.com/128/773/773330.png" alt="bot" className="w-8 h-8 mr-2 rounded-full" />}
              <div className={`rounded-xl px-4 py-2 max-w-[70%] text-sm ${msg.role === "user" ? "bg-blue-100 text-right" : "bg-gray-100 text-left"}`}>
                <div className="font-semibold text-xs mb-1">{msg.role === "user" ? "나" : "BERT 봇"}</div>
                {msg.text}
                <div className="text-[10px] text-gray-500 mt-1 flex justify-between">
                  {msg.confidence && <span>{Math.round(msg.confidence * 100)}% 확신</span>}
                  <span>{msg.time}</span>
                </div>
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs font-semibold text-gray-500 mb-1">📌 추천 답변</div>
                    <div className="flex flex-wrap gap-2">
                      {msg.suggestions.map((suggestion, idx) => (
                        <button key={idx} onClick={() => handleSuggestionClick(suggestion)} className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded">
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {msg.role === "user" && <img src="https://cdn-icons-png.flaticon.com/128/763/763724.png" alt="user" className="w-8 h-8 ml-2 rounded-full" />}
            </div>
          ))}
          {messages.length > 0 && <div ref={endRef} />}
        </div>

        {showSurvey ? (
          <div className="mt-4 p-4 border rounded shadow bg-gray-50">
            <SurveyForm onSubmit={handleSurveySubmit} surveyCompleted={surveyCompleted} />
          </div>
        ) : (
          <div className="flex mt-4 gap-2">
            <input onKeyDown={handleKeyDown} value={input} onChange={(e) => setInput(e.target.value)} placeholder="메시지를 입력하세요..." className="flex-1 border rounded px-3 py-2" disabled={surveyCompleted} />
            <button disabled={surveyCompleted} onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              전송
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
