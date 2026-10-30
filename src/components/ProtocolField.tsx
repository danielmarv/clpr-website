"use client";

import { useEffect, useRef } from "react";

import { CLPR_SPIRAL_PATH } from "@/components/ClprMark";
import { createNetworkLayer, HERO_SCENE, STORY_SCENE, type NetworkLayer } from "@/components/networkLayer";
import { buildForms, FORM_TEXTURE_WIDTH, FORMS, seeded, type FormName } from "@/components/sceneForms";
import { formGraph, heroGraph, storyGraph, type Graph } from "@/components/sceneGraphs";
import { CAMERA_Z, FOCAL, SCENE_GLSL } from "@/components/sceneMotion";

/*
 * The page background: aurora, particles and networkLayer.ts on one WebGL2 canvas.
 * Sections opt in with `data-scene` and `data-form`; without WebGL2, html.no-webgl
 * falls back to a CSS gradient.
 */

// Bounding box of CLPR_SPIRAL_PATH and the approximate center of its coil.
const LOGO_BOX = { x: 405, y: 356, width: 117.4, height: 77.7 };
const LOGO_COIL = { x: 489, y: 382 };

const FORM_GAIN: Record<FormName, number> = {
  chain: 1,
  route: 1,
  bridge: 1,
  mesh: 1,
  globe: 1.7,
};

const KIND_A = 0;
const KIND_B = 1;
const KIND_CHANNEL = 2;
const KIND_DUST = 3;

