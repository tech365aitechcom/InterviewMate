import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneOff, Clock } from "lucide-react";
import { toast } from "react-toastify";
import { RealTimeAudioPlayer } from "../services/RealTimeAudioPlayer";
import SoundWave from "./SoundWave";
import PropTypes from "prop-types";

const Assistant = ({ id }) => {
  const websocketRef = useRef();
  const soundBufferRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [user, setUser] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState("Connecting...");
  const durationIntervalRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userProfile");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser || {});
      } catch (error) {
        console.error("Failed to parse user profile from localStorage:", error);
        setUser({});
      }
    } else {
      setUser({});
    }
  }, []);

  useEffect(() => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      durationIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [websocketRef.current?.readyState]);

  useEffect(() => {
    if (isAISpeaking) {
      setStatus("AI is speaking...");
    } else if (isUserSpeaking) {
      setStatus("Listening to you...");
    } else {
      setStatus("Listening...");
    }
  }, [isAISpeaking, isUserSpeaking]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
  }, [isMuted]);

  const endCall = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    websocketRef.current?.close();
    soundBufferRef.current?.clearQueChunks();
    setShowModal(true);
  }, []);

  const onConnect = useCallback(() => {
    setStatus("Connected");
    const data = {
      event: "start",
      start: {
        user: {
          name: user.name,
        },
      },
    };
    websocketRef.current.send(JSON.stringify(data));
    setTimeout(() => sendStream(), 5000);
  }, [user]);

  const sendStream = async () => {
    console.log("start voice stream");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser does not support audio recording.");
      return;
    }

    streamRef.current = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        autoGainControl: true,
        noiseSuppression: true,
      },
    });

    const audioContext = new AudioContext();
    const audioSource = audioContext.createMediaStreamSource(streamRef.current);
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 512;
    analyzer.minDecibels = -75;
    analyzer.maxDecibels = -10;
    analyzer.smoothingTimeConstant = 0.5;
    audioSource.connect(analyzer);

    const audioData = new Uint8Array(analyzer.frequencyBinCount);
    const checkAudioLevel = () => {
      if (audioContext.state === "running") {
        analyzer.getByteFrequencyData(audioData);
        const audioLevel =
          audioData.reduce((acc, val) => acc + val, 0) / audioData.length;
        setIsUserSpeaking(audioLevel > 20);
        requestAnimationFrame(checkAudioLevel);
      }
    };
    checkAudioLevel();

    mediaRecorderRef.current = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current.ondataavailable = async (event) => {
      if (
        websocketRef.current &&
        websocketRef.current.readyState === WebSocket.OPEN
      ) {
        const blob = event.data;
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.readyState === 2) {
            const data = {
              event: "media",
              media: {
                payload: reader?.result?.split("base64,")[1],
              },
            };
            websocketRef.current.send(JSON.stringify(data));
          }
        };
        reader.readAsDataURL(blob);
      }
    };

    mediaRecorderRef.current.start(100);
  };

  useEffect(() => {
    if (!user) return;

    const ws = new WebSocket(
      `https://voicestaging.trainright.fit/play-ai?agent_id=${id}`
    );
    websocketRef.current = ws;
    soundBufferRef.current = new RealTimeAudioPlayer(setIsAISpeaking);

    ws.onopen = onConnect;
    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      switch (data.event) {
        case "media": {
          const base64Audio = data.media.payload;
          soundBufferRef.current.addAudioChunk(base64Audio);
          break;
        }
        case "clear": {
          soundBufferRef.current.clearQueChunks();
          break;
        }
        case "limit_reached": {
          toast.warning("Call limit reached - Maximum duration exceeded", {
            position: "top-right",
            autoClose: 5000,
          });
          endCall();
          break;
        }
      }
    };

    ws.onclose = () => {
      setStatus("Disconnected");
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };

    return () => {
      ws.close();
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [user, onConnect, endCall, id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
        <div className="flex flex-col md:w-[500px] h-fit bg-gradient-to-br from-indigo-200 via-blue-200 to-indigo-300 rounded-3xl shadow-2xl backdrop-blur-lg">
          <header className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-md shadow-md p-4 rounded-t-3xl">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-3xl font-bold text-indigo-700 tracking-wide">
                Interview <span className="text-indigo-500">Mate</span>
              </h1>
              <div className="flex items-center space-x-2">
                <Clock size={20} className="text-indigo-600" />
                <span className="text-indigo-600 font-medium">
                  {formatDuration(duration)}
                </span>
              </div>
            </div>
          </header>
          <main className="flex-1 container mx-auto p-6 flex flex-col items-center justify-center space-y-6">
            <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-md rounded-2xl shadow-xl p-8 flex flex-col items-center space-y-6 w-full max-w-2xl">
              <div
                className={`relative w-48 h-48 transition-all duration-500 ${
                  isAISpeaking ? "animate-pulse" : ""
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-300 to-blue-300 rounded-full opacity-60"></div>
                <div className="absolute inset-2 bg-white bg-opacity-70 rounded-full flex items-center justify-center shadow-lg">
                  <img
                    src="/bot.jpg"
                    alt="AI Assistant"
                    className="w-32 h-32 rounded-full"
                  />
                </div>
              </div>
              <h2 className="text-3xl font-semibold text-indigo-800">
                Your AI Assistant
              </h2>
              <div className="text-indigo-600 font-medium text-lg">
                {status}
              </div>
              <div className="w-full h-24 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-xl overflow-hidden grid place-items-center shadow-inner">
                <SoundWave isAnimating={isAISpeaking} />
              </div>
            </div>
          </main>
          <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-md shadow-lg p-4 rounded-b-3xl">
            <div className="container mx-auto flex justify-center items-center space-x-6">
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full shadow-lg transition-transform transform hover:scale-110 ${
                  isMuted
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gradient-to-br from-blue-200 to-indigo-300 text-gray-700"
                }`}
              >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              <button
                onClick={endCall}
                className="p-4 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-transform transform hover:scale-110"
              >
                <PhoneOff size={24} />
              </button>
            </div>
          </div>
        </div>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-md rounded-2xl shadow-xl p-8 w-96">
              <h2 className="text-lg font-semibold text-gray-800 text-center">
                Thanks for the call! Check your Telegram account for the
                results!
              </h2>
              <p className="text-center text-gray-600 mt-2">
                Call duration: {formatDuration(duration)}
              </p>
              <button
                onClick={() => {
                  setShowModal(false);
                  window.location.reload();
                }}
                className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-2 rounded-lg hover:bg-gradient-to-r hover:from-indigo-700 hover:to-blue-700 transition-transform transform hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

Assistant.propTypes = {
  id: PropTypes.string.isRequired,
};

export default Assistant;
