"use client";

import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import logoPoints from "@/data/logo-points.json";
import type { SceneId } from "../ExperienceContext";
import { pointerState } from "./pointer";

/**
 * One persistent particle system carries the whole experience.
 * 9,000 points sampled from the real Via-We logo morph between
 * formations as the visitor moves through the scenes.
 */

type Formation =
  | "logo"
  | "field"
  | "halo"
  | "rings"
  | "wave"
  | "sphere";

const SCENE_FORMATION: Record<SceneId, Formation> = {
  arrival: "logo",
  meet: "halo",
  persona: "sphere",
  boardroom: "field",
  discovery: "field",
  summary: "sphere",
  ecosystem: "rings",
  portfolio: "wave",
  trust: "wave",
  convert: "logo",
};

const SCENE_OPACITY: Record<SceneId, number> = {
  arrival: 0.66,
  meet: 0.4,
  persona: 0.42,
  boardroom: 0.3,
  discovery: 0.24,
  summary: 0.45,
  ecosystem: 0.6,
  portfolio: 0.3,
  trust: 0.3,
  convert: 0.42,
};

const SCENE_DRIFT: Record<SceneId, number> = {
  arrival: 0.012,
  meet: 0.05,
  persona: 0.05,
  boardroom: 0.1,
  discovery: 0.09,
  summary: 0.035,
  ecosystem: 0.03,
  portfolio: 0.07,
  trust: 0.07,
  convert: 0.014,
};

