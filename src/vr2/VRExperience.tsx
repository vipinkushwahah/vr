import { useEffect, useRef, useState } from "react";

// Background Camera Component
const VRCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(console.error);
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,
        width: "100vw",
        height: "100vh",
        objectFit: "cover",
      }}
    />
  );
};

// VR Viewer (single or split screen)
const VRViewer = ({ src, vrMode }: { src: string; vrMode: boolean }) => {
  const iframeStyle = (leftPercentage: number) => ({
    position: "absolute",
    top: "50%",
    left: `${leftPercentage}%`,
    transform: "translate(-50%, -50%)",
    width: "48vw",
    height: "55vh",
    border: "none",
    backgroundColor: "#000",
    zIndex: 2,
    borderRadius: "50px",
    overflow: "hidden",
    boxShadow: "inset 0 0 40px rgba(0,0,0,0.6), 0 0 20px rgba(0,0,0,0.8)",
  });

  if (vrMode) {
    return (
      <>
        <iframe
          src={src}
          title="Left Eye VR"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          style={iframeStyle(25) as React.CSSProperties}
        />
        <iframe
          src={src}
          title="Right Eye VR"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          style={iframeStyle(75) as React.CSSProperties}
        />
      </>
    );
  }

  return (
    <iframe
      src={src}
      title="Normal VR View"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowFullScreen
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "80vw",
        height: "60vh",
        borderRadius: "24px",
        boxShadow: "0 0 30px rgba(0,0,0,0.5)",
        zIndex: 2,
        backgroundColor: "#000",
        border: "none",
      }}
    />
  );
};

// Main VR Experience Component
const VRExperience = () => {
  const [inputValue, setInputValue] = useState("https://www.youtube.com/watch?v=PAq-1lCD_hA");
  const [url, setUrl] = useState("https://www.youtube.com/embed/PAq-1lCD_hA");
  const [error, setError] = useState("");
  const [vrMode, setVrMode] = useState(false);

  const transformUrl = (rawInput: string): string | null => {
    try {
      let input = rawInput.trim();
      if (!/^https?:\/\//.test(input)) {
        input = "https://" + input;
      }

      const parsed = new URL(input);

      if (parsed.hostname.includes("youtube.com") && parsed.searchParams.has("v")) {
        const videoId = parsed.searchParams.get("v");
        return `https://www.youtube.com/embed/${videoId}`;
      }

      if (parsed.hostname === "youtu.be") {
        const videoId = parsed.pathname.slice(1);
        return `https://www.youtube.com/embed/${videoId}`;
      }

      return parsed.toString();
    } catch {
      return null;
    }
  };

  const handleLoad = () => {
    const cleaned = transformUrl(inputValue);
    if (cleaned) {
      setUrl(cleaned);
      setError("");
    } else {
      setError("Please enter a valid URL (e.g., https://...)");
    }
  };

  return (
    <div>
      <VRCamera />
      <VRViewer src={url} vrMode={vrMode} />

      {/* Controls UI */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
          background: "rgba(255, 255, 255, 0.95)",
          padding: "10px 16px",
          borderRadius: "12px",
          boxShadow: "0 0 12px rgba(0,0,0,0.2)",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <input
          type="text"
          placeholder="Enter a video/page URL"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            width: "300px",
          }}
        />
        <button
          onClick={handleLoad}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "none",
            background: "#007BFF",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Load
        </button>
        <button
          onClick={() => setVrMode(!vrMode)}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "none",
            background: vrMode ? "#dc3545" : "#28a745",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {vrMode ? "Exit VR Mode" : "Enter VR Mode"}
        </button>
        {error && (
          <span style={{ color: "red", fontSize: "0.8rem", marginLeft: "10px" }}>
            {error}
          </span>
        )}
      </div>
    </div>
  );
};

export default VRExperience;
