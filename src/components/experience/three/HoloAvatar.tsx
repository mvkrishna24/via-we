"use client";

import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { SceneId } from "../ExperienceContext";
import { pointerState } from "./pointer";
import { createGlowTexture } from "./textures";

/**
 * Vijay's holographic identity — built from the reference photos.
 * Wide rectangular jaw, front-volume quiff, dense full beard,
 * prominent brows, 3-piece windowpane suit, seated forward posture.
 * Target: 70% recognisable / 30% holographic futurism.
 */

const SCENE_PRESENCE: Partial<Record<SceneId, { p: number; x: number; scale: number }>> = {
  meet: { p: 1, x: 1.85, scale: 1.35 },
  persona: { p: 0.45, x: 2.9, scale: 0.82 },
  convert: { p: 1, x: -2.1, scale: 1 },
};

const fresnelMat = (color: string) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: 1.8 },
    },
    vertexShader: /* glsl */ `
      varying float vFresnel;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec3 n = normalize(normalMatrix * normal);
        vec3 viewDir = normalize(-mv.xyz);
        vFresnel = pow(1.0 - abs(dot(n, viewDir)), 2.4);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uIntensity;
      varying float vFresnel;
      void main() {
        gl_FragColor = vec4(uColor, vFresnel * uIntensity);
      }`,
  });

