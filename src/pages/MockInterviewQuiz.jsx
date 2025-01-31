import { useEffect, useState } from "react";
import OpenAI from "openai";
import {
  Brain,
  CheckCircle2,
  ChevronRight,
  Award,
  AlertCircle,
} from "lucide-react";
import { jobRoles } from "../utils";
import Loader from "../components/Loader.jsx";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const MockInterviewQuiz = () => {
  const [selectedJobRole, setSelectedJobRole] = useState();
  const [otherJobRole, setOtherJobRole] = useState("");
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

  // Existing functions remain unchanged
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
            content: `Generate 10 multiple-choice mock interview questions for a ${
              selectedJobRole || otherJobRole
            }.
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
  }, [selectedJobRole || otherJobRole, uniqueId]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleModalSubmit = () => {
    if (!selectedJobRole && !otherJobRole) {
      alert("Please enter a job role");
      return;
    }
    if (value.length !== 3) {
      alert("Please enter a valid 3-digit unique ID");
      return;
    }
    setShowModal(false);
    setUniqueId(value);
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
      const url = `https://hireagent.app.n8n.cloud/webhook/91965100-fe7d-4fa2-a252-5f1560bd6694?uniqueId=${uniqueId}&score=${score}`;
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
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      {showModal && (
        <div className="fixed inset-0  backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-6">
              <Brain className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Welcome to Interview<span className="text-blue-600">Mate</span>{" "}
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Please enter your 3-digit Unique ID and select a job role to begin
            </p>

            {/* Job Role Selection Dropdown */}
            <select
              value={selectedJobRole}
              onChange={(e) => setSelectedJobRole(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-4 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose Your Job Role</option>

              {jobRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>

            {/* Manual Job Role Input (shown when "Other" is selected) */}
            {selectedJobRole === "Other" && (
              <input
                type="text"
                value={otherJobRole}
                onChange={(e) => setOtherJobRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-4 text-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your job role"
              />
            )}

            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-4 text-center text-2xl tracking-wider focus:ring-2 focus:ring-blue-500"
              maxLength="3"
              placeholder="123"
            />

            <button
              onClick={handleModalSubmit}
              className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              Start Interview
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : (
        <div className="container mx-auto px-4 py-8 relative z-10">
          {quizComplete ? (
            <div className="max-w-2xl mx-auto text-center bg-white p-12 rounded-3xl shadow-xl">
              <Award className="w-16 h-16 text-blue-600 mx-auto mb-6" />
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Congratulations!
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Your score will be sent to your Telegram ID.
              </p>
              <button
                onClick={resetQuiz}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transform transition-all duration-200 hover:scale-[1.02] focus:ring-4 focus:ring-blue-200"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-800">
                  {selectedJobRole || otherJobRole} Interview
                </h2>
                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  Question {currentQuestionIndex + 1}/{questions.length}
                </span>
              </div>

              <div className="relative w-full h-2 bg-blue-100 rounded-full mb-8">
                <div
                  className="absolute left-0 top-0 h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="space-y-8">
                <p className="text-xl font-semibold text-gray-800">
                  {currentQuestion.question}
                </p>

                <div className="space-y-4">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => !showFeedback && handleAnswerSelect(index)}
                      disabled={showFeedback}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between
                        ${
                          selectedAnswer === null
                            ? "border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                            : index === currentQuestion.correctAnswer
                            ? "border-green-500 bg-green-50"
                            : selectedAnswer === index
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 opacity-50"
                        }`}
                    >
                      <span className="text-lg">{option}</span>
                      {selectedAnswer !== null &&
                        index === currentQuestion.correctAnswer && (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        )}
                      {selectedAnswer === index &&
                        index !== currentQuestion.correctAnswer && (
                          <AlertCircle className="w-6 h-6 text-red-500" />
                        )}
                    </button>
                  ))}
                </div>

                {showFeedback && (
                  <div className="mt-8 space-y-6">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
                      <h3 className="font-semibold text-lg text-gray-800 mb-2">
                        Explanation
                      </h3>
                      <p className="text-gray-700">
                        {currentQuestion.explanation}
                      </p>
                      <div className="mt-4 flex items-start space-x-2">
                        <Brain className="w-5 h-5 text-blue-600 mt-1" />
                        <p className="text-blue-800">{currentQuestion.tip}</p>
                      </div>
                    </div>

                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transform transition-all duration-200 hover:scale-[1.02] focus:ring-4 focus:ring-blue-200 flex items-center justify-center space-x-2"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MockInterviewQuiz;
