const VRVideo = () => (
    <iframe
      width="400"  // increased width
      height="405"  // increased height to keep 16:9 aspect ratio
      src="https://www.youtube.com/embed/PAq-1lCD_hA"
      title="VR YouTube"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        borderRadius: "12px",
        boxShadow: "0 0 30px rgba(0,0,0,0.5)",
        zIndex: 2,
      }}
    />
  );
  
  export default VRVideo;
  