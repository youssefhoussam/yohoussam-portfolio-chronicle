import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { CLUSTERS, clusterIndex } from "@/data/chapters";
import { chunks } from "@/data/knowledge";
import { app, useApp } from "@/lib/app";
import { prefersReducedMotion } from "@/lib/navigation";
import { bridge, OUTLIER_ID } from "./bridge";
import { buildDust, buildEdges, buildStars, hexToRgb, OUTLIER, PALETTE, shotFor } from "./layout";

const STAR_COUNT = chunks.length;
const MAX_LINES = 5;
const palette = PALETTE.map(([r, g, b]) => new THREE.Vector3(r, g, b));
const toVec3 = (hex: string) => new THREE.Vector3(...hexToRgb(hex));

const COMMON = /* glsl */ `
uniform float uTime;
uniform float uExpand;
uniform float uProj;
uniform float uFocus;
uniform float uMotion;
uniform vec3 uColors[${PALETTE.length}];
uniform vec3 uAccent;
`;

const DUST_VERT = /* glsl */ `
${COMMON}
uniform float uPulse;
attribute float aCluster;
attribute float aSeed;
attribute float aSize;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec3 p = position * uExpand;
  float t = uTime * 0.18 + aSeed * 6.2831;
  p += vec3(sin(t * 1.3), cos(t * 0.9), sin(t * 0.7)) * 0.07 * uMotion;
  float d = length(position);
  p += normalize(position + 1e-4) * uPulse * 0.14 * sin(d * 1.6 - uTime * 7.0);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float focus = (uFocus >= 0.0 && abs(aCluster - uFocus) < 0.5) ? 1.0 : 0.0;
  float depth = max(-mv.z, 0.001);
  gl_PointSize = min(aSize * (1.0 + focus * 0.7) * uProj / depth, 48.0);
  vColor = mix(uColors[int(aCluster + 0.5)], uAccent, focus * 0.75);
  float twinkle = 0.7 + 0.3 * sin(uTime * 1.7 + aSeed * 40.0);
  vAlpha = (0.36 + focus * 0.45) * twinkle * smoothstep(1.0, 4.0, depth);
}`;

