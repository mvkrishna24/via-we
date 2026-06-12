"use client";

import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { SceneId } from "../ExperienceContext";
import { pointerState } from "./pointer";
import { createGlowTexture } from "./textures";

/**
 * Vijay's holographic identity — executive digital twin with identifiable
 * physical traits: wider square jaw, styled medium hair, short full beard,
 * 3-piece suit silhouette with lapels and vest. Triangulated-mesh language,
 * brand cyan palette, cursor-tracked head.
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
    // Face — wider and squarer than a generic sphere (Vijay's strong jaw structure)
    const head = new THREE.SphereGeometry(0.33, 28, 22);
    head.scale(1.04, 1.07, 0.94);

    // Hair — medium-length styled cap; upper hemisphere, flattened so it reads
    // as a close crop rather than a tall dome
    const hair = new THREE.SphereGeometry(0.365, 26, 18, 0, Math.PI * 2, 0, Math.PI * 0.5);
    hair.scale(1.05, 0.7, 1.01);

    // Beard — flattened sphere around the lower face / jaw (short full beard)
    const beard = new THREE.SphereGeometry(0.3, 22, 14);
    beard.scale(1.04, 0.44, 0.9);

    const neck = new THREE.CylinderGeometry(0.12, 0.16, 0.22, 14);

    // Broader shoulders — the 3-piece suit reads wider than a casual silhouette
    const shoulders = new THREE.SphereGeometry(0.62, 30, 18, 0, Math.PI * 2, 0, Math.PI / 2);
    shoulders.scale(1.6, 1.0, 0.82);

    const torso = new THREE.CylinderGeometry(0.6, 0.7, 0.78, 28, 4);
    torso.scale(1.42, 1, 0.76);

    return { head, hair, beard, neck, shoulders, torso };
  }, []);

  const register = (mat: THREE.Material, base: number) => {
    mat.transparent = true;
    (mat as THREE.MeshBasicMaterial).opacity = 0;
    materials.current.push({ mat, base });
    return mat;
  };

  const built = useMemo(() => {
    materials.current = [];
    fresnels.current = [];

    const inner = (geo: THREE.BufferGeometry, y: number, color = "#0a2138") => {
      const mesh = new THREE.Mesh(
        geo,
        register(new THREE.MeshBasicMaterial({ color }), 0.72),
      );
      mesh.position.y = y;
      mesh.renderOrder = 1;
      return mesh;
    };

    const wire = (
      geo: THREE.BufferGeometry,
      y: number,
      base: number,
      color = "#4ad3f3",
    ) => {
      const seg = new THREE.LineSegments(
        new THREE.WireframeGeometry(geo),
        register(
          new THREE.LineBasicMaterial({
            color,
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

    // ── Head pivot ──────────────────────────────────────────────────────────
    const headPivot = new THREE.Group();
    headPivot.position.y = 1.06;

    // Base face
    headPivot.add(inner(parts.head, 0), wire(parts.head, 0, 0.16), rim(parts.head, 0));

    // Hair cap — darker fill + sparser cyan lines so it reads as textured hair
    const hairFill = new THREE.Mesh(
      parts.hair,
      register(new THREE.MeshBasicMaterial({ color: "#071a2c" }), 0.9),
    );
    hairFill.position.y = 0.17;
    hairFill.renderOrder = 4;

    const hairWire = new THREE.LineSegments(
      new THREE.WireframeGeometry(parts.hair),
      register(
        new THREE.LineBasicMaterial({
          color: "#28a2c8",
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
        0.2,
      ),
    );
    hairWire.position.y = 0.17;
    hairWire.renderOrder = 5;

    headPivot.add(hairFill, hairWire);

    // Beard — slightly brighter wireframe to differentiate from face mesh
    const beardFill = new THREE.Mesh(
      parts.beard,
      register(new THREE.MeshBasicMaterial({ color: "#0e2840" }), 0.74),
    );
    beardFill.position.y = -0.22;
    beardFill.renderOrder = 4;

    const beardWire = new THREE.LineSegments(
      new THREE.WireframeGeometry(parts.beard),
      register(
        new THREE.LineBasicMaterial({
          color: "#3ecde8",
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
        0.34,
      ),
    );
    beardWire.position.y = -0.22;
    beardWire.renderOrder = 5;

    headPivot.add(beardFill, beardWire);

    // ── Body ─────────────────────────────────────────────────────────────────
    const body = new THREE.Group();
    body.add(
      inner(parts.neck, 0.82),
      inner(parts.shoulders, 0.42),
      inner(parts.torso, 0.06),
      wire(parts.shoulders, 0.42, 0.1),
      wire(parts.torso, 0.06, 0.08),
      rim(parts.shoulders, 0.42),
    );

    // Suit lapels — V-shape that distinguishes a jacket from a plain torso
    const makeLapel = (side: number) => {
      const geo = new THREE.PlaneGeometry(0.13, 0.36, 2, 3);
      const mesh = new THREE.Mesh(
        geo,
        register(
          new THREE.MeshBasicMaterial({
            color: "#4ad3f3",
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
          }),
          0.22,
        ),
      );
      mesh.position.set(side * 0.17, 0.67, 0.5);
      mesh.rotation.z = side * -0.38;
      mesh.renderOrder = 4;
      return mesh;
    };
    body.add(makeLapel(-1), makeLapel(1));

    // Vest centre panel — the middle layer visible in a 3-piece suit
    const vestPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(0.058, 0.48),
      register(
        new THREE.MeshBasicMaterial({
          color: "#4ad3f3",
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
        0.3,
      ),
    );
    vestPanel.position.set(0, 0.5, 0.52);
    body.add(vestPanel);

    // Tie keyline — focal cyan accent
    const tie = new THREE.Mesh(
      new THREE.PlaneGeometry(0.068, 0.36),
      register(
        new THREE.MeshBasicMaterial({
          color: "#4ad3f3",
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
        0.55,
      ),
    );
    tie.position.set(0, 0.46, 0.535);
    body.add(tie);

    // Suit buttons — 3 glowing dots confirming the vest/jacket layer
    for (let i = 0; i < 3; i++) {
      const btn = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 8, 6),
        register(
          new THREE.MeshBasicMaterial({
            color: "#4ad3f3",
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
          0.7,
        ),
      );
      btn.position.set(0, 0.63 - i * 0.17, 0.525);
      btn.renderOrder = 5;
      body.add(btn);
    }

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

    for (const { mat, base } of materials.current) (mat as THREE.MeshBasicMaterial).opacity = base * p;
    for (const m of fresnels.current) m.uniforms.uIntensity.value = p * 0.9;

    const t = state.clock.elapsedTime;
    // composed breathing
    const breathe = 1 + Math.sin(t * 1.05) * 0.0055;
    built.body.scale.y = breathe;
    // head quietly follows the visitor's cursor
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
            if (m && !materials.current.some((e) => e.mat === m))
              materials.current.push({ mat: m, base: 0.5 });
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
            if (m && !materials.current.some((e) => e.mat === m))
              materials.current.push({ mat: m, base: 0.55 });
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
