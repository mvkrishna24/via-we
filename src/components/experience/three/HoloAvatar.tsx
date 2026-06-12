"use client";

import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { SceneId } from "../ExperienceContext";
import { pointerState } from "./pointer";
import { createGlowTexture } from "./textures";

/**
 * Vijay's holographic presence — a deliberately stylized executive
 * "digital twin" rendered in the brand's triangulated-mesh language
 * (the texture inside the logo's lower curve). Premium abstraction,
 * not a cartoon: suit silhouette, composed posture, eye contact via
 * subtle head tracking.
 */

const SCENE_PRESENCE: Partial<Record<SceneId, { p: number; x: number; scale: number }>> = {
  meet: { p: 1, x: 1.85, scale: 1 },
  persona: { p: 0.45, x: 2.9, scale: 0.82 },
  convert: { p: 1, x: -2.1, scale: 1 },
};

const fresnelMaterial = (color: string) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying float vFresnel;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec3 n = normalize(normalMatrix * normal);
        vec3 viewDir = normalize(-mv.xyz);
        vFresnel = pow(1.0 - abs(dot(n, viewDir)), 2.4);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uIntensity;
      varying float vFresnel;
      void main() {
        gl_FragColor = vec4(uColor, vFresnel * uIntensity);
      }
    `,
  });

export function HoloAvatar({ scene }: { scene: SceneId }) {
  const group = useRef<THREE.Group>(null);
  const headGroup = useRef<THREE.Group>(null);
  const scanRef = useRef<THREE.Mesh>(null);
  const presence = useRef({ value: 0 });
  const materials = useRef<{ mat: THREE.Material; base: number }[]>([]);
  const fresnels = useRef<THREE.ShaderMaterial[]>([]);

  const glowTex = useMemo(() => createGlowTexture(), []);

  const parts = useMemo(() => {
    const head = new THREE.SphereGeometry(0.33, 26, 22);
    head.scale(0.94, 1.14, 1.0);
    const neck = new THREE.CylinderGeometry(0.1, 0.14, 0.22, 14);
    const shoulders = new THREE.SphereGeometry(0.62, 30, 18, 0, Math.PI * 2, 0, Math.PI / 2);
    shoulders.scale(1.5, 1.0, 0.8);
    const torso = new THREE.CylinderGeometry(0.6, 0.7, 0.78, 26, 4);
    torso.scale(1.38, 1, 0.74);
    return { head, neck, shoulders, torso };
  }, []);

  const register = (mat: THREE.Material, base: number) => {
    mat.transparent = true;
    mat.opacity = 0;
    materials.current.push({ mat, base });
    return mat;
  };

  const built = useMemo(() => {
    materials.current = [];
    fresnels.current = [];

    const inner = (geo: THREE.BufferGeometry, y: number) => {
      const mesh = new THREE.Mesh(
        geo,
        register(new THREE.MeshBasicMaterial({ color: "#0a2138" }), 0.72),
      );
      mesh.position.y = y;
      mesh.renderOrder = 1;
      return mesh;
    };

    const wire = (geo: THREE.BufferGeometry, y: number, base: number) => {
      const seg = new THREE.LineSegments(
        new THREE.WireframeGeometry(geo),
        register(
          new THREE.LineBasicMaterial({
            color: "#4ad3f3",
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
          base,
        ),
      );
      seg.position.y = y;
      seg.renderOrder = 3;
      return seg;
    };

    const rim = (geo: THREE.BufferGeometry, y: number) => {
      const mat = fresnelMaterial("#3b8ec0");
      fresnels.current.push(mat);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.setScalar(1.035);
      mesh.position.y = y;
      mesh.renderOrder = 2;
      return mesh;
    };

    const headPivot = new THREE.Group();
    headPivot.position.y = 1.06;
    headPivot.add(inner(parts.head, 0), wire(parts.head, 0, 0.16), rim(parts.head, 0));

    const body = new THREE.Group();
    body.add(
      inner(parts.neck, 0.82),
      inner(parts.shoulders, 0.42),
      inner(parts.torso, 0.06),
      wire(parts.shoulders, 0.42, 0.1),
      wire(parts.torso, 0.06, 0.08),
      rim(parts.shoulders, 0.42),
    );

    // tie: single cyan keyline giving the suit its focal point
    const tie = new THREE.Mesh(
      new THREE.PlaneGeometry(0.07, 0.46),
      register(
        new THREE.MeshBasicMaterial({
          color: "#4ad3f3",
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
        0.55,
      ),
    );
    tie.position.set(0, 0.52, 0.52);
    body.add(tie);

    return { headPivot, body };
  }, [parts]);

  useEffect(() => {
    const conf = SCENE_PRESENCE[scene];
    const target = conf?.p ?? 0;
    gsap.to(presence.current, { value: target, duration: 1.1, ease: "power2.inOut" });
    if (group.current && conf) {
      gsap.to(group.current.position, { x: conf.x, duration: 1.3, ease: "power3.inOut" });
      gsap.to(group.current.scale, {
        x: conf.scale,
        y: conf.scale,
        z: conf.scale,
        duration: 1.3,
        ease: "power3.inOut",
      });
    }
  }, [scene]);

  useFrame((state, delta) => {
    const p = presence.current.value;
    if (!group.current) return;
    group.current.visible = p > 0.02;
    if (!group.current.visible) return;

    for (const { mat, base } of materials.current) mat.opacity = base * p;
    for (const m of fresnels.current) m.uniforms.uIntensity.value = p * 0.9;

    const t = state.clock.elapsedTime;
    // composed breathing
    const breathe = 1 + Math.sin(t * 1.05) * 0.0055;
    built.body.scale.y = breathe;
    // eye contact: the head quietly follows the visitor's cursor
    if (headGroup.current) {
      const targetY = THREE.MathUtils.clamp(pointerState.x * 0.42, -0.32, 0.32);
      const targetX = THREE.MathUtils.clamp(-pointerState.y * 0.2, -0.14, 0.18);
      headGroup.current.rotation.y += (targetY - headGroup.current.rotation.y) * Math.min(1, delta * 4);
      headGroup.current.rotation.x += (targetX - headGroup.current.rotation.x) * Math.min(1, delta * 4);
    }
    // scan beam sweep
    if (scanRef.current) {
      const cycle = (t * 0.32) % 1;
      scanRef.current.position.y = -0.55 + cycle * 2.1;
      (scanRef.current.material as THREE.MeshBasicMaterial).opacity =
        Math.sin(cycle * Math.PI) * 0.3 * p;
    }
    group.current.position.y = -0.55 + Math.sin(t * 0.8) * 0.025;
  });

  return (
    <group ref={group} position={[1.85, -0.55, 1.2]} visible={false}>
      <group ref={headGroup}>
        <primitive object={built.headPivot} />
      </group>
      <primitive object={built.body} />

      {/* projection base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.62, 0]}>
        <ringGeometry args={[0.78, 0.8, 64]} />
        <meshBasicMaterial
          color="#4ad3f3"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          ref={(m) => {
            if (m && !materials.current.some((e) => e.mat === m)) materials.current.push({ mat: m, base: 0.5 });
          }}
        />
      </mesh>
      <sprite position={[0, -0.6, 0]} scale={[2.6, 1.1, 1]}>
        <spriteMaterial
          map={glowTex}
          color="#1b4b77"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          ref={(m) => {
            if (m && !materials.current.some((e) => e.mat === m)) materials.current.push({ mat: m, base: 0.55 });
          }}
        />
      </sprite>

      {/* hologram scan beam */}
      <mesh ref={scanRef} position={[0, 0.4, 0.3]}>
        <planeGeometry args={[2.0, 0.045]} />
        <meshBasicMaterial
          color="#4ad3f3"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
