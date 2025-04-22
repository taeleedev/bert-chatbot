import React, { useState } from "react";

const surveySchema = require("./survey_form_schema.json");

export default function SurveyForm({ onSubmit }) {
  const [answers, setAnswers] = useState({});

  const handleChange = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = () => {
    onSubmit(answers);
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
            />
          ) : (
            <div className="mt-2 space-y-1">
              {q.options.map((opt, i) => (
                <label key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={(e) => handleChange(q.id, e.target.value)}
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
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        설문 제출 및 저장
      </button>
    </div>
  );
}
