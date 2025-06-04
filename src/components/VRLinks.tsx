const VRLinks = () => (
    <div style={{
      position: "absolute",
      top: "10%",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 3,
      display: "flex",
      gap: "12px",
      background: "rgba(255, 255, 255, 0.8)",
      padding: "10px 15px",
      borderRadius: "12px",
    }}>
      <button onClick={() => window.open("https://youtube.com", "_blank")}>YouTube</button>
      <button onClick={() => window.open("https://google.com", "_blank")}>Google</button>
      <button onClick={() => window.open("https://wikipedia.org", "_blank")}>Wiki</button>
    </div>
  );
  
  export default VRLinks;
  