const DUST_FRAG = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.05, d);
  a *= a * vAlpha;
  if (a < 0.004) discard;
  gl_FragColor = vec4(vColor, a);
}`;

const STAR_VERT = /* glsl */ `
${COMMON}
attribute float aCluster;
attribute float aSeed;
attribute float aHi;
varying vec3 vColor;
varying float vHi;
varying float vAlpha;
void main() {
  vec3 p = position * uExpand;
  p.y += sin(uTime * 0.6 + aSeed * 20.0) * 0.06 * uMotion;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float focus = (uFocus >= 0.0 && abs(aCluster - uFocus) < 0.5) ? 0.45 : 0.0;
  float hi = max(aHi, focus);
  float depth = max(-mv.z, 0.001);
  vHi = hi;
  vColor = uColors[int(aCluster + 0.5)];
  float twinkle = 0.82 + 0.18 * sin(uTime * 2.2 + aSeed * 30.0);
  vAlpha = (0.75 + hi * 0.45) * twinkle * smoothstep(1.5, 5.0, depth);
  gl_PointSize = min((0.3 + hi * 0.3) * uProj / depth, 72.0);
}`;

const STAR_FRAG = /* glsl */ `
uniform vec3 uAccent;
varying vec3 vColor;
varying float vHi;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float core = smoothstep(0.13, 0.0, d);
  float glow = smoothstep(0.5, 0.0, d);
  glow = glow * glow * 0.45;
  float ring = smoothstep(0.035, 0.0, abs(d - 0.36)) * vHi;
  float a = (core + glow + ring * 0.9) * vAlpha;
  if (a < 0.004) discard;
  vec3 col = mix(vColor, uAccent, min(vHi * 1.4, 1.0));
  col = mix(col, vec3(1.0), core * 0.45);
  gl_FragColor = vec4(col, min(a, 1.0));
}`;

const PROBE_VERT = /* glsl */ `
uniform float uProj;
uniform float uScale;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = min(uScale * uProj / max(-mv.z, 0.001), 140.0);
}`;

const PROBE_FRAG = /* glsl */ `
uniform float uTime;
uniform float uOpacity;
uniform vec3 uColor;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float core = smoothstep(0.09, 0.0, d);
  float r = fract(uTime * 0.7);
  float ring = smoothstep(0.03, 0.0, abs(d - r * 0.47)) * (1.0 - r);
  float halo = smoothstep(0.02, 0.0, abs(d - 0.19)) * 0.7;
  float a = (core + ring + halo) * uOpacity;
  if (a < 0.004) discard;
  gl_FragColor = vec4(mix(uColor, vec3(1.0), core), a);
}`;

const OUTLIER_VERT = /* glsl */ `
uniform float uProj;
uniform float uExpand;
void main() {
  vec4 mv = modelViewMatrix * vec4(position * uExpand, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = min(0.3 * uProj / max(-mv.z, 0.001), 64.0);
}`;

const OUTLIER_FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float core = smoothstep(0.12, 0.0, d);
  float glow = smoothstep(0.5, 0.0, d);
  float blink = 0.55 + 0.45 * sin(uTime * 2.6);
  float a = (core + glow * glow * 0.5) * blink;
  if (a < 0.004) discard;
  gl_FragColor = vec4(mix(uColor, vec3(1.0), core * 0.4), a);
}`;

const LINE_VERT = /* glsl */ `
attribute float aAlpha;
varying float vA;
void main() {
  vA = aAlpha;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const LINE_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vA;
void main() {
  gl_FragColor = vec4(uColor, vA * uOpacity);
}`;

const EDGE_VERT = /* glsl */ `
uniform float uExpand;
uniform vec3 uColors[${PALETTE.length}];
attribute float aCluster;
varying vec3 vColor;
varying float vFade;
void main() {
  vColor = uColors[int(aCluster + 0.5)];
  vec4 mv = modelViewMatrix * vec4(position * uExpand, 1.0);
  vFade = smoothstep(1.5, 5.0, -mv.z);
  gl_Position = projectionMatrix * mv;
}`;

const EDGE_FRAG = /* glsl */ `
uniform float uOpacity;
varying vec3 vColor;
varying float vFade;
void main() {
  gl_FragColor = vec4(vColor, uOpacity * vFade);
}`;

function shader(vertexShader: string, fragmentShader: string, uniforms: Record<string, THREE.IUniform>) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
}

const commonUniforms = () => ({
  uTime: { value: 0 },
  uExpand: { value: 0.02 },
  uProj: { value: 800 },
  uFocus: { value: -1 },
  uMotion: { value: 1 },
  uColors: { value: palette },
  uAccent: { value: toVec3("#f5a524") },
});

