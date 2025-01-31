import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MockInterviewQuiz from "./pages/MockInterviewQuiz.jsx";
import AgentInterview from "./pages/AgentInterview.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className="w-full">
      <Router>
        <Routes>
          <Route path="/mock-interview/agent" element={<AgentInterview />} />
          <Route path="/mock-interview/quiz" element={<MockInterviewQuiz />} />
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
