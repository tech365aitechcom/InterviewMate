import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@play-ai/agent-web-sdk";
    script.type = "text/javascript";
    script.async = true;

    document.head.appendChild(script);

    script.onload = () => {
      if (window.PlayAI) {
        window.PlayAI.open("Nm0gMk5DZ-HSEQDWv8a_q");
      } else {
        console.error("PlayAI SDK not loaded");
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="app-container">
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading interview setup...</p>
        </div>
      ) : (
        <>
          <h1>Welcome to Your Interview Preparation</h1>
          <div id="playai-container">
            Tap the microphone to begin your interactive interview session.
          </div>
        </>
      )}
    </div>
  );
}

export default App;
