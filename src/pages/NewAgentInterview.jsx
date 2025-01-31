import { useState } from "react";
import Assistant from "../components/Assistant";

const NewAgentInterview = () => {
  const [showAssistant, setShowAssistant] = useState(false);

  const features = [
    {
      title: "Mock Interviews",
      description:
        "Practice with our AI interviewer in a realistic setting with industry-standard questions",
    },
    {
      title: "Instant Feedback",
      description:
        "Receive detailed analysis of your responses and body language in real-time",
    },
    {
      title: "Industry Specific",
      description:
        "Tailored questions for your target role and industry with expert recommendations",
    },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-12 flex flex-col items-center">
        <div className="text-center mb-12">
          <h1 className="mb-4 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
            Interview<span className="text-blue-600">Mate</span>
          </h1>

          <p className="mb-10 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Master your interview skills with our AI-powered practice platform.
            Get real-time feedback, personalized coaching, and boost your
            confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full px-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg w-full h-48 flex flex-col items-center justify-center"
            >
              <h2 className="text-xl font-semibold text-blue-600 mb-3">
                {feature.title}
              </h2>
              <p className="text-gray-600 text-center">{feature.description}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowAssistant(true)}
          className="cursor-pointer px-8 md:px-12 py-3 md:py-4 text-lg md:text-xl font-semibold text-white 
                   transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-700 
                   rounded-full hover:shadow-lg hover:scale-105 hover:from-blue-700 hover:to-blue-800"
        >
          Start Practice Interview
        </button>
      </div>

      {showAssistant && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl p-4">
            <Assistant id={"HR-Interview-nzWqld8SR9eaxdJOfLdQ3"} />
          </div>
        </div>
      )}
    </div>
  );
};

const style = document.createElement("style");
style.textContent = `
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
`;
document.head.appendChild(style);

export default NewAgentInterview;
