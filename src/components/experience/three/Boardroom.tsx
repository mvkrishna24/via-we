"use client";

import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { SceneId } from "../ExperienceContext";
import { createGlowTexture } from "./textures";

/**
 * The executive boardroom — fully procedural: a horizon floor grid,
 * a long glass table with a lit edge, columns of light and a far
 * skyline of city bokeh. No downloaded assets, instant load.
 */

const SCENE_PRESENCE: Partial<Record<SceneId, number>> = {
  boardroom: 1,
  discovery: 0.85,
  summary: 0.55,
};

export function Boardroom({ scene }: { scene: SceneId }) {
  const group = useRef<THREE.Group>(null);
  const presence = useRef({ value: 0 });
  const materials = useRef<{ mat: THREE.Material; base: number }[]>([]);
  const glowTex = useMemo(() => createGlowTexture(), []);

  const reg = (mat: THREE.Material, base: number) => {
    mat.transparent = true;
    mat.opacity = 0;
    materials.current.push({ mat, base });
    return mat;
  };

  const built = useMemo(() => {
    materials.current = [];
    const g = new THREE.Group();

    // floor grid receding to the horizon
    const gridPts: number[] = [];
    const HALF = 22;
    for (let i = -HALF; i <= HALF; i += 1.1) {
      gridPts.push(i, -1.7, -26, i, -1.7, 6);
      gridPts.push(-HALF, -1.7, i - 10, HALF, -1.7, i - 10);
    }
    const gridGeo = new THREE.BufferGeometry();
    gridGeo.setAttribute("position", new THREE.Float32BufferAttribute(gridPts, 3));
    g.add(
      new THREE.LineSegments(
        gridGeo,
        reg(
          new THREE.LineBasicMaterial({
            color: "#1b4b77",
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
          0.32,
        ),
      ),
    );

    // glass conference table
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 0.1, 2.1),
      reg(new THREE.MeshBasicMaterial({ color: "#0c2740" }), 0.82),
    );
    table.position.set(0, -1.06, -1.4);
    g.add(table);
    const tableEdge = new THREE.LineSegments(
      new THREE.EdgesGeometry(table.geometry),
      reg(
        new THREE.LineBasicMaterial({
          color: "#4ad3f3",
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
        0.5,
      ),
    );
    tableEdge.position.copy(table.position);
    g.add(tableEdge);
    // table legs
    for (const sx of [-2.7, 2.7]) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.62, 1.7),
        reg(new THREE.MeshBasicMaterial({ color: "#0a2138" }), 0.7),
      );
      leg.position.set(sx, -1.42, -1.4);
      g.add(leg);
    }
    // under-table light wash
    const wash = new THREE.Sprite(
      reg(
        new THREE.SpriteMaterial({
          map: glowTex,
          color: "#1b4b77",
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
        0.5,
      ) as THREE.SpriteMaterial,
    );
    wash.position.set(0, -1.65, -1.3);
    wash.scale.set(8, 2.4, 1);
    g.add(wash);

    // architectural light columns
    for (let i = 0; i < 8; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const depth = -3 - Math.floor(i / 2) * 4.4;
      const col = new THREE.Mesh(
        new THREE.PlaneGeometry(0.14, 5.6),
        reg(
          new THREE.MeshBasicMaterial({
            color: i % 4 < 2 ? "#3582ad" : "#1b4b77",
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
          }),
          0.5,
        ),
      );
      col.position.set(side * (5.2 + Math.floor(i / 2) * 0.7), 0.9, depth);
      g.add(col);
    }

    // ceiling light line above the table
    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(5.4, 0.06),
      reg(
        new THREE.MeshBasicMaterial({
          color: "#4ad3f3",
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
        0.75,
      ),
    );
    ceil.position.set(0, 2.5, -1.4);
    g.add(ceil);

    // far skyline bokeh
    const cityN = 240;
    const cityPos = new Float32Array(cityN * 3);
    for (let i = 0; i < cityN; i++) {
      cityPos[i * 3] = (Math.random() - 0.5) * 46;
      cityPos[i * 3 + 1] = -1.5 + Math.random() * 7 * Math.random();
      cityPos[i * 3 + 2] = -24 - Math.random() * 8;
    }
    const cityGeo = new THREE.BufferGeometry();
    cityGeo.setAttribute("position", new THREE.BufferAttribute(cityPos, 3));
    g.add(
      new THREE.Points(
        cityGeo,
        reg(
          new THREE.PointsMaterial({
            color: "#7fc4e8",
            size: 0.06,
            sizeAttenuation: true,
            map: glowTex,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
          0.85,
        ),
      ),
    );

    return g;
  }, [glowTex]);

  useEffect(() => {
    gsap.to(presence.current, {
      value: SCENE_PRESENCE[scene] ?? 0,
      duration: 1.4,
      ease: "power2.inOut",
    });
  }, [scene]);

  useFrame(() => {
    const p = presence.current.value;
    if (!group.current) return;
    group.current.visible = p > 0.02;
    if (!group.current.visible) return;
    for (const { mat, base } of materials.current) mat.opacity = base * p;
  });

  return (
    <group ref={group} visible={false}>
      <primitive object={built} />
    </group>
  );
}
