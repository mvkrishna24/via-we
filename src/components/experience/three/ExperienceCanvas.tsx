"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { useExperience } from "../ExperienceContext";
import { Boardroom } from "./Boardroom";
import { CameraRig } from "./CameraRig";
import { HoloAvatar } from "./HoloAvatar";
import { ParticleField } from "./ParticleField";
import { pointerState } from "./pointer";

/**
 * The persistent 3D stage behind every scene. Mounted once; scenes
 * re-choreograph it instead of remounting it.
 */
export function ExperienceCanvas() {
  const { scene, reducedMotion } = useExperience();

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointerState.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerState.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className="absolute inset-0" aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 55, near: 0.1, far: 80, position: [0, 0, 12.5] }}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      >
        <CameraRig scene={scene} reducedMotion={reducedMotion} />
        <ParticleField scene={scene} reducedMotion={reducedMotion} />
        <HoloAvatar scene={scene} />
        <Boardroom scene={scene} />
      </Canvas>
      {/* cinematic vignette + bottom fade, in DOM for zero GPU cost */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,transparent_40%,rgba(3,8,14,0.72)_100%)]" />
    </div>
  );
}
