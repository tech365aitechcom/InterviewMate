import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AgentInterview from "./pages/AgentInterview.jsx";
import MockInterviewQuiz from "./pages/MockInterviewQuiz.jsx";

function App() {
  return (
    <div className="w-full container">
      <Router>
        <Routes>
          <Route path="/mock-interview/agent" element={<AgentInterview />} />
          <Route path="/mock-interview/quiz" element={<MockInterviewQuiz />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
