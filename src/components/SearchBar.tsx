import { useState } from "react";

const SearchBar = () => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, "_blank");
  };

  const handleVoice = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: SpeechRecognitionResult | any) => {
      const text = event.results[0][0].transcript;
      setQuery(text);
      handleSearch();
    };
    recognition.start();
  };

  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 5,
      background: "rgba(255,255,255,0.8)",
      padding: 10,
      borderRadius: 10,
      display: "flex",
      gap: 10,
    }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search in VR..."
        style={{ flex: 1, padding: 8, borderRadius: 5 }}
      />
      <button onClick={handleSearch}>Search</button>
      <button onClick={handleVoice}>🎤</button>
    </div>
  );
};

export default SearchBar;
