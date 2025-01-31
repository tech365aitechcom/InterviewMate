import { useState, useEffect } from "react";

const Loader = () => {
  const [loadingMessage, setLoadingMessage] = useState("Loading questions");
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const messages = [
      "Loading questions",
      "Please be patient",
      "We are getting things ready",
      "Almost there",
    ];
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setLoadingMessage(messages[index]);
      setDots((prev) => (prev.length < 3 ? prev + "." : "."));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen flex-col">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
      <p className="text-lg font-bold text-gray-600">{loadingMessage + dots}</p>
    </div>
  );
};

export default Loader;