const PARTICLE_VERTEX = /* glsl */ `#version 300 es
precision highp float;

in vec4 aLogo;   // xyz: spiral position (unit width 2), w: color along the spiral, < 0 marks an orbit particle
in vec4 aLedger; // xyz: offset within a ledger (unit radius), w: kind
in vec4 aField;  // xyz: star-field position, w: size
in vec4 aRand;

uniform float uTime;
uniform float uIntro;
uniform float uState;   // 0 spiral → 1 ledgers → 2 section illustrations
uniform float uChannel; // 0 → 1 the Channel opens
uniform float uProof;   // 0 → 1 proofs travel and verify
uniform float uOutro;   // 0 → 1 back to the spiral
uniform float uSpiral;  // how visible the spiral is (0 where a scene shows its own illustration)
uniform float uLedgers; // how visible the two ledgers and their Channel are (0 when the story draws its own)
uniform float uAspect;
uniform float uPixelRatio;
uniform float uScroll;
uniform float uMouseForce;
uniform vec2 uMouse;
uniform vec2 uRot;
uniform vec4 uLogo;    // xyz center, w scale
uniform vec4 uLedgerA; // xyz center, w radius
uniform vec4 uLedgerB;
uniform highp sampler2D uForms; // section illustrations, packed by sceneForms.ts
uniform int uRowsPerForm;
uniform int uFormA;     // illustration of the section in view …
uniform int uFormB;     // … and of the next one
uniform float uFormMix; // 0 → 1 from A to B
uniform vec4 uPlaceA;   // xyz center, w scale
uniform vec4 uPlaceB;

out vec3 vColor;
out float vAlpha;

${SCENE_GLSL}

vec3 drift(vec3 p, float t, float seed) {
  return vec3(
    sin(p.y * 1.7 + t * 0.6 + seed * 6.28),
    sin(p.z * 1.3 + t * 0.5 + seed * 3.14),
    sin(p.x * 1.5 + t * 0.7 + seed * 4.71)
  );
}

float stagger(float value, float seed) {
  float s = clamp(value * 1.6 - seed * 0.6, 0.0, 1.0);
  return s * s * (3.0 - 2.0 * s);
}

const float FORM_GAIN[${FORMS.length}] = float[${FORMS.length}](${FORMS.map((name) => FORM_GAIN[name].toFixed(2)).join(", ")});

void sectionPoint(int form, vec4 place, vec3 field, vec3 fieldColor, float fieldAlpha, float fieldSize,
                  float t, float twinkle, out vec3 pos, out vec3 color, out float alpha, out float size) {
  ivec2 texel = ivec2(gl_VertexID % ${FORM_TEXTURE_WIDTH}, gl_VertexID / ${FORM_TEXTURE_WIDTH} + form * uRowsPerForm);
  vec4 point = texelFetch(uForms, texel, 0);
  if (point.w <= 0.0) {
    pos = field;
    color = fieldColor;
    alpha = fieldAlpha;
    size = fieldSize;
    return;
  }
  float a = 0.75 * min(point.w, 1.0) * FORM_GAIN[form] * twinkle;
  vec3 local = point.xyz + drift(point.xyz * 3.0, t, aRand.x) * 0.006;
  // The dust around the bridge's hub falls with it.
  float crumble = form == ${FORMS.indexOf("bridge")} && abs(local.x) < 0.8 && local.y < -0.08 ? 1.0 : 0.0;
  local = animateForm(form, local, t, aRand.w, crumble, a);
  color = palette(clamp(0.5 + local.x * 0.22 + (aRand.y - 0.5) * 0.15, 0.0, 1.0));
  size = 1.5 + aRand.y * 1.3;
  if (point.w > 1.0) {
    color = mix(color, vec3(1.0, 0.55, 0.82), 0.55);
    a *= point.w;
    size += 1.2;
  }
  pos = local * place.w + place.xyz;
  alpha = a;
}

void main() {
  float kind = aLedger.w;
  float t = uTime;
  float twinkle = 0.7 + 0.3 * sin(t * (0.8 + aRand.z * 2.2) + aRand.w * 6.28);

  vec3 logo;
  vec3 logoColor;
  float logoAlpha;
  float logoSize;
  if (aLogo.w < 0.0) {
    float angle = aLogo.x + t * 0.12;
    float radius = aLogo.y;
    logo = vec3(cos(angle) * radius, aLogo.z, sin(angle) * radius);
    logo = rotZ(rotX(logo, 1.18), -0.32);
    logoColor = palette(0.15 + 0.5 * aRand.x);
    logoAlpha = 0.5 * twinkle;
    logoSize = 1.8 + aRand.y * 1.8;
  } else {
    logo = aLogo.xyz + drift(aLogo.xyz * 2.4, t, aRand.x) * 0.012;
    float yaw = -0.34 + sin(t * 0.23) * 0.16 + uRot.x * 0.55;
    float pitch = 0.1 + cos(t * 0.19) * 0.06 - uRot.y * 0.35;
    logo = rotX(rotY(logo, yaw), pitch);
    logoColor = palette(aLogo.w);
    logoAlpha = 0.85 * twinkle;
    logoSize = 2.0 + aRand.y * 1.6;
  }
  logo = logo * uLogo.w + uLogo.xyz;
  logoAlpha *= uSpiral;

  vec3 ledger;
  vec3 ledgerColor;
  float ledgerAlpha;
  float ledgerSize = 2.0 + aRand.y * 1.5;
  if (kind < 1.5) {
    vec4 center = kind < 0.5 ? uLedgerA : uLedgerB;
    float spin = t * (kind < 0.5 ? 0.16 : -0.13) + aRand.w * 0.02;
    ledger = rotY(aLedger.xyz, spin) * center.w + center.xyz;
    ledgerColor = kind < 0.5 ? palette(0.08 + aRand.x * 0.2) : palette(0.62 + aRand.x * 0.3);
    ledgerAlpha = (length(aLedger.xyz) > 1.2 ? 0.3 : 0.5) * twinkle;
    if (kind > 0.5) {
      float wave = pow(0.5 + 0.5 * sin(t * 2.4 - length(aLedger.xyz) * 5.0), 6.0);
      ledgerAlpha *= 1.0 + uProof * (0.35 + 1.2 * wave);
      ledgerColor = mix(ledgerColor, vec3(1.0, 0.42, 0.72), uProof * 0.5);
    }
  } else {
    vec3 a = uLedgerA.xyz;
    vec3 b = uLedgerB.xyz;
    vec3 dir = normalize(b - a);
    vec3 start = a + dir * uLedgerA.w * 1.05;
    vec3 end = b - dir * uLedgerB.w * 1.05;
    bool response = aRand.y < 0.18;
    float u = fract(aRand.z + t * (0.07 + aRand.w * 0.05));
    if (response) u = 1.0 - u;
    float lift = sin(PI * u);
    vec3 path = mix(start, end, u) + vec3(0.0, 0.17 * lift, 0.1 * lift);
    path += aLedger.xyz * (0.025 + 0.05 * lift);
    vec3 resting = a + aLedger.xyz * uLedgerA.w * 0.7;
    float open = stagger(uChannel, aRand.x);
    ledger = mix(resting, path, open);
    float ends = smoothstep(0.0, 0.06, u) * smoothstep(1.0, 0.94, u);
    ledgerColor = response ? palette(0.2) : mix(palette(0.1), palette(0.45), u);
    ledgerAlpha = mix(0.5, 0.6 * ends, open) * twinkle;
    ledgerSize = 2.2 + aRand.y * 1.2;
    if (aRand.y > 0.78) {
      float packet = pow(0.5 + 0.5 * sin(u * 18.0 - t * 1.5), 8.0);
      ledgerColor = mix(ledgerColor, vec3(1.0, 0.4, 0.7), uProof);
      ledgerAlpha *= 1.0 + uProof * (0.6 + 2.0 * packet);
      ledgerSize += uProof * 1.6;
    }
  }

  ledgerAlpha *= uLedgers;

  vec3 field = aField.xyz;
  float depth = clamp((field.z + 7.0) / 8.6, 0.0, 1.0);
  field.y = mod(field.y + uScroll * (0.18 + 0.5 * depth) + 5.0, 10.0) - 5.0;
  field += drift(field * 0.4, t * 0.4, aRand.w) * 0.08;
  float fieldVisible = step(aRand.z, 0.42);
  vec3 fieldColor = mix(vec3(0.62, 0.6, 0.85), palette(aRand.x), 0.55);
  float fieldAlpha = (0.12 + 0.3 * depth) * fieldVisible * twinkle;
  float fieldSize = aField.w;

  vec3 sectionA, sectionB, colorA, colorB;
  float alphaA, alphaB, sizeA, sizeB;
  sectionPoint(uFormA, uPlaceA, field, fieldColor, fieldAlpha, fieldSize, t, twinkle, sectionA, colorA, alphaA, sizeA);
  sectionPoint(uFormB, uPlaceB, field, fieldColor, fieldAlpha, fieldSize, t, twinkle, sectionB, colorB, alphaB, sizeB);
  float sm = stagger(uFormMix, aRand.z);
  vec3 section = mix(sectionA, sectionB, sm) + drift(sectionA, t, aRand.w) * sin(PI * sm) * 0.45;
  vec3 sectionColor = mix(colorA, colorB, sm);
  float sectionAlpha = mix(alphaA, alphaB, sm);
  float sectionSize = mix(sizeA, sizeB, sm);

  vec3 pos;
  vec3 color;
  float alpha;
  float size;
  if (kind > 2.5) {
    pos = field;
    color = fieldColor;
    alpha = (0.1 + 0.18 * depth) * twinkle;
    size = fieldSize;
  } else {
    float s1 = stagger(clamp(uState, 0.0, 1.0), aRand.y);
    float s2 = stagger(clamp(uState - 1.0, 0.0, 1.0), aRand.w);
    float so = stagger(uOutro, aRand.x);

    pos = mix(logo, ledger, s1) + drift(logo, t, aRand.z) * sin(PI * s1) * 0.4;
    color = mix(logoColor, ledgerColor, s1);
    alpha = mix(logoAlpha, ledgerAlpha, s1);
    size = mix(logoSize, ledgerSize, s1);

    pos = mix(pos, section, s2) + drift(pos, t, aRand.x) * sin(PI * s2) * 0.5;
    color = mix(color, sectionColor, s2);
    alpha = mix(alpha, sectionAlpha, s2);
    size = mix(size, sectionSize, s2);

    pos = mix(pos, logo, so) + drift(field, t, aRand.y) * sin(PI * so) * 0.5;
    color = mix(color, logoColor, so);
    alpha = mix(alpha, logoAlpha, so);
    size = mix(size, logoSize, so);

    float si = clamp(uIntro * 1.7 - aRand.x * 0.7, 0.0, 1.0);
    si = 1.0 - pow(1.0 - si, 3.0);
    pos = mix(aField.xyz, pos, si);
    alpha *= mix(0.35, 1.0, si);
  }

  pos = rotX(rotY(pos, uRot.x * 0.12), -uRot.y * 0.08);

  float z = CAMERA_Z - pos.z;
  if (z < 0.2) {
    gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
    gl_PointSize = 0.0;
    return;
  }
  vec2 ndc = pos.xy * FOCAL / z;
  ndc.x /= uAspect;

  vec2 away = (ndc - uMouse) * vec2(uAspect, 1.0);
  float reach = length(away);
  float push = uMouseForce * exp(-reach * reach * 22.0) * 0.07;
  ndc += (away / max(reach, 0.0001)) * push * vec2(1.0 / uAspect, 1.0);

  gl_Position = vec4(ndc, 0.0, 1.0);
  gl_PointSize = size * uPixelRatio * (CAMERA_Z / z);
  vColor = color;
  vAlpha = alpha;
}
`;

