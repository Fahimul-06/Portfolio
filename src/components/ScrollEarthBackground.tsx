import { useEffect, useRef } from "react";

export function ScrollEarthBackground() {
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let frame = 0;

    const updateEarthMotion = () => {
      frame = 0;
      const stage = stageRef.current;
      if (!stage) return;

      const documentHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      );
      const maxScroll = Math.max(1, documentHeight - window.innerHeight);
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const progress = Math.min(1, Math.max(0, scrollY / maxScroll));

      const rotateY = -24 + progress * 270;
      const rotateZ = -10 + Math.sin(progress * Math.PI * 2) * 16;
      const shiftY = -24 + Math.sin(progress * Math.PI * 1.6) * 96;
      const shiftX = Math.cos(progress * Math.PI * 1.2) * 28;
      const scale = 1 + progress * 0.08;
      const mapShift = progress * 760;
      const cloudShift = progress * 980;

      stage.style.setProperty("--earth-rotate-y", `${rotateY}deg`);
      stage.style.setProperty("--earth-rotate-z", `${rotateZ}deg`);
      stage.style.setProperty("--earth-shift-y", `${shiftY}px`);
      stage.style.setProperty("--earth-shift-x", `${shiftX}px`);
      stage.style.setProperty("--earth-scale", `${scale}`);
      stage.style.setProperty("--earth-map-shift", `${mapShift}px`);
      stage.style.setProperty("--earth-cloud-shift", `${cloudShift}px`);
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateEarthMotion);
    };

    updateEarthMotion();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <div className="scroll-earth-background" aria-hidden="true">
      <div ref={stageRef} className="scroll-earth-stage">
        <div className="scroll-earth-sphere">
          <div className="scroll-earth-ocean" />
          <div className="scroll-earth-map" />
          <div className="scroll-earth-clouds" />
          <div className="scroll-earth-atmosphere" />
          <div className="scroll-earth-shine" />
        </div>
        <div className="scroll-earth-shadow" />
      </div>
      <div className="scroll-earth-stars" />
      <div className="scroll-earth-space-glow" />
    </div>
  );
}
