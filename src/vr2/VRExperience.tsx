/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";

// Camera Background
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

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT: any;
  }
}

type PlayerType = "youtube" | "vimeo" | "other";

const detectPlayerType = (url: string): PlayerType => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com") || parsed.hostname === "youtu.be") {
      return "youtube";
    }
    if (parsed.hostname.includes("vimeo.com")) {
      return "vimeo";
    }
    return "other";
  } catch {
    return "other";
  }
};

const VRViewer = ({ src, vrMode }: { src: string; vrMode: boolean }) => {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const players = useRef<{ left: any; right: any }>({ left: null, right: null });
  const syncFlag = useRef(false); // prevent infinite loop when syncing
  const syncInterval = useRef<number | null>(null);

  const playerType = detectPlayerType(src);

  useEffect(() => {
    if (playerType === "youtube" && !window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  }, [playerType]);

  // Sync function to keep players in sync
  const syncPlayers = async () => {
    if (syncFlag.current) return;
    if (!players.current.left || !players.current.right) return;

    syncFlag.current = true;

    try {
      if (playerType === "youtube") {
        const leftTime = players.current.left.getCurrentTime();
        const rightTime = players.current.right.getCurrentTime();

        const leftState = players.current.left.getPlayerState();
        const rightState = players.current.right.getPlayerState();

        // Mute right player to avoid double audio
        players.current.right.mute();
        players.current.left.unMute();

        // Play/pause sync: if one is playing, play the other, if one paused, pause the other
        if (leftState === window.YT.PlayerState.PLAYING && rightState !== window.YT.PlayerState.PLAYING) {
          players.current.right.playVideo();
        } else if (leftState !== window.YT.PlayerState.PLAYING && rightState === window.YT.PlayerState.PLAYING) {
          players.current.left.pauseVideo();
        }

        // Sync time if difference > threshold (0.3s)
        if (Math.abs(leftTime - rightTime) > 0.3) {
          // Seek the lagging player forward or backward smoothly
          if (leftTime > rightTime) {
            players.current.right.seekTo(leftTime, true);
          } else {
            players.current.left.seekTo(rightTime, true);
          }
        }
      } else if (playerType === "vimeo") {
        const leftTime = await players.current.left.getCurrentTime();
        const rightTime = await players.current.right.getCurrentTime();

        const leftPaused = await players.current.left.getPaused();
        const rightPaused = await players.current.right.getPaused();

        // Mute right player to avoid double audio
        players.current.right.setVolume(0);
        players.current.left.setVolume(1);

        // Play/pause sync
        if (!leftPaused && rightPaused) {
          players.current.right.play();
        } else if (leftPaused && !rightPaused) {
          players.current.left.pause();
        }

        // Sync time if difference > threshold (0.3s)
        if (Math.abs(leftTime - rightTime) > 0.3) {
          if (leftTime > rightTime) {
            players.current.right.setCurrentTime(leftTime).catch(() => {});
          } else {
            players.current.left.setCurrentTime(rightTime).catch(() => {});
          }
        }
      }
    } catch (e) {
      // Ignore errors (like players not ready)
    }

    setTimeout(() => {
      syncFlag.current = false;
    }, 100);
  };

  useEffect(() => {
    if (!vrMode) {
      if (syncInterval.current) {
        clearInterval(syncInterval.current);
        syncInterval.current = null;
      }
      players.current.left?.destroy?.();
      players.current.right?.destroy?.();
      players.current.left = null;
      players.current.right = null;
      return;
    }

    if (playerType === "youtube") {
      const onAPIReady = () => {
        if (!leftRef.current || !rightRef.current) return;

        players.current.left?.destroy?.();
        players.current.right?.destroy?.();

        const vidMatch = src.match(/embed\/([^?&]+)/);
        const videoId = vidMatch ? vidMatch[1] : null;
        if (!videoId) return;

        players.current.left = new window.YT.Player(leftRef.current, {
          videoId,
          playerVars: { autoplay: 0, controls: 1, modestbranding: 1, rel: 0, enablejsapi: 1 },
          events: {},
        });

        players.current.right = new window.YT.Player(rightRef.current, {
          videoId,
          playerVars: { autoplay: 0, controls: 1, modestbranding: 1, rel: 0, enablejsapi: 1 },
          events: {},
        });

        // Start periodic sync once players are ready
        const checkReady = setInterval(() => {
          if (
            players.current.left &&
            players.current.right &&
            players.current.left.getPlayerState &&
            players.current.right.getPlayerState
          ) {
            clearInterval(checkReady);
            // Start syncing every 200ms
            if (syncInterval.current) clearInterval(syncInterval.current);
            syncInterval.current = window.setInterval(syncPlayers, 200);
          }
        }, 100);
      };

      if (window.YT && window.YT.Player) {
        onAPIReady();
      } else {
        window.onYouTubeIframeAPIReady = onAPIReady;
      }
    } else if (playerType === "vimeo") {
      const loadVimeoScript = () =>
        new Promise<void>((resolve) => {
          if ((window as any).Vimeo) {
            resolve();
            return;
          }
          const tag = document.createElement("script");
          tag.src = "https://player.vimeo.com/api/player.js";
          tag.onload = () => resolve();
          document.body.appendChild(tag);
        });

      loadVimeoScript().then(() => {
        const VimeoPlayer = (window as any).Vimeo.Player;
        if (!leftRef.current || !rightRef.current) return;

        players.current.left?.unload?.();
        players.current.right?.unload?.();

        players.current.left = new VimeoPlayer(leftRef.current, {
          url: src,
          autoplay: false,
          controls: true,
        });
        players.current.right = new VimeoPlayer(rightRef.current, {
          url: src,
          autoplay: false,
          controls: true,
        });

        // Start periodic sync for Vimeo
        if (syncInterval.current) clearInterval(syncInterval.current);
        syncInterval.current = window.setInterval(syncPlayers, 200);
      });
    }

    return () => {
      if (syncInterval.current) {
        clearInterval(syncInterval.current);
        syncInterval.current = null;
      }
      players.current.left?.destroy?.();
      players.current.right?.destroy?.();
      players.current.left = null;
      players.current.right = null;
    };
  }, [src, vrMode]);

  const iframeStyle = (left: number) => ({
    position: "absolute" as const,
    top: "50%",
    left: `${left}%`,
    transform: "translate(-50%, -50%) scale(0.85)",
    width: "42vw",
    height: "50vh",
    border: "none",
    borderRadius: "24px",
    backgroundColor: "#000",
    zIndex: 2,
    boxShadow: "0 0 25px rgba(0,0,0,0.6)",
  });

  const singleStyle = {
    ...iframeStyle(50),
    width: "70vw",
    height: "55vh",
    transform: "translate(-50%, -50%) scale(0.95)",
  };

  if (!vrMode) {
    return (
      <iframe
        src={src}
        title="Browser View"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        style={singleStyle}
      />
    );
  }

  if (playerType === "youtube" || playerType === "vimeo") {
    return (
      <>
        <div id="leftPlayer" ref={leftRef} style={iframeStyle(25)} />
        <div id="rightPlayer" ref={rightRef} style={iframeStyle(75)} />
      </>
    );
  }

  // Fallback: just iframes side by side (no sync)
  return (
    <>
      <iframe
        src={src}
        title="Left Eye"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        style={iframeStyle(25)}
      />
      <iframe
        src={src}
        title="Right Eye"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        style={iframeStyle(75)}
      />
    </>
  );
};

const BrowserVRExperience = () => {
  const [inputValue, setInputValue] = useState("https://www.youtube.com/watch?v=PAq-1lCD_hA");
  const [url, setUrl] = useState("https://www.youtube.com/embed/PAq-1lCD_hA?enablejsapi=1");
  const [error, setError] = useState("");
  const [vrMode, setVrMode] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const transformUrl = (raw: string): string | null => {
    try {
      let input = raw.trim();
      if (!/^https?:\/\//i.test(input)) input = "https://" + input;

      const parsed = new URL(input);

      if (parsed.hostname.includes("youtube.com") && parsed.searchParams.has("v")) {
        const id = parsed.searchParams.get("v");
        return `https://www.youtube.com/embed/${id}?enablejsapi=1`;
      }

      if (parsed.hostname === "youtu.be") {
        const id = parsed.pathname.slice(1);
        return `https://www.youtube.com/embed/${id}?enablejsapi=1`;
      }

      if (parsed.hostname.includes("vimeo.com")) {
        return input;
      }

      return input;
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
      setError("Invalid URL. Please use a proper video/page link.");
    }
  };

  return (
    <div>
      <VRCamera />
      <VRViewer src={url} vrMode={vrMode} />

      {vrMode && (
        <div
          onClick={() => setShowControls(!showControls)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 1,
            background: "transparent",
          }}
        />
      )}

      {showControls && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 3,
            background: "rgba(255, 255, 255, 0.95)",
            padding: "12px 16px",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter video or webpage URL"
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
              background: "#007bff",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Load
          </button>
          <button
            onClick={() => {
              setVrMode(!vrMode);
              if (!vrMode) setShowControls(false);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              background: vrMode ? "#dc3545" : "#28a745",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            {vrMode ? "Exit VR Mode" : "Enter VR Mode"}
          </button>
          {error && (
            <span style={{ color: "red", fontSize: "0.8rem" }}>{error}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default BrowserVRExperience;
