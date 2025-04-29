import React, { useState } from "react";

const surveySchema = require("./survey_form_schema.json");

export default function SurveyForm({ onSubmit, surveyCompleted }) {
  const [answers, setAnswers] = useState({});

  const handleChange = (qid, value) => {
    if (surveyCompleted) return;  // 설문 완료 시 입력 차단
    if (Array.isArray(surveySchema.find(q => q.id === qid)?.options)) {
      const index = surveySchema.find(q => q.id === qid).options.indexOf(value);
      setAnswers((prev) => ({ ...prev, [qid]: index + 1 }));
    } else {
      setAnswers((prev) => ({ ...prev, [qid]: value }));
    }
  };

  const handleSubmit = () => {
    const unanswered = surveySchema.some((q) => answers[q.id] === undefined || answers[q.id] === "");
    if (unanswered) {
      alert("모든 질문에 답변해주세요.");
      return;
    }
    onSubmit(answers);
    alert("설문이 성공적으로 제출되었습니다. 감사합니다!");  // ✨ 제출 성공 시 토스트
  };

  return (
    <div className="p-4 space-y-6 text-sm">
      {surveySchema.map((q) => (
        <div key={q.id}>
          <p className="font-semibold whitespace-pre-wrap">{q.label}</p>
          {q.options === "주관식" ? (
            <textarea
              className="mt-2 w-full border rounded p-2"
              rows={3}
              value={answers[q.id] || ""}
              onChange={(e) => handleChange(q.id, e.target.value)}
              placeholder="자유롭게 작성해주세요"
              disabled={surveyCompleted}  // ✨ 비활성화 처리
            />
          ) : (
            <div className="mt-2 space-y-1">
              {q.options.map((opt, i) => (
                <label key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    checked={answers[q.id] === i + 1}
                    onChange={() => handleChange(q.id, opt)}
                    disabled={surveyCompleted}  // ✨ 비활성화 처리
                  />
                  {opt}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
      <button
        onClick={handleSubmit}
        className={`px-4 py-2 rounded text-white ${surveyCompleted ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
        disabled={surveyCompleted}
      >
        {surveyCompleted ? "설문 완료" : "설문 제출 및 저장"}
      </button>
    </div>
  );
}
