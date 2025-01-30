import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const MockInterviewQuiz = () => {
  const [searchParams] = useSearchParams();
  const jobRole = searchParams.get("role") || "Software Developer";
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [value, setValue] = useState("");
  const [uniqueId, setUniqueId] = useState("");

  const fetchQuestions = async () => {
    if (!uniqueId) {
      alert("No unique Id provided");
      return;
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: `Generate 10 multiple-choice mock interview questions for a ${jobRole}.
        Respond ONLY with a JSON array in this format:
        [
          {
            "question": "What is React?",
            "options": ["A framework", "A library", "A language", "An API"],
            "correctAnswer": 1,
            "explanation": "React is a JavaScript library for building UI.",
            "tip": "Focus on understanding components and state management."
          }
        ]`,
          },
        ],
      });

      const parsedQuestions = JSON.parse(response.choices[0].message.content);
      setQuestions(parsedQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uniqueId.length === 3) {
      fetchQuestions();
    }
  }, [jobRole, uniqueId]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleModalSubmit = () => {
    if (value.length === 3) {
      setShowModal(false);
      setUniqueId(value);
    } else {
      alert("Please enter a valid 3-digit unique ID");
    }
  };

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
    setShowFeedback(true);
    if (index === currentQuestion.correctAnswer) setScore(score + 1);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setQuizComplete(true);
      handleSubmitScore();
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setQuizComplete(false);
    setScore(0);
  };

  const handleSubmitScore = async () => {
    try {
      const url = `https://hireagent.app.n8n.cloud/webhook/91965100-fe7d-4fa2-a252-5f1560bd6694?uniqueId=131&score=2`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("Error during fetch:", error);
      return null;
    }
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 bg-gray-300 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">
              Enter your 3-digit Unique ID
            </h2>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="border border-gray-300 p-2 rounded-md mb-4"
              maxLength="3"
            />
            <button
              onClick={handleModalSubmit}
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </div>
      )}
      {loading ? (
        <p className="text-center text-lg">Loading questions...</p>
      ) : (
        <>
          {quizComplete ? (
            <div className="text-center p-8">
              <h2 className="text-3xl font-bold">Test Completed!</h2>
              <p className="text-lg mt-2">
                Your score will be sent to your Telegram ID.
              </p>
              <button
                onClick={resetQuiz}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
              <h2 className="text-3xl font-bold text-center">
                Mock Interview for {jobRole}
              </h2>
              <div className="relative w-full bg-gray-200 rounded-full h-4 mt-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                  {currentQuestionIndex + 1} / {questions.length}
                </span>
              </div>
              <div className="mt-6">
                <p className="text-lg font-semibold">
                  {currentQuestion.question}
                </p>
                <div className="mt-4 space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center justify-between w-full py-3 px-4 rounded-md border transition ${
                        selectedAnswer !== null &&
                        index === currentQuestion.correctAnswer
                          ? "bg-green-100 border-green-500"
                          : selectedAnswer !== null && index === selectedAnswer
                          ? "bg-red-100 border-red-500"
                          : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                      }`}
                      style={{
                        minWidth: "250px", // Ensures consistent width for each option
                        maxWidth: "100%", // Prevents the width from growing beyond the container
                      }}
                    >
                      <span>{option}</span>
                      <input
                        type="checkbox"
                        checked={selectedAnswer === index}
                        onChange={() =>
                          !showFeedback && handleAnswerSelect(index)
                        }
                        className="form-checkbox h-5 w-5 text-blue-600 rounded-full cursor-pointer"
                        disabled={showFeedback}
                      />
                    </label>
                  ))}
                </div>
                {showFeedback && (
                  <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md">
                    <p className="font-medium">{currentQuestion.explanation}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Tip: {currentQuestion.tip}
                    </p>
                    <button
                      onClick={handleNextQuestion}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      Next Question
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
      ;
    </>
  );
};

export default MockInterviewQuiz;
