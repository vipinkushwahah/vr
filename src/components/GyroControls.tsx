import { useEffect } from "react";

const GyroControls = () => {
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const beta = event.beta || 0;
      const gamma = event.gamma || 0;
      // Smaller rotation multiplier
      document.body.style.transform = `rotateX(${beta * 0.01}deg) rotateY(${gamma * 0.01}deg)`;
    };

    window.addEventListener("deviceorientation", handleOrientation);

    // Add some CSS styles to avoid layout issues
    document.body.style.perspective = "1000px";
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      document.body.style.transform = "";
      document.body.style.perspective = "";
      document.body.style.overflow = "";
    };
  }, []);

  return null;
};

export default GyroControls;