const vertexShader = /* glsl */ `
  attribute float aShade;
  attribute float aSize;
  attribute float aSeed;
  uniform float uTime;
  uniform float uDrift;
  uniform float uPixelRatio;
  uniform vec2 uPointer;
  varying float vShade;
  varying float vTwinkle;

  void main() {
    vec3 pos = position;
    float dr = uTime * 0.55 + aSeed * 6.2831;
    pos += vec3(
      sin(dr + pos.y * 1.9),
      cos(dr * 0.83 + pos.x * 1.4),
      sin(dr * 0.61 + pos.z * 1.1)
    ) * uDrift;

    // gentle repulsion around the cursor (world space, z near 0)
    vec2 d = pos.xy - uPointer;
    float dist = length(d);
    float force = smoothstep(1.1, 0.0, dist);
    pos.xy += normalize(d + 0.0001) * force * 0.38;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(aSize * uPixelRatio * (120.0 / -mv.z), 1.0, 20.0);
    vShade = aShade;
    vTwinkle = 0.75 + 0.25 * sin(uTime * (1.2 + aSeed) + aSeed * 12.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorLight;
  uniform vec3 uColorMid;
  uniform vec3 uColorDeep;
  uniform float uOpacity;
  varying float vShade;
  varying float vTwinkle;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float disc = smoothstep(0.5, 0.06, d);
    vec3 col = vShade < 0.5 ? uColorLight : (vShade < 1.5 ? uColorMid : uColorDeep);
    col *= 1.0 + (0.5 - d) * 0.9;
    gl_FragColor = vec4(col, disc * uOpacity * vTwinkle);
  }
`;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function ParticleField({
  scene,
  reducedMotion,
}: {
  scene: SceneId;
  reducedMotion: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const transition = useRef({ t: 1 });
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const count = useMemo(() => {
    if (typeof window === "undefined") return 9000;
    const small = window.innerWidth < 768;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    return small || (mem !== undefined && mem <= 4) ? 4500 : 9000;
  }, []);

  const data = useMemo(() => {
    const raw = logoPoints as { positions: number[]; shades: number[] };
    const total = raw.shades.length;
    const stride = Math.max(1, Math.floor(total / count));
    const idx: number[] = [];
    for (let i = 0; i < total && idx.length < count; i += stride) idx.push(i);
    const n = idx.length;

    const seeds = new Float32Array(n);
    const sizes = new Float32Array(n);
    const shades = new Float32Array(n);
    const stagger = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      seeds[i] = Math.random();
      stagger[i] = Math.random();
      sizes[i] = 0.5 + Math.random() * 0.85;
      shades[i] = raw.shades[idx[i]];
    }

    const make = () => new Float32Array(n * 3) as Float32Array<ArrayBuffer>;

    const logo = make();
    // fit the mark to the viewport: world width visible at the arrival
    // camera is ~7.9 * aspect, keep the mark inside ~80% of it
    const aspect =
      typeof window === "undefined" ? 1.6 : window.innerWidth / window.innerHeight;
    const S = Math.min(2.2, 7.9 * aspect * 0.4);
    const yOff = aspect < 0.9 ? 1.35 : 0.85;
    for (let i = 0; i < n; i++) {
      logo[i * 3] = raw.positions[idx[i] * 2] * S;
      logo[i * 3 + 1] = raw.positions[idx[i] * 2 + 1] * S + yOff;
      logo[i * 3 + 2] = (Math.random() - 0.5) * 0.22;
    }

    const field = make();
    for (let i = 0; i < n; i++) {
      field[i * 3] = (Math.random() - 0.5) * 16;
      field[i * 3 + 1] = (Math.random() - 0.5) * 9;
      field[i * 3 + 2] = -1 - Math.random() * 7;
    }

    // halo: a wide elliptical aura wrapping the consultant's position
    const halo = make();
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 2.7 + Math.random() * 1.8 * Math.random();
      halo[i * 3] = 1.7 + Math.cos(a) * r * 1.2;
      halo[i * 3 + 1] = 0.3 + Math.sin(a) * r * 0.7;
      halo[i * 3 + 2] = -1.6 - Math.random() * 2.6;
    }

    // rings: three tilted orbital paths — the service ecosystem
    const rings = make();
    for (let i = 0; i < n; i++) {
      const ring = i % 3;
      const radius = 2.1 + ring * 1.05;
      const a = Math.random() * Math.PI * 2;
      const tilt = [0.5, -0.35, 0.18][ring];
      const x = Math.cos(a) * radius;
      const y = Math.sin(a) * radius;
      rings[i * 3] = x;
      rings[i * 3 + 1] = y * Math.cos(tilt) * 0.62;
      rings[i * 3 + 2] = y * Math.sin(tilt) - 1.5;
    }

    const wave = make();
    const cols = Math.ceil(Math.sqrt(n * 2));
    for (let i = 0; i < n; i++) {
      const gx = (i % cols) / cols - 0.5;
      const gy = Math.floor(i / cols) / (n / cols) - 0.5;
      wave[i * 3] = gx * 18;
      wave[i * 3 + 1] = gy * 7 + Math.sin(gx * 9) * 0.6;
      wave[i * 3 + 2] = -3.5 - Math.random() * 2;
    }

    const sphere = make();
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const theta = golden * i;
      const R = 2.35;
      sphere[i * 3] = Math.cos(theta) * rad * R;
      sphere[i * 3 + 1] = y * R * 0.8;
      sphere[i * 3 + 2] = Math.sin(theta) * rad * R - 1.2;
    }

    const formations: Record<Formation, Float32Array<ArrayBuffer>> = {
      logo,
      field,
      halo,
      rings,
      wave,
      sphere,
    };

    return {
      n,
      seeds,
      sizes,
      shades,
      stagger,
      formations,
      positions: logo.slice() as Float32Array<ArrayBuffer>,
      from: logo.slice() as Float32Array<ArrayBuffer>,
      to: logo,
    };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDrift: { value: SCENE_DRIFT.arrival },
      uOpacity: { value: 0 },
      uPixelRatio: { value: 1 },
      uPointer: { value: new THREE.Vector2(99, 99) },
      uColorLight: { value: new THREE.Color("#4ad3f3") },
      uColorMid: { value: new THREE.Color("#3b8ec0") },
      uColorDeep: { value: new THREE.Color("#1f5d92") },
    }),
    [],
  );

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));
    g.setAttribute("aShade", new THREE.BufferAttribute(data.shades, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(data.sizes, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(data.seeds, 1));
    return g;
  }, [data]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [uniforms],
  );

  // initial assembly: scatter wide, then converge into the logo
  useEffect(() => {
    const pos = data.positions;
    const from = data.from;
    for (let i = 0; i < data.n * 3; i += 3) {
      from[i] = (Math.random() - 0.5) * 22;
      from[i + 1] = (Math.random() - 0.5) * 14;
      from[i + 2] = -4 + Math.random() * 6;
    }
    pos.set(from);
    runTransition("logo", reducedMotion ? 0.001 : 3.2, 0.4);
    gsap.to(uniforms.uOpacity, { value: 1, duration: 1.4, ease: "power2.out" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function runTransition(formation: Formation, duration: number, delay = 0) {
    const geo = pointsRef.current?.geometry;
    const target = data.formations[formation];
    tweenRef.current?.kill();
    data.from.set(data.positions);
    data.to = target;
    transition.current.t = 0;
    tweenRef.current = gsap.to(transition.current, {
      t: 1,
      duration,
      delay,
      ease: "none",
      onUpdate: () => {
        const T = transition.current.t;
        const { from, to, positions, stagger, n } = data;
        for (let i = 0; i < n; i++) {
          const s = stagger[i] * 0.4;
          const t = easeOutCubic(Math.min(1, Math.max(0, (T - s) / 0.6)));
          positions[i * 3] = from[i * 3] + (to[i * 3] - from[i * 3]) * t;
          positions[i * 3 + 1] = from[i * 3 + 1] + (to[i * 3 + 1] - from[i * 3 + 1]) * t;
          positions[i * 3 + 2] = from[i * 3 + 2] + (to[i * 3 + 2] - from[i * 3 + 2]) * t;
        }
        if (geo) geo.attributes.position.needsUpdate = true;
      },
    });
  }

  const prevScene = useRef<SceneId>("arrival");
  useEffect(() => {
    if (prevScene.current === scene) return;
    const prevFormation = SCENE_FORMATION[prevScene.current];
    prevScene.current = scene;
    const formation = SCENE_FORMATION[scene];
    if (formation !== prevFormation) {
      runTransition(formation, reducedMotion ? 0.001 : 1.9);
    }
    gsap.to(uniforms.uOpacity, { value: SCENE_OPACITY[scene], duration: 1.2, ease: "power2.inOut" });
    gsap.to(uniforms.uDrift, { value: SCENE_DRIFT[scene], duration: 1.6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, reducedMotion]);

  useFrame((state, delta) => {
    uniforms.uTime.value += delta;
    uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    // pointer in world units at z≈0 given camera distance
    const v = state.viewport.getCurrentViewport(state.camera, new THREE.Vector3(0, 0, 0));
    uniforms.uPointer.value.set(
      (pointerState.x * v.width) / 2,
      (pointerState.y * v.height) / 2,
    );
    if (pointsRef.current && SCENE_FORMATION[prevScene.current] === "rings") {
      pointsRef.current.rotation.z += delta * 0.05;
    } else if (pointsRef.current) {
      pointsRef.current.rotation.z *= 1 - Math.min(1, delta * 2);
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />;
}