const PARTICLE_FRAGMENT = /* glsl */ `#version 300 es
precision mediump float;
in vec3 vColor;
in float vAlpha;
out vec4 outColor;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  float glow = (1.0 - d) * (1.0 - d);
  outColor = vec4(vColor * glow * vAlpha, 1.0);
}
`;

const AURORA_VERTEX = /* glsl */ `#version 300 es
in vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;

const AURORA_FRAGMENT = /* glsl */ `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec4 uGlowViolet;  // xy center (aspect-corrected), z radius, w strength
uniform vec4 uGlowMagenta;
uniform vec4 uGlowIndigo;
out vec4 outColor;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

vec3 glow(vec2 p, vec4 g, vec3 color) {
  vec2 d = p - g.xy;
  return color * g.w * exp(-dot(d, d) / (g.z * g.z));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= uResolution.x / uResolution.y;
  float t = uTime * 0.05;

  // #0f0c26 at the bottom to #1a1540 at the top, as in the html.no-webgl fallback.
  vec3 color = mix(vec3(0.059, 0.047, 0.149), vec3(0.102, 0.082, 0.251), smoothstep(0.0, 1.0, uv.y));
  color += vec3(0.08, 0.05, 0.26) * smoothstep(1.7, 0.0, length(p - vec2(0.0, 1.35))) * 0.75;
  color += glow(p + 0.05 * vec2(sin(t * 3.0), cos(t * 2.0)), uGlowViolet, vec3(0.38, 0.22, 1.0));
  color += glow(p + 0.06 * vec2(cos(t * 2.4), sin(t * 3.1)), uGlowMagenta, vec3(0.9, 0.18, 0.58));
  color += glow(p, uGlowIndigo, vec3(0.16, 0.08, 0.5));
  color *= 1.0 - 0.16 * smoothstep(0.7, 1.7, length(uv * 2.0 - 1.0));
  color += (hash(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) * 0.014;
  outColor = vec4(color, 1.0);
}
`;

type Vec4 = [number, number, number, number];

type Layout = {
  aspect: number;
  wide: boolean;
  logo: Vec4;
  ledgerA: Vec4;
  ledgerB: Vec4;
};

/** One illustrated section: which drawing, where (world center and scale), and the tag it lights up. */
type FormTarget = { form: number; place: Vec4; focus: number };

/** Drawing scale for a slot of the given size in world units; drawings may overflow it a little. */
const FORM_FIT: Record<FormName, (width: number, height: number, halfWidth: number) => number> = {
  chain: (w, h) => Math.min(w / 4.8, h / 2.3) * 1.35,
  route: (w, h) => Math.min(w / 4.6, h / 1.9) * 1.35,
  bridge: (w, h) => Math.min(w / 5.0, h / 2.1) * 1.35,
  // The floor stays under the layer stack, clear of the text beside it.
  mesh: (w) => w / 9,
  globe: (w, h) => (Math.min(w, h) / 2.4) * 1.15,
};

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Pixel positions inside the filled CLPR spiral, from an offscreen canvas. */
function sampleSpiral(): { x: number; y: number }[] {
  const width = 600;
  const scale = width / LOGO_BOX.width;
  const height = Math.round(LOGO_BOX.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return [];
  context.setTransform(scale, 0, 0, scale, -LOGO_BOX.x * scale, -LOGO_BOX.y * scale);
  context.fill(new Path2D(CLPR_SPIRAL_PATH));
  const { data } = context.getImageData(0, 0, width, height);
  const inside: { x: number; y: number }[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 127) inside.push({ x: x / scale + LOGO_BOX.x, y: y / scale + LOGO_BOX.y });
    }
  }
  return inside;
}

function buildParticles(count: number) {
  const random = seeded(11);
  const gaussianDirection = () => {
    let x = 0, y = 0, z = 0, length = 0;
    do {
      x = random() * 2 - 1;
      y = random() * 2 - 1;
      z = random() * 2 - 1;
      length = Math.hypot(x, y, z);
    } while (length > 1 || length < 0.001);
    return [x / length, y / length, z / length];
  };

  const spiral = sampleSpiral();
  const maxCoilDistance = Math.hypot(LOGO_COIL.x - LOGO_BOX.x, LOGO_COIL.y - LOGO_BOX.y);
  const logo = new Float32Array(count * 4);
  const ledger = new Float32Array(count * 4);
  const field = new Float32Array(count * 4);
  const rand = new Float32Array(count * 4);

  for (let i = 0; i < count; i++) {
    const o = i * 4;
    const roll = random();
    const kind = roll < 0.07 ? KIND_DUST : roll < 0.46 ? KIND_A : roll < 0.87 ? KIND_B : KIND_CHANNEL;

    // Spiral: 88% fill the mark, 12% orbit around it.
    if (random() < 0.88 && spiral.length) {
      const point = spiral[Math.floor(random() * spiral.length)];
      const px = point.x + random() * 0.2;
      const py = point.y + random() * 0.2;
      const t = 1 - Math.min(1, Math.hypot(px - LOGO_COIL.x, py - LOGO_COIL.y) / maxCoilDistance);
      logo[o] = ((px - LOGO_BOX.x) / LOGO_BOX.width - 0.5) * 2;
      logo[o + 1] = -((py - LOGO_BOX.y) / LOGO_BOX.height - 0.5) * 2 * (LOGO_BOX.height / LOGO_BOX.width);
      logo[o + 2] = (random() - 0.5) * 0.22 + 0.1 * Math.sin(t * Math.PI * 2);
      logo[o + 3] = t;
    } else {
      logo[o] = random() * Math.PI * 2;
      logo[o + 1] = 1.3 + random() * 0.35;
      logo[o + 2] = (random() - 0.5) * 0.05;
      logo[o + 3] = -1;
    }

    // Ledgers: a shell plus a tilted ring; Channel particles keep a small jitter.
    if (kind === KIND_A || kind === KIND_B) {
      if (random() < 0.74) {
        const [x, y, z] = gaussianDirection();
        const radius = 0.9 + random() * 0.1;
        ledger.set([x * radius, y * radius, z * radius], o);
      } else {
        const angle = random() * Math.PI * 2;
        const radius = 1.38 + random() * 0.28;
        let x = Math.cos(angle) * radius;
        let y = (random() - 0.5) * 0.04;
        let z = Math.sin(angle) * radius;
        const tiltX = 0.42;
        [y, z] = [y * Math.cos(tiltX) - z * Math.sin(tiltX), y * Math.sin(tiltX) + z * Math.cos(tiltX)];
        const tiltZ = kind === KIND_A ? 0.35 : -0.35;
        [x, y] = [x * Math.cos(tiltZ) - y * Math.sin(tiltZ), x * Math.sin(tiltZ) + y * Math.cos(tiltZ)];
        ledger.set([x, y, z], o);
      }
    } else {
      const [x, y, z] = gaussianDirection();
      const radius = Math.cbrt(random());
      ledger.set([x * radius, y * radius, z * radius], o);
    }
    ledger[o + 3] = kind;

    field[o] = (random() * 2 - 1) * 7;
    field[o + 1] = (random() * 2 - 1) * 5;
    field[o + 2] = -7 + random() * 8.6;
    field[o + 3] = 0.8 + Math.pow(random(), 3) * 2.4;

    rand.set([random(), random(), random(), random()], o);
  }
  return { logo, ledger, field, rand };
}

function computeLayout(width: number, height: number): Layout {
  const aspect = width / height;
  // Half the visible width and height of the z = 0 plane.
  const halfWidth = (aspect * CAMERA_Z) / FOCAL;
  const halfHeight = CAMERA_Z / FOCAL;
  const wide = aspect >= 1.05;

  const logoScale = wide ? Math.min(1.1, halfWidth * 0.4) : halfWidth * 0.74;
  const logo: Vec4 = wide
    ? [halfWidth * 0.47, halfHeight * 0.02, 0, logoScale]
    : [0, halfHeight * 0.4, 0, logoScale];

  const spread = wide ? Math.min(1.7, halfWidth * 0.52) : halfWidth * 0.52;
  const radius = wide ? Math.min(0.56, halfWidth * 0.17) : halfWidth * 0.22;
  const y = wide ? halfHeight * 0.16 : halfHeight * 0.34;
  return {
    aspect,
    wide,
    logo,
    ledgerA: [-spread, y, 0, radius],
    ledgerB: [spread, y, 0, radius],
  };
}

/** Where a world point lands, in the aspect-corrected space of the aurora shader. */
function projectAspect(x: number, y: number, z: number): [number, number] {
  const depth = CAMERA_Z - z;
  return [(x * FOCAL) / depth, (y * FOCAL) / depth];
}

function compileProgram(gl: WebGL2RenderingContext, vertex: string, fragment: string): WebGLProgram | null {
  const program = gl.createProgram();
  const shaders = [
    [gl.VERTEX_SHADER, vertex],
    [gl.FRAGMENT_SHADER, fragment],
  ] as const;
  for (const [type, source] of shaders) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      return null;
    }
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

function formSections(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-form]"));
}

function formIndex(section: HTMLElement | undefined): number {
  return Math.max(0, FORMS.indexOf((section?.dataset.form ?? "") as FormName));
}

function readScene(viewport: number) {
  // heroShift: how far (px) the hero has scrolled up.
  // outroShift: how far (px) the closing section's center sits below the viewport's center.
  // form: position along the illustrated sections, 1.5 = halfway from the second to the third.
  const target = { state: 0, channel: 0, proof: 0, outro: 0, heroShift: 0, outroShift: 0, form: 0 };
  const hero = document.querySelector<HTMLElement>('[data-scene="hero"]');
  if (hero) target.heroShift = -hero.getBoundingClientRect().top;
  const story = document.querySelector<HTMLElement>('[data-scene="story"]');
  if (story) {
    const rect = story.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - viewport)));
    const leaving = Math.min(1, Math.max(0, 1 - rect.bottom / viewport));
    target.state = smoothstep(0.06, 0.34, progress) + smoothstep(0.05, 0.75, leaving);
    target.channel = smoothstep(0.46, 0.6, progress);
    target.proof = smoothstep(0.68, 0.82, progress);
  }
  // Each illustration takes over as its section's data-form-slot rises into the lower half of the screen.
  const width = window.innerWidth;
  const halfHeight = CAMERA_Z / FOCAL;
  const halfWidth = (width / viewport) * halfHeight;
  const forms: FormTarget[] = formSections().map((section, index) => {
    const slot = section.querySelector<HTMLElement>("[data-form-slot]") ?? section;
    const rect = slot.getBoundingClientRect();
    const form = formIndex(section);
    const x = ((rect.left + rect.width / 2) / width) * 2 - 1;
    const y = 1 - ((rect.top + rect.height / 2) / viewport) * 2;
    const fit = FORM_FIT[FORMS[form]];
    // A full-width slot (phones) leaves no margin to overflow into.
    const overflow = rect.width / width > 0.7 ? 0.78 : 1;
    const scale =
      fit((rect.width / width) * 2 * halfWidth, (rect.height / viewport) * 2 * halfHeight, halfWidth) * overflow;
    if (index > 0) target.form += smoothstep(viewport * 0.95, viewport * 0.55, rect.top + rect.height / 2);
    const focus = Number(section.dataset.formFocus ?? -1);
    return { form, place: [x * halfWidth, y * halfHeight, 0, scale], focus: Number.isFinite(focus) ? focus : -1 };
  });
  const outro = document.querySelector<HTMLElement>('[data-scene="outro"]');
  if (outro) {
    const rect = outro.getBoundingClientRect();
    target.outro = smoothstep(viewport * 0.95, viewport * 0.25, rect.top);
    target.outroShift = rect.top + rect.height / 2 - viewport / 2;
  }
  return { target, forms };
}

export function ProtocolField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const root = document.documentElement;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "high-performance" });
    const particleProgram = gl && compileProgram(gl, PARTICLE_VERTEX, PARTICLE_FRAGMENT);
    const auroraProgram = gl && compileProgram(gl, AURORA_VERTEX, AURORA_FRAGMENT);
    if (!gl || !particleProgram || !auroraProgram) {
      root.classList.add("no-webgl");
      return;
    }
    root.classList.add("has-webgl");

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const small = window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4;
    const count = small ? 9000 : 20000;
    const particles = buildParticles(count);

    const particleVao = gl.createVertexArray();
    gl.bindVertexArray(particleVao);
    const attributes = [
      ["aLogo", particles.logo],
      ["aLedger", particles.ledger],
      ["aField", particles.field],
      ["aRand", particles.rand],
    ] as const;
    for (const [name, data] of attributes) {
      const location = gl.getAttribLocation(particleProgram, name);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, 4, gl.FLOAT, false, 0, 0);
    }

    const auroraVao = gl.createVertexArray();
    gl.bindVertexArray(auroraVao);
    const auroraBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, auroraBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const auroraPosition = gl.getAttribLocation(auroraProgram, "aPosition");
    gl.enableVertexAttribArray(auroraPosition);
    gl.vertexAttribPointer(auroraPosition, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    // One block of texture rows per illustration.
    const forms = buildForms(count);
    const formTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, formTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA32F,
      FORM_TEXTURE_WIDTH,
      forms.rowsPerForm * FORMS.length,
      0,
      gl.RGBA,
      gl.FLOAT,
      forms.data,
    );

    const graphs = new Map<number, Graph>(FORMS.map((name, index) => [index, formGraph(name)]));
    graphs.set(HERO_SCENE, heroGraph());
    graphs.set(STORY_SCENE, storyGraph());
    const network: NetworkLayer | null = createNetworkLayer(gl, graphs);

    const uniform = (program: WebGLProgram, name: string) => gl.getUniformLocation(program, name);
    const u = {
      time: uniform(particleProgram, "uTime"),
      intro: uniform(particleProgram, "uIntro"),
      state: uniform(particleProgram, "uState"),
      channel: uniform(particleProgram, "uChannel"),
      proof: uniform(particleProgram, "uProof"),
      outro: uniform(particleProgram, "uOutro"),
      spiral: uniform(particleProgram, "uSpiral"),
      ledgers: uniform(particleProgram, "uLedgers"),
      aspect: uniform(particleProgram, "uAspect"),
      pixelRatio: uniform(particleProgram, "uPixelRatio"),
      scroll: uniform(particleProgram, "uScroll"),
      mouseForce: uniform(particleProgram, "uMouseForce"),
      mouse: uniform(particleProgram, "uMouse"),
      rot: uniform(particleProgram, "uRot"),
      logo: uniform(particleProgram, "uLogo"),
      ledgerA: uniform(particleProgram, "uLedgerA"),
      ledgerB: uniform(particleProgram, "uLedgerB"),
      forms: uniform(particleProgram, "uForms"),
      rowsPerForm: uniform(particleProgram, "uRowsPerForm"),
      formA: uniform(particleProgram, "uFormA"),
      formB: uniform(particleProgram, "uFormB"),
      formMix: uniform(particleProgram, "uFormMix"),
      placeA: uniform(particleProgram, "uPlaceA"),
      placeB: uniform(particleProgram, "uPlaceB"),
    };
    const a = {
      resolution: uniform(auroraProgram, "uResolution"),
      time: uniform(auroraProgram, "uTime"),
      violet: uniform(auroraProgram, "uGlowViolet"),
      magenta: uniform(auroraProgram, "uGlowMagenta"),
      indigo: uniform(auroraProgram, "uGlowIndigo"),
    };

    // Scenes with their own art (HeroMesh, StoryStage, SpiralRibbon) hide the particle version.
    const heroArt = document.querySelector('[data-scene="hero"] [data-scene-art]') !== null;
    const storyArt = document.querySelector('[data-scene="story"] [data-scene-art]') !== null;
    const outroArt = document.querySelector('[data-scene="outro"] [data-scene-art]') !== null;

    let layout = computeLayout(window.innerWidth, window.innerHeight);
    let pixelRatio = 1;
    const resize = () => {
      pixelRatio = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * pixelRatio));
      canvas.height = Math.max(1, Math.round(rect.height * pixelRatio));
      layout = computeLayout(rect.width, rect.height);
      gl.viewport(0, 0, canvas.width, canvas.height);
      publishAnchors(rect.width, rect.height);
    };

    // Ledger positions as CSS variables, so the story can label them.
    const publishAnchors = (width: number, height: number) => {
      const place = (center: Vec4, prefix: string) => {
        const [x, y] = projectAspect(center[0], center[1], center[2]);
        root.style.setProperty(`--${prefix}-x`, `${((x / layout.aspect) * 0.5 + 0.5) * width}px`);
        root.style.setProperty(`--${prefix}-y`, `${(0.5 - y * 0.5) * height}px`);
      };
      place(layout.ledgerA, "ledger-a");
      place(layout.ledgerB, "ledger-b");
      const [, top] = projectAspect(0, layout.ledgerA[1] + layout.ledgerA[3], 0);
      const [, center] = projectAspect(0, layout.ledgerA[1], 0);
      root.style.setProperty("--ledger-r", `${(top - center) * 0.5 * height}px`);
    };

    const current = { state: 0, channel: 0, proof: 0, outro: 0, heroShift: 0, outroShift: 0, form: 0, intro: 1 };
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, force: 0, lastMove: -10, inside: 0, present: 0 };
    const startedAtTop = window.scrollY < window.innerHeight * 0.5;
    if (startedAtTop && !reducedMotion.matches) current.intro = 0;
    const initial = readScene(window.innerHeight);
    Object.assign(current, { ...initial.target, intro: current.intro });
    let sceneForms = initial.forms;

    let time = 0;
    let last = 0;
    let frame = 0;
    let running = false;

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer.tx = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = 1 - (event.clientY / window.innerHeight) * 2;
      pointer.lastMove = time;
      pointer.inside = 1;
    };
    const onPointerLeave = () => {
      pointer.inside = 0;
    };

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const { state, channel, proof, outro } = current;
      // On narrow screens the spiral scrolls away with the hero instead of sitting
      // behind its text. Near the end it rides along with the closing section.
      const halfHeight = CAMERA_Z / FOCAL;
      const toWorld = halfHeight / (canvas.clientHeight / 2);
      const logo: Vec4 = [...layout.logo];
      if (!layout.wide) logo[1] += current.heroShift * toWorld * (1 - outro);
      logo[1] -= current.outroShift * toWorld * outro;
      const ledgerWeight = smoothstep(0.3, 1, Math.min(state, 2 - Math.min(state, 2))) * (1 - outro);
      const logoWeight = Math.max(1 - Math.min(1, state), outro);
      const spiral = mix(heroArt ? 0 : 1, outroArt ? 0 : 1, outro);
      const fieldWeight = smoothstep(1, 2, state) * (1 - outro);

      const last = Math.max(0, sceneForms.length - 1);
      const indexA = Math.min(Math.floor(current.form), last);
      const indexB = Math.min(indexA + 1, last);
      const formMix = Math.min(1, Math.max(0, current.form - indexA));
      const fallback: FormTarget = { form: 0, place: [0, 0, 0, 1], focus: -1 };
      const { form: formA, place: placeA, focus: focusA } = sceneForms[indexA] ?? fallback;
      const { form: formB, place: placeB, focus: focusB } = sceneForms[indexB] ?? fallback;
      const formAt = projectAspect(mix(placeA[0], placeB[0], formMix), mix(placeA[1], placeB[1], formMix), 0);

      const logoAt = projectAspect(logo[0], logo[1], 0);
      const aAt = projectAspect(layout.ledgerA[0], layout.ledgerA[1], 0);
      const bAt = projectAspect(layout.ledgerB[0], layout.ledgerB[1], 0);
      const violet: Vec4 = [
        mix(mix(logoAt[0] - 0.2, aAt[0], ledgerWeight), formAt[0] - 0.3, fieldWeight),
        mix(mix(logoAt[1] + 0.1, aAt[1], ledgerWeight), formAt[1] + 0.2, fieldWeight),
        mix(mix(0.95, 0.7, ledgerWeight), 1.1, fieldWeight),
        // Dimmer behind the hero illustration, so its warm colors read true.
        0.34 * logoWeight * (heroArt ? mix(0.55, 1, outro) : 1) + 0.3 * ledgerWeight + 0.16 * fieldWeight,
      ];
      const magenta: Vec4 = [
        mix(mix(logoAt[0] + 0.45, bAt[0], ledgerWeight), formAt[0] + 0.5, fieldWeight),
        mix(mix(logoAt[1] - 0.45, bAt[1], ledgerWeight), formAt[1] - 0.4, fieldWeight),
        mix(mix(0.8, 0.7, ledgerWeight), 0.9, fieldWeight),
        0.22 * logoWeight + (0.16 + 0.22 * proof) * ledgerWeight + 0.09 * fieldWeight,
      ];
      const indigo: Vec4 = [0, -1.45, 1.5, 0.55 - 0.25 * fieldWeight];

      gl.disable(gl.BLEND);
      gl.useProgram(auroraProgram);
      gl.bindVertexArray(auroraVao);
      gl.uniform2f(a.resolution, width, height);
      gl.uniform1f(a.time, time);
      gl.uniform4fv(a.violet, violet);
      gl.uniform4fv(a.magenta, magenta);
      gl.uniform4fv(a.indigo, indigo);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.useProgram(particleProgram);
      gl.bindVertexArray(particleVao);
      gl.uniform1f(u.time, time);
      gl.uniform1f(u.intro, current.intro);
      gl.uniform1f(u.state, state);
      gl.uniform1f(u.channel, channel);
      gl.uniform1f(u.proof, proof);
      gl.uniform1f(u.outro, outro);
      gl.uniform1f(u.spiral, spiral);
      gl.uniform1f(u.ledgers, storyArt ? 0 : 1);
      gl.uniform1f(u.aspect, layout.aspect);
      gl.uniform1f(u.pixelRatio, pixelRatio);
      gl.uniform1f(u.scroll, window.scrollY / window.innerHeight);
      gl.uniform1f(u.mouseForce, pointer.force);
      gl.uniform2f(u.mouse, pointer.x, pointer.y);
      gl.uniform2f(u.rot, pointer.x, pointer.y);
      gl.uniform4fv(u.logo, logo);
      gl.uniform4fv(u.ledgerA, layout.ledgerA);
      gl.uniform4fv(u.ledgerB, layout.ledgerB);
      gl.uniform1i(u.forms, 0);
      gl.uniform1i(u.rowsPerForm, forms.rowsPerForm);
      gl.uniform1i(u.formA, formA);
      gl.uniform1i(u.formB, formB);
      gl.uniform1f(u.formMix, formMix);
      gl.uniform4fv(u.placeA, placeA);
      gl.uniform4fv(u.placeB, placeB);
      gl.drawArrays(gl.POINTS, 0, count);

      if (!network) return;
      network.frame({
        time,
        aspect: layout.aspect,
        pixelRatio,
        viewport: [width, height],
        pointer: [pointer.x, pointer.y],
        hover: pointer.present,
        rot: [pointer.x, pointer.y],
        logo,
        ledgerA: layout.ledgerA,
        ledgerB: layout.ledgerB,
        channel,
        proof,
      });
      network.draw(HERO_SCENE, [0, 0, 0, 1], logoWeight * spiral * smoothstep(0.45, 1, current.intro));
      network.draw(STORY_SCENE, [0, 0, 0, 1], storyArt ? 0 : ledgerWeight);
      if (indexA === indexB) {
        network.draw(formA, placeA, fieldWeight, focusA);
      } else {
        network.draw(formA, placeA, fieldWeight * smoothstep(1, 0.35, formMix), focusA);
        network.draw(formB, placeB, fieldWeight * smoothstep(0, 0.65, formMix), focusB);
      }
    };

    const tick = (now: number) => {
      if (!running) return;
      const delta = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      time += delta;

      const { target, forms: nextForms } = readScene(window.innerHeight);
      sceneForms = nextForms;
      const ease = 1 - Math.exp(-delta * 3.2);
      current.state += (target.state - current.state) * ease;
      current.channel += (target.channel - current.channel) * ease;
      current.proof += (target.proof - current.proof) * ease;
      current.outro += (target.outro - current.outro) * ease;
      // A long jump (a nav link) only animates the last step, not every picture in between.
      if (Math.abs(target.form - current.form) > 1) current.form = target.form - Math.sign(target.form - current.form);
      current.form += (target.form - current.form) * ease;
      current.heroShift = target.heroShift;
      current.outroShift = target.outroShift;
      current.intro = Math.min(1, current.intro + delta / 3.4);

      const moving = time - pointer.lastMove < 1.2 ? 1 : 0;
      const follow = 1 - Math.exp(-delta * 2.5);
      pointer.x += (pointer.tx - pointer.x) * follow;
      pointer.y += (pointer.ty - pointer.y) * follow;
      pointer.force += (moving - pointer.force) * (1 - Math.exp(-delta * 4));
      pointer.present += (pointer.inside - pointer.present) * (1 - Math.exp(-delta * 3));

      draw();
      frame = requestAnimationFrame(tick);
    };

    // Reduced motion: no clock, no pointer; redraw only when the visitor scrolls.
    const drawStill = () => {
      const { target, forms: nextForms } = readScene(window.innerHeight);
      sceneForms = nextForms;
      Object.assign(current, target, { intro: 1 });
      draw();
    };

    const sync = () => {
      const shouldRun = !reducedMotion.matches && !document.hidden;
      if (shouldRun && !running) {
        running = true;
        last = 0;
        frame = requestAnimationFrame(tick);
      } else if (!shouldRun && running) {
        running = false;
        cancelAnimationFrame(frame);
      }
      if (reducedMotion.matches) drawStill();
    };

    const onScroll = () => {
      if (reducedMotion.matches) drawStill();
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (!running) drawStill();
    });
    resizeObserver.observe(canvas);

    const onContextLost = (event: Event) => {
      event.preventDefault();
      running = false;
      cancelAnimationFrame(frame);
      root.classList.remove("has-webgl");
      root.classList.add("no-webgl");
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    canvas.addEventListener("webglcontextlost", onContextLost);
    reducedMotion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    resize();
    sync();

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      reducedMotion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      root.classList.remove("has-webgl");
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="protocol-field" />;
}
