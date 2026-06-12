"use client";

import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { SceneId } from "../ExperienceContext";
import { pointerState } from "./pointer";

type Shot = { pos: [number, number, number]; look: [number, number, number] };

const SHOTS: Record<SceneId, Shot> = {
  arrival: { pos: [0, 0.3, 7.6], look: [0, 0.45, 0] },
  meet: { pos: [0.5, 0.1, 6.6], look: [0.5, 0.1, 0] },
  persona: { pos: [0, 0.15, 7.4], look: [0, 0, 0] },
  boardroom: { pos: [0, 0.5, 5.2], look: [0, -0.2, -3] },
  discovery: { pos: [0, 0.4, 6.2], look: [0, -0.1, -2] },
  summary: { pos: [0, 0.3, 6.6], look: [0, 0, -1] },
  ecosystem: { pos: [0, 0, 8.6], look: [0, 0, -1] },
  portfolio: { pos: [0, 0.2, 8.8], look: [0, 0, -2] },
  trust: { pos: [0, 0.2, 8.8], look: [0, 0, -2] },
  convert: { pos: [-0.4, 0, 6.6], look: [-0.4, 0, 0] },
};

export function CameraRig({
  scene,
  reducedMotion,
}: {
  scene: SceneId;
  reducedMotion: boolean;
}) {
  const { camera } = useThree();
  const target = useRef({
    pos: new THREE.Vector3(0, 0, 12.5),
    look: new THREE.Vector3(0, 0, 0),
  });
  const lookCurrent = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    const shot = SHOTS[scene];
    const dur = reducedMotion ? 0 : scene === "boardroom" ? 3.4 : 1.8;
    const ease = scene === "boardroom" ? "power2.inOut" : "power3.inOut";
    // the boardroom entrance is a true dolly: pull back high, then push through
    if (scene === "boardroom" && !reducedMotion) {
      gsap.fromTo(
        target.current.pos,
        { x: 0, y: 1.6, z: 11 },
        { x: shot.pos[0], y: shot.pos[1], z: shot.pos[2], duration: dur, ease },
      );
    } else {
      gsap.to(target.current.pos, {
        x: shot.pos[0],
        y: shot.pos[1],
        z: shot.pos[2],
        duration: dur,
        ease,
      });
    }
    gsap.to(target.current.look, {
      x: shot.look[0],
      y: shot.look[1],
      z: shot.look[2],
      duration: dur,
      ease,
    });
  }, [scene, reducedMotion]);

  useFrame((_, delta) => {
    const k = Math.min(1, delta * 3.2);
    const px = reducedMotion ? 0 : pointerState.x * 0.32;
    const py = reducedMotion ? 0 : pointerState.y * 0.18;
    camera.position.x += (target.current.pos.x + px - camera.position.x) * k;
    camera.position.y += (target.current.pos.y + py - camera.position.y) * k;
    camera.position.z += (target.current.pos.z - camera.position.z) * k;
    lookCurrent.current.lerp(target.current.look, k);
    camera.lookAt(lookCurrent.current);
  });

  return null;
}
