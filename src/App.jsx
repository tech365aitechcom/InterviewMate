import { useEffect } from "react";
import "./App.css";

function App() {
  useEffect(() => {
    // Dynamically create the script element
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@play-ai/agent-web-sdk";
    script.type = "text/javascript";
    script.async = true;

    // Append the script to the document head
    document.head.appendChild(script);

    // Execute the PlayAI function after the script loads
    script.onload = () => {
      if (window.PlayAI) {
        window.PlayAI.open("Nm0gMk5DZ-HSEQDWv8a_q");
      } else {
        console.error("PlayAI SDK not loaded");
      }
    };

    // Cleanup function to remove the script when the component unmounts
    return () => {
      document.head.removeChild(script);
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div>
      <h1>Welcome to Your Interview Preparation</h1>
      <div id="playai-container">
        Tap the microphone to begin your interactive interview session.
      </div>
    </div>
  );
}

export default App;