export function HoloAvatar({ scene }: { scene: SceneId }) {
  const group = useRef<THREE.Group>(null);
  const headGroup = useRef<THREE.Group>(null);
  const scanRef = useRef<THREE.Mesh>(null);
  const presence = useRef({ value: 0 });
  const materials = useRef<{ mat: THREE.Material; base: number }[]>([]);
  const fresnels = useRef<THREE.ShaderMaterial[]>([]);
  const glowTex = useMemo(() => createGlowTexture(), []);

  // ── All geometry created once ─────────────────────────────────────────────
  const parts = useMemo(() => {
    // FACE — wide rectangular, Vijay's jaw is almost as wide as his cheekbones
    // Vijay's face is wide and square — scale x much wider, y slightly shorter
    const face = new THREE.SphereGeometry(0.33, 32, 24);
    face.scale(1.28, 0.92, 0.90);

    // JAW PLANE — even wider to match near-rectangular lower face
    const jaw = new THREE.SphereGeometry(0.29, 26, 14);
    jaw.scale(1.42, 0.50, 0.94);

    // HAIR CAP — tight cap, only covers crown of head
    const hairCap = new THREE.SphereGeometry(0.295, 26, 18, 0, Math.PI * 2, 0, Math.PI * 0.42);
    hairCap.scale(1.12, 0.70, 1.06);

    // HAIR FRONT VOLUME — compact quiff at front-top of head
    const hairQuiff = new THREE.SphereGeometry(0.14, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
    hairQuiff.scale(1.0, 1.3, 0.9);

    // BEARD BODY — low-poly so wireframe texture reads at screen scale
    const beardBody = new THREE.SphereGeometry(0.32, 10, 7);
    beardBody.scale(1.22, 0.52, 0.96);

    // BEARD CHIN — fuller coverage at the chin tip
    const beardChin = new THREE.SphereGeometry(0.18, 16, 12);
    beardChin.scale(0.88, 0.7, 0.82);

    // MUSTACHE — compact upper-lip band
    const mustache = new THREE.SphereGeometry(0.115, 14, 10);
    mustache.scale(1.28, 0.3, 0.78);

    // BROW — thicker so it reads at screen scale
    const brow = new THREE.CylinderGeometry(0.024, 0.03, 0.18, 8);

    // EAR — flattened ellipsoid
    const ear = new THREE.SphereGeometry(0.092, 10, 8);
    ear.scale(0.4, 0.76, 0.28);

    // NECK — slightly thicker to match the broader build
    const neck = new THREE.CylinderGeometry(0.13, 0.17, 0.24, 14);

    // SHOULDERS — broad suit line
    const shoulders = new THREE.SphereGeometry(0.62, 30, 18, 0, Math.PI * 2, 0, Math.PI / 2);
    shoulders.scale(1.68, 1.0, 0.86);

    // TORSO — 3-piece, slightly deeper chest
    const torso = new THREE.CylinderGeometry(0.58, 0.68, 0.84, 28, 6);
    torso.scale(1.46, 1, 0.8);

    // ARMS (shared geometry) — seated posture, upper arm
    const upperArm = new THREE.CylinderGeometry(0.1, 0.095, 0.5, 10);
    upperArm.scale(1.08, 1, 0.9);

    // FOREARM — slightly narrower, angles toward lap
    const forearm = new THREE.CylinderGeometry(0.088, 0.095, 0.46, 10);
    forearm.scale(1.0, 1, 0.86);

    return { face, jaw, hairCap, hairQuiff, beardBody, beardChin, mustache, brow, ear, neck, shoulders, torso, upperArm, forearm };
  }, []);

  // ── Material registration: tracks every material for opacity animation ────
  const reg = (mat: THREE.Material, base: number) => {
    mat.transparent = true;
    (mat as THREE.MeshBasicMaterial).opacity = base; // set immediately for debugging
    materials.current.push({ mat, base });
    return mat;
  };

  // ── Build the full scene graph once ──────────────────────────────────────
  const built = useMemo(() => {
    materials.current = [];
    fresnels.current = [];

    // helpers
    const fill = (geo: THREE.BufferGeometry, color = "#0a2138", base = 0.72) => {
      const m = new THREE.Mesh(geo, reg(new THREE.MeshBasicMaterial({ color }), base));
      m.renderOrder = 1;
      return m;
    };
    const wires = (geo: THREE.BufferGeometry, color = "#4ad3f3", base = 0.18) => {
      const m = new THREE.LineSegments(
        new THREE.WireframeGeometry(geo),
        reg(new THREE.LineBasicMaterial({ color, blending: THREE.AdditiveBlending, depthWrite: false }), base),
      );
      m.renderOrder = 3;
      return m;
    };
    const rimMesh = (geo: THREE.BufferGeometry) => {
      const mat = fresnelMat("#5ccced");
      fresnels.current.push(mat);
      const m = new THREE.Mesh(geo, mat);
      m.scale.setScalar(1.035);
      m.renderOrder = 2;
      return m;
    };
    const placed = (obj: THREE.Object3D, x: number, y: number, z: number) => {
      obj.position.set(x, y, z);
      return obj;
    };

    // ── HEAD PIVOT ──────────────────────────────────────────────────────────
    const headPivot = new THREE.Group();
    headPivot.position.y = 1.06;

    headPivot.add(fill(parts.face, "#040d18", 0.96), wires(parts.face, "#78e8ff", 0.16), rimMesh(parts.face));

    // Jaw — separate wider slab at lower face
    const jawFill = placed(fill(parts.jaw, "#091f35", 0.90), 0, -0.19, 0.01);
    jawFill.renderOrder = 2;
    const jawWire = placed(wires(parts.jaw, "#68e8ff", 0.18), 0, -0.19, 0.01);
    headPivot.add(jawFill, jawWire);

    // Ears — width landmark
    for (const side of [-1, 1] as const) {
      const ef = fill(parts.ear, "#0a2138", 0.72);
      ef.position.set(side * 0.39, 0.02, 0.04);
      const ew = wires(parts.ear, "#44d4ec", 0.14);
      ew.position.set(side * 0.39, 0.02, 0.04);
      headPivot.add(ef, ew);
    }

    // ── BROWS — thin glowing bars, depthTest:false ───────────────────────────
    for (const side of [-1, 1] as const) {
      const browGeo = new THREE.BoxGeometry(0.20, 0.022, 0.012);
      const bm = new THREE.Mesh(
        browGeo,
        reg(new THREE.MeshBasicMaterial({
          color: "#aaeeff",
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: false,
        }), 0.90),
      );
      bm.position.set(side * 0.126, 0.138, 0.285);
      // inner end higher, outer end lower = natural arch; wider separation
      bm.rotation.set(-0.12, side * -0.10, side * -0.18);
      bm.renderOrder = 8;
      headPivot.add(bm);
    }

    // ── EYES — sized to read at screen scale, depthTest:false ─────────────────
    for (const side of [-1, 1] as const) {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.062, 10, 8),
        reg(new THREE.MeshBasicMaterial({
          color: "#c8f8ff",
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: false,
        }), 0.88),
      );
      eye.position.set(side * 0.108, 0.055, 0.305);
      eye.renderOrder = 9;
      headPivot.add(eye);
    }

    // ── HAIR ───────────────────────────────────────────────────────────────
    // Cap — covers top + back of head; darker than face fill = reads as hair
    const hcF = placed(fill(parts.hairCap, "#040a14", 0.98), 0, 0.10, 0);
    hcF.renderOrder = 5;
    const hcW = placed(wires(parts.hairCap, "#38bcd8", 0.28), 0, 0.10, 0);
    hcW.renderOrder = 6;
    headPivot.add(hcF, hcW);

    // Quiff — raised higher and further forward to break the head silhouette
    const hqF = new THREE.Mesh(
      parts.hairQuiff,
      reg(new THREE.MeshBasicMaterial({ color: "#040a14" }), 0.98),
    );
    hqF.position.set(0, 0.30, 0.14);
    hqF.renderOrder = 6;
    const hqW = new THREE.LineSegments(
      new THREE.WireframeGeometry(parts.hairQuiff),
      reg(new THREE.LineBasicMaterial({ color: "#38bcd8", blending: THREE.AdditiveBlending, depthWrite: false }), 0.32),
    );
    hqW.position.copy(hqF.position);
    hqW.renderOrder = 7;
    headPivot.add(hqF, hqW);

    // ── BEARD ──────────────────────────────────────────────────────────────
    // Body — darker fill than face creates visible beard region contrast
    const bbF = new THREE.Mesh(
      parts.beardBody,
      reg(new THREE.MeshBasicMaterial({ color: "#060f1e" }), 0.96),
    );
    bbF.position.set(0, -0.21, 0.02);
    bbF.renderOrder = 4;
    const bbW = new THREE.LineSegments(
      new THREE.WireframeGeometry(parts.beardBody),
      reg(new THREE.LineBasicMaterial({ color: "#6ef4ff", blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }), 1.0),
    );
    bbW.position.copy(bbF.position);
    bbW.renderOrder = 5;
    headPivot.add(bbF, bbW);

    // Chin — extra fullness below jaw center
    const bcF = new THREE.Mesh(
      parts.beardChin,
      reg(new THREE.MeshBasicMaterial({ color: "#0c2438" }), 0.88),
    );
    bcF.position.set(0, -0.3, 0.14);
    bcF.renderOrder = 5;
    const bcW = new THREE.LineSegments(
      new THREE.WireframeGeometry(parts.beardChin),
      reg(new THREE.LineBasicMaterial({ color: "#4cdaf0", blending: THREE.AdditiveBlending, depthWrite: false }), 0.75),
    );
    bcW.position.copy(bcF.position);
    bcW.renderOrder = 6;
    headPivot.add(bcF, bcW);

    // Mustache — tight horizontal band above upper lip
    const muF = new THREE.Mesh(
      parts.mustache,
      reg(new THREE.MeshBasicMaterial({ color: "#0c2438" }), 0.88),
    );
    muF.position.set(0, -0.09, 0.287);
    muF.renderOrder = 5;
    const muW = new THREE.LineSegments(
      new THREE.WireframeGeometry(parts.mustache),
      reg(new THREE.LineBasicMaterial({ color: "#4adaf0", blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }), 0.82),
    );
    muW.position.copy(muF.position);
    muW.renderOrder = 6;
    headPivot.add(muF, muW);

    // ── BODY ────────────────────────────────────────────────────────────────
    const body = new THREE.Group();

    const neckF = placed(fill(parts.neck), 0, 0.82, 0);
    const neckW = placed(wires(parts.neck, "#4ad3f3", 0.1), 0, 0.82, 0);
    const shF = placed(fill(parts.shoulders), 0, 0.42, 0);
    const shW = placed(wires(parts.shoulders, "#4ad3f3", 0.12), 0, 0.42, 0);
    const shR = rimMesh(parts.shoulders);
    shR.position.y = 0.42;
    const toF = placed(fill(parts.torso), 0, 0.06, 0);
    const toW = placed(wires(parts.torso, "#4ad3f3", 0.09), 0, 0.06, 0);
    body.add(neckF, neckW, shF, shW, shR, toF, toW);

    // WINDOWPANE CHECK — subtle grid overlay suggesting the suit fabric pattern
    const checkGeo = new THREE.PlaneGeometry(1.14, 0.84, 9, 6);
    const checkGrid = new THREE.LineSegments(
      new THREE.WireframeGeometry(checkGeo),
      reg(new THREE.LineBasicMaterial({ color: "#4ad3f3", blending: THREE.AdditiveBlending, depthWrite: false }), 0.05),
    );
    checkGrid.position.set(0, 0.24, 0.5);
    checkGrid.renderOrder = 3;
    body.add(checkGrid);

    // LAPELS — notched V, wider to match the photo's jacket width
    for (const side of [-1, 1] as const) {
      const lapel = new THREE.Mesh(
        new THREE.PlaneGeometry(0.15, 0.4, 2, 3),
        reg(new THREE.MeshBasicMaterial({ color: "#4ad3f3", blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), 0.26),
      );
      lapel.position.set(side * 0.19, 0.68, 0.5);
      lapel.rotation.z = side * -0.42;
      lapel.renderOrder = 4;
      body.add(lapel);
    }

    // SHIRT COLLAR — white panel visible above vest
    for (const side of [-1, 1] as const) {
      const collar = new THREE.Mesh(
        new THREE.PlaneGeometry(0.1, 0.2, 1, 2),
        reg(new THREE.MeshBasicMaterial({ color: "#72eaff", blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), 0.22),
      );
      collar.position.set(side * 0.065, 0.83, 0.5);
      collar.rotation.z = side * -0.3;
      collar.renderOrder = 5;
      body.add(collar);
    }

    // VEST CENTRE PANEL
    const vest = new THREE.Mesh(
      new THREE.PlaneGeometry(0.062, 0.52),
      reg(new THREE.MeshBasicMaterial({ color: "#4ad3f3", blending: THREE.AdditiveBlending, depthWrite: false }), 0.3),
    );
    vest.position.set(0, 0.47, 0.51);
    body.add(vest);

    // VEST BUTTONS — 5 buttons down the waistcoat
    for (let i = 0; i < 5; i++) {
      const btn = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 8, 6),
        reg(new THREE.MeshBasicMaterial({ color: "#4ad3f3", blending: THREE.AdditiveBlending, depthWrite: false }), 0.74),
      );
      btn.position.set(0, 0.67 - i * 0.15, 0.525);
      btn.renderOrder = 5;
      body.add(btn);
    }

    // ── ARMS — seated forward posture ──────────────────────────────────────
    const makeArm = (side: number) => {
      const armGroup = new THREE.Group();

      // Upper arm
      const uaF = fill(parts.upperArm, "#091f35", 0.62);
      const uaW = wires(parts.upperArm, "#38b8d4", 0.1);
      armGroup.add(uaF, uaW);

      // Forearm — hangs below at the elbow, angles inward toward lap
      const faGroup = new THREE.Group();
      const faF = fill(parts.forearm, "#091f35", 0.62);
      const faW = wires(parts.forearm, "#38b8d4", 0.1);
      faGroup.add(faF, faW);
      faGroup.position.y = -0.42;
      faGroup.rotation.x = 0.55;            // swing forward toward lap
      faGroup.rotation.z = side * -0.28;    // angle hands toward center
      armGroup.add(faGroup);

      // Position: from shoulder outward, tilted forward for seated lean
      armGroup.position.set(side * 0.74, 0.4, 0.22);
      armGroup.rotation.x = 0.62;   // forward tilt
      armGroup.rotation.z = side * 0.18; // slight outward shoulder droop

      return armGroup;
    };
    body.add(makeArm(-1), makeArm(1));

    // WATCH — right wrist detail (personal identifier from photos)
    const watchBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.065, 0.018, 8, 20),
      reg(new THREE.MeshBasicMaterial({ color: "#4ad3f3", blending: THREE.AdditiveBlending, depthWrite: false }), 0.5),
    );
    watchBand.position.set(0.72, -0.06, 0.55);
    watchBand.rotation.x = Math.PI / 2;
    watchBand.renderOrder = 4;
    body.add(watchBand);

    return { headPivot, body };
  }, [parts]);

  useEffect(() => {
    const conf = SCENE_PRESENCE[scene];
    const target = conf?.p ?? 0;
    gsap.to(presence.current, { value: target, duration: 1.1, ease: "power2.inOut" });
    if (group.current && conf) {
      gsap.to(group.current.position, { x: conf.x, duration: 1.3, ease: "power3.inOut" });
      gsap.to(group.current.scale, { x: conf.scale, y: conf.scale, z: conf.scale, duration: 1.3, ease: "power3.inOut" });
    }
  }, [scene]);

  useFrame((state, delta) => {
    const p = presence.current.value;
    if (!group.current) return;
    group.current.visible = p > 0.02;
    if (!group.current.visible) return;

    for (const { mat, base } of materials.current) (mat as THREE.MeshBasicMaterial).opacity = base * p;
    for (const m of fresnels.current) m.uniforms.uIntensity.value = p * 1.8;

    const t = state.clock.elapsedTime;
    built.body.scale.y = 1 + Math.sin(t * 1.05) * 0.0055; // composed breathing

    if (headGroup.current) {
      const tY = THREE.MathUtils.clamp(pointerState.x * 0.42, -0.32, 0.32);
      const tX = THREE.MathUtils.clamp(-pointerState.y * 0.2, -0.14, 0.18);
      headGroup.current.rotation.y += (tY - headGroup.current.rotation.y) * Math.min(1, delta * 4);
      headGroup.current.rotation.x += (tX - headGroup.current.rotation.x) * Math.min(1, delta * 4);
    }

    if (scanRef.current) {
      const cycle = (t * 0.32) % 1;
      scanRef.current.position.y = -0.55 + cycle * 2.1;
      (scanRef.current.material as THREE.MeshBasicMaterial).opacity = Math.sin(cycle * Math.PI) * 0.3 * p;
    }
    group.current.position.y = -0.55 + Math.sin(t * 0.8) * 0.025;
  });

  return (
    <group ref={group} position={[1.85, -0.55, 1.2]} visible={false}>
      <group ref={headGroup}>
        <primitive object={built.headPivot} />
      </group>
      <primitive object={built.body} />

      {/* holographic projection base */}
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

      {/* scan beam */}
      <mesh ref={scanRef} position={[0, 0.4, 0.3]}>
        <planeGeometry args={[2.0, 0.045]} />
        <meshBasicMaterial color="#4ad3f3" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}
