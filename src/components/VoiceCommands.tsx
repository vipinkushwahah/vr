import { useEffect } from "react";

const VoiceCommands = () => {
  useEffect(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log("Voice command:", transcript);

      if (transcript.includes("search for")) {
        const q = transcript.replace("search for", "").trim();
        window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, "_blank");
      } else if (transcript.includes("open youtube")) {
        window.open("https://youtube.com", "_blank");
      } else if (transcript.includes("open wikipedia")) {
        window.open("https://wikipedia.org", "_blank");
      } else if (transcript.includes("reload")) {
        window.location.reload();
      }
    };

    recognition.onerror = console.error;
    recognition.start();

    return () => recognition.stop();
  }, []);

  return null;
};

export default VoiceCommands;
