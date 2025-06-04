import React, { useEffect, useRef, useState } from "react";

const VRVideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [isLocalFile, setIsLocalFile] = useState<boolean>(false);

  useEffect(() => {
    // Access mobile back camera
    const getCameraFeed = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cameraRef.current) {
          cameraRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access failed:", err);
      }
    };

    getCameraFeed();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setIsLocalFile(true);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoSrc(e.target.value);
    setIsLocalFile(false);
  };

  const isYouTubeLink = (url: string) => {
    return /youtube\.com|youtu\.be/.test(url);
  };

  // Helper to get YouTube video ID
  const getYouTubeID = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname.includes("youtu.be")) {
        return parsedUrl.pathname.slice(1);
      }
      return parsedUrl.searchParams.get("v");
    } catch {
      return null;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black m-0 p-0">
      {/* Camera background */}
      <video
        ref={cameraRef}
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        autoPlay
        playsInline
        muted
      />

      {/* UI inputs */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 p-2 bg-black/50 rounded-lg text-white space-y-2 text-center">
        <input
          type="url"
          placeholder="Enter video or YouTube URL"
          onChange={handleUrlChange}
          className="w-64 p-1 rounded"
        />
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="text-white"
        />
      </div>

      {/* Video player */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[60vw] h-[40vh] bg-black rounded-xl shadow-lg overflow-hidden flex items-center justify-center">
        {videoSrc ? (
          isYouTubeLink(videoSrc) && !isLocalFile ? (
            (() => {
              const videoId = getYouTubeID(videoSrc);
              return videoId ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <div className="text-white">Invalid YouTube URL</div>
              );
            })()
          ) : (
            <video
              ref={videoRef}
              src={videoSrc}
              controls
              autoPlay
              className="max-w-full max-h-full object-cover"
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            No video selected
          </div>
        )}
      </div>
    </div>
  );
};

export default VRVideoPlayer;