function Space() {
  const group = useRef<THREE.Group>(null);
  const { camera, size, viewport } = useThree();
  const debug = useApp((s) => s.debug);
  const reduce = useMemo(() => prefersReducedMotion(), []);
  const lowPower = useMemo(
    () => window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4,
    [],
  );

  const stars = useMemo(() => buildStars(), []);

  const geometries = useMemo(() => {
    const dust = buildDust(lowPower ? 1100 : 2300);
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dust.positions, 3));
    dustGeo.setAttribute("aCluster", new THREE.BufferAttribute(dust.cluster, 1));
    dustGeo.setAttribute("aSeed", new THREE.BufferAttribute(dust.seed, 1));
    dustGeo.setAttribute("aSize", new THREE.BufferAttribute(dust.size, 1));

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(stars.positions, 3));
    starGeo.setAttribute("aCluster", new THREE.BufferAttribute(stars.cluster, 1));
    starGeo.setAttribute("aSeed", new THREE.BufferAttribute(stars.seed, 1));
    starGeo.setAttribute("aHi", new THREE.BufferAttribute(new Float32Array(STAR_COUNT), 1).setUsage(THREE.DynamicDrawUsage));

    const edges = buildEdges(stars.positions, stars.cluster);
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute("position", new THREE.BufferAttribute(edges.edgePositions, 3));
    edgeGeo.setAttribute("aCluster", new THREE.BufferAttribute(edges.edgeCluster, 1));

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(MAX_LINES * 6), 3).setUsage(THREE.DynamicDrawUsage),
    );
    lineGeo.setAttribute("aAlpha", new THREE.BufferAttribute(new Float32Array(MAX_LINES * 2), 1).setUsage(THREE.DynamicDrawUsage));

    const probeGeo = new THREE.BufferGeometry();
    probeGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(3), 3).setUsage(THREE.DynamicDrawUsage));

    const outlierGeo = new THREE.BufferGeometry();
    outlierGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(OUTLIER), 3));

    return { dustGeo, starGeo, edgeGeo, lineGeo, probeGeo, outlierGeo };
  }, [lowPower, stars]);

  const materials = useMemo(() => {
    const dustMat = shader(DUST_VERT, DUST_FRAG, { ...commonUniforms(), uPulse: { value: 0 } });
    const starMat = shader(STAR_VERT, STAR_FRAG, commonUniforms());
    const probeMat = shader(PROBE_VERT, PROBE_FRAG, {
      uTime: { value: 0 },
      uProj: { value: 800 },
      uScale: { value: 1.1 },
      uOpacity: { value: 0 },
      uColor: { value: toVec3("#f5a524") },
    });
    const lineMat = shader(LINE_VERT, LINE_FRAG, { uColor: { value: toVec3("#ffd591") }, uOpacity: { value: 0 } });
    const edgeMat = shader(EDGE_VERT, EDGE_FRAG, { uExpand: { value: 0.02 }, uColors: { value: palette }, uOpacity: { value: 0.16 } });
    const outlierMat = shader(OUTLIER_VERT, OUTLIER_FRAG, {
      uTime: { value: 0 },
      uProj: { value: 800 },
      uExpand: { value: 0.02 },
      uColor: { value: toVec3("#ffffff") },
    });
    return { dustMat, starMat, edgeMat, probeMat, lineMat, outlierMat };
  }, []);

  useEffect(
    () => () => {
      Object.values(geometries).forEach((g) => g.dispose());
      Object.values(materials).forEach((m) => m.dispose());
    },
    [geometries, materials],
  );

  const runtime = useRef({
    time: 0,
    expand: 0.02,
    expandStart: -1,
    pulse: 0,
    lastPulse: app.get().pulse,
    probeOpacity: 0,
    look: new THREE.Vector3(-2.4, 0.3, 0),
    probe: new THREE.Vector3(),
    camTarget: new THREE.Vector3(),
    lookTarget: new THREE.Vector3(),
    tmp: new THREE.Vector3(),
    v: new THREE.Vector3(),
  });

  useFrame((frame, rawDelta) => {
    const g = group.current;
    if (!g) return;
    const delta = Math.min(rawDelta, 0.05);
    const s = app.get();
    const r = runtime.current;
    const { dustMat, starMat, edgeMat, probeMat, lineMat, outlierMat } = materials;
    const { starGeo, lineGeo, probeGeo } = geometries;

    r.time += reduce ? 0 : delta;

    // Big-bang expansion once the boot sequence hands over.
    if (s.phase === "ready") {
      if (r.expandStart < 0) r.expandStart = frame.clock.elapsedTime;
      const t = reduce ? 1 : Math.min(1, (frame.clock.elapsedTime - r.expandStart) / 2.4);
      r.expand = 0.02 + 0.98 * (1 - Math.pow(1 - t, 3));
    } else {
      r.expandStart = -1;
      r.expand += (0.02 - r.expand) * Math.min(1, delta * 4);
    }

    if (s.pulse !== r.lastPulse) {
      r.lastPulse = s.pulse;
      r.pulse = reduce ? 0 : 1;
    }
    r.pulse = Math.max(0, r.pulse - delta * 1.6);

    const focus = s.focusCluster ? clusterIndex(s.focusCluster) : -1;
    const fov = (camera as THREE.PerspectiveCamera).fov;
    const proj = (size.height * viewport.dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(fov / 2)));
    const motion = reduce ? 0 : 1;

    for (const m of [dustMat, starMat]) {
      m.uniforms.uTime.value = r.time;
      m.uniforms.uExpand.value = r.expand;
      m.uniforms.uProj.value = proj;
      m.uniforms.uFocus.value = focus;
      m.uniforms.uMotion.value = motion;
    }
    dustMat.uniforms.uPulse.value = r.pulse;
    edgeMat.uniforms.uExpand.value = r.expand;
    probeMat.uniforms.uTime.value = r.time;
    probeMat.uniforms.uProj.value = proj;
    outlierMat.uniforms.uTime.value = reduce ? 0.6 : r.time;
    outlierMat.uniforms.uProj.value = proj;
    outlierMat.uniforms.uExpand.value = r.expand;

    // Retrieval highlights: stars glow in proportion to their fused relevance.
    // Outside the gateway the last query only lingers faintly, so it never competes with the content.
    const atGateway = s.active === "gateway";
    const rel = s.live?.relevance;
    const hiAttr = starGeo.getAttribute("aHi") as THREE.BufferAttribute;
    const hi = hiAttr.array as Float32Array;
    const k = 1 - Math.exp(-delta * 8);
    for (let i = 0; i < STAR_COUNT; i++) {
      let target = rel ? rel[i] * (atGateway ? 1 : 0.15) : 0;
      if (bridge.hovered === i) target = Math.max(target, 1);
      hi[i] += (target - hi[i]) * k;
    }
    hiAttr.needsUpdate = true;

    // The query probe lands at the relevance-weighted centroid of its neighbours.
    const hits = s.live?.hits ?? [];
    const sp = stars.positions;
    let weight = 0;
    r.tmp.set(0, 0, 0);
    for (const h of hits) {
      if (h.relevance <= 0) continue;
      r.tmp.x += sp[h.index * 3] * h.relevance;
      r.tmp.y += sp[h.index * 3 + 1] * h.relevance;
      r.tmp.z += sp[h.index * 3 + 2] * h.relevance;
      weight += h.relevance;
    }
    const showProbe = weight > 0 && !s.live?.inspected && s.phase === "ready" && atGateway;
    if (showProbe) {
      r.tmp.multiplyScalar(r.expand / weight);
      r.tmp.z += 0.6;
      if (r.probeOpacity < 0.05) r.probe.copy(r.tmp);
      r.probe.lerp(r.tmp, 1 - Math.exp(-delta * 5));
    }
    r.probeOpacity += ((showProbe ? 1 : 0) - r.probeOpacity) * k;
    const probeAttr = probeGeo.getAttribute("position") as THREE.BufferAttribute;
    probeAttr.setXYZ(0, r.probe.x, r.probe.y, r.probe.z);
    probeAttr.needsUpdate = true;
    probeMat.uniforms.uOpacity.value = r.probeOpacity;

    const linePos = lineGeo.getAttribute("position") as THREE.BufferAttribute;
    const lineAlpha = lineGeo.getAttribute("aAlpha") as THREE.BufferAttribute;
    for (let j = 0; j < MAX_LINES; j++) {
      const h = hits[j];
      if (h && showProbe) {
        linePos.setXYZ(j * 2, r.probe.x, r.probe.y, r.probe.z);
        linePos.setXYZ(j * 2 + 1, sp[h.index * 3] * r.expand, sp[h.index * 3 + 1] * r.expand, sp[h.index * 3 + 2] * r.expand);
        lineAlpha.setX(j * 2, 0.75 * h.relevance);
        lineAlpha.setX(j * 2 + 1, 0.12 * h.relevance);
      } else {
        lineAlpha.setX(j * 2, 0);
        lineAlpha.setX(j * 2 + 1, 0);
      }
    }
    linePos.needsUpdate = true;
    lineAlpha.needsUpdate = true;
    lineMat.uniforms.uOpacity.value = r.probeOpacity;

    // Slow, bounded drift keeps the composition stable.
    g.rotation.y = reduce ? 0 : Math.sin(r.time * 0.05) * 0.22;
    g.rotation.x = reduce ? 0 : Math.sin(r.time * 0.037) * 0.04;

    // Camera flies to the cluster that matches the chapter being read.
    const shot = shotFor(s.active, size.width / Math.max(1, size.height));
    r.camTarget.set(...shot.pos);
    r.lookTarget.set(...shot.look);
    if (!reduce) {
      r.camTarget.x += bridge.pointer.x * 0.5;
      r.camTarget.y += bridge.pointer.y * 0.35;
    }
    r.camTarget.z += (1 - r.expand) * 6;
    const ck = reduce ? 1 : 1 - Math.exp(-delta * 1.3);
    camera.position.lerp(r.camTarget, ck);
    r.look.lerp(r.lookTarget, ck);
    camera.lookAt(r.look);

    // Project stars, outlier and cluster labels for the DOM layer.
    g.updateMatrixWorld();
    camera.updateMatrixWorld();
    const W = size.width;
    const H = size.height;
    const interactive = r.expand > 0.9;
    for (let i = 0; i < STAR_COUNT; i++) {
      r.v
        .set(sp[i * 3] * r.expand, sp[i * 3 + 1] * r.expand, sp[i * 3 + 2] * r.expand)
        .applyMatrix4(g.matrixWorld)
        .project(camera);
      bridge.starScreen[i * 3] = ((r.v.x + 1) / 2) * W;
      bridge.starScreen[i * 3 + 1] = ((1 - r.v.y) / 2) * H;
      bridge.starScreen[i * 3 + 2] = interactive && r.v.z < 1 && Math.abs(r.v.x) < 1 && Math.abs(r.v.y) < 1 ? 1 : 0;
    }
    r.v.set(OUTLIER[0] * r.expand, OUTLIER[1] * r.expand, OUTLIER[2] * r.expand).applyMatrix4(g.matrixWorld).project(camera);
    bridge.outlierScreen[0] = ((r.v.x + 1) / 2) * W;
    bridge.outlierScreen[1] = ((1 - r.v.y) / 2) * H;
    bridge.outlierScreen[2] = interactive && r.v.z < 1 && Math.abs(r.v.x) < 1 && Math.abs(r.v.y) < 1 ? 1 : 0;

    const labelsOn = s.active === "gateway" && s.phase === "ready" && r.expand > 0.95;
    CLUSTERS.forEach((c, i) => {
      const el = bridge.labelEls[i];
      if (!el) return;
      r.v
        .set(c.position[0] * r.expand, (c.position[1] + 1.55) * r.expand, c.position[2] * r.expand)
        .applyMatrix4(g.matrixWorld)
        .project(camera);
      const lx = ((r.v.x + 1) / 2) * W;
      const visible = labelsOn && r.v.z < 1 && Math.abs(r.v.x) < 0.94 && Math.abs(r.v.y) < 0.9 && lx > bridge.labelMinX;
      el.style.transform = `translate3d(${lx.toFixed(1)}px, ${(((1 - r.v.y) / 2) * H).toFixed(1)}px, 0) translate(-50%, -50%)`;
      el.style.opacity = visible ? (focus === i ? "1" : "0.62") : "0";
    });

    const tip = bridge.tooltipEl;
    if (tip && bridge.hovered !== -1) {
      const src = bridge.hovered === OUTLIER_ID ? bridge.outlierScreen : bridge.starScreen;
      const o = bridge.hovered === OUTLIER_ID ? 0 : bridge.hovered * 3;
      tip.style.transform = `translate3d(${(src[o] + 16).toFixed(1)}px, ${(src[o + 1] - 16).toFixed(1)}px, 0)`;
    }
  });

  return (
    <group ref={group}>
      <points geometry={geometries.dustGeo} material={materials.dustMat} frustumCulled={false} />
      <lineSegments geometry={geometries.edgeGeo} material={materials.edgeMat} frustumCulled={false} />
      <points geometry={geometries.starGeo} material={materials.starMat} frustumCulled={false} />
      <lineSegments geometry={geometries.lineGeo} material={materials.lineMat} frustumCulled={false} />
      <points geometry={geometries.probeGeo} material={materials.probeMat} frustumCulled={false} />
      <points geometry={geometries.outlierGeo} material={materials.outlierMat} frustumCulled={false} />
      {debug && (
        <>
          <gridHelper args={[40, 40, "#2b3140", "#141820"]} position={[0, -6, 0]} />
          <axesHelper args={[2.5]} />
        </>
      )}
    </group>
  );
}

export default function VectorSpace() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      flat
      resize={{ scroll: false }}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [-2.6, 0.5, 20], fov: 50, near: 0.1, far: 120 }}
    >
      <color attach="background" args={["#0a0908"]} />
      <Space />
    </Canvas>
  );
}
