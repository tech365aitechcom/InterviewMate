import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MockInterviewQuiz from "./pages/MockInterviewQuiz.jsx";
import NewAgentInterview from "./pages/NewAgentInterview.jsx";

function App() {
  return (
    <div className="w-full">
      <Router>
        <Routes>
          <Route path="/mock-interview/agent" element={<NewAgentInterview />} />
          <Route path="/mock-interview/quiz" element={<MockInterviewQuiz />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
