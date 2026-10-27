/*
 * Draws the sceneGraphs.ts graphs over ProtocolField's particles as instanced quads.
 * All motion happens in the vertex shaders, so the buffers never change after start-up.
 */

import { SCENE_GLSL } from "@/components/sceneMotion";
import { ROLES, type Graph, type Role } from "@/components/sceneGraphs";

const role = (name: Role) => ROLES.indexOf(name);

/** Scene indices of the hero and story graphs; section graphs use their FORMS index. */
export const HERO_SCENE = 98;
export const STORY_SCENE = 99;

export type Vec4 = [number, number, number, number];

/** Values shared by every draw in one frame. */
export type NetworkFrame = {
  time: number;
  aspect: number;
  pixelRatio: number;
  viewport: [number, number];
  /** Pointer in normalized device coordinates, and how present it is (0 – 1). */
  pointer: [number, number];
  hover: number;
  rot: [number, number];
  logo: Vec4;
  ledgerA: Vec4;
  ledgerB: Vec4;
  channel: number;
  proof: number;
};

const COMMON_GLSL = /* glsl */ `
uniform float uTime;
uniform float uAspect;
uniform float uPixelRatio;
uniform vec2 uViewport;
uniform vec2 uPointer;
uniform float uHover;
uniform vec2 uRot;
uniform vec4 uLogo;
uniform vec4 uLedgerA;
uniform vec4 uLedgerB;
uniform float uChannel;
uniform float uProof;
uniform int uScene;
uniform vec4 uPlace;   // section scenes: center xyz, scale
uniform float uPresence;
uniform float uFocus;  // tag to light up, or -1

const int HERO_SCENE = ${HERO_SCENE};
const int STORY_SCENE = ${STORY_SCENE};

float gateValue(float gate) {
  if (gate < 0.5) return 1.0;
  if (gate < 1.5) return uChannel;
  return uProof;
}

// How far an element has built itself, from its place in the build order.
float build(float presence, float order) {
  float s = clamp(presence * 1.6 - order * 0.6, 0.0, 1.0);
  return s * s * (3.0 - 2.0 * s);
}

// Quadratic Bézier (mode 0) or a great-circle arc lifted off the sphere (mode 1).
vec3 curvePoint(vec3 a, vec3 c, vec3 b, float mode, float u) {
  if (mode > 0.5) return normalize(mix(a, b, u)) * length(a) * (1.0 + c.x * sin(PI * u));
  float v = 1.0 - u;
  return v * v * a + 2.0 * v * u * c + u * u * b;
}

// Story: ledgers turn around the Channel axis; the Channel spans Endpoint A (x = −1) to B (x = 1).
vec3 toWorld(vec3 p, float group, float seed, float crumble, inout float alpha) {
  if (uScene == HERO_SCENE) {
    // A ring around the spiral, seen a little from above; its far side passes behind and dims.
    float angle = p.x + uTime * 0.07;
    vec3 q = rotZ(rotX(vec3(cos(angle) * p.y, p.z, sin(angle) * p.y), 0.36), -0.3);
    alpha *= mix(0.22, 1.0, smoothstep(-0.5, 0.35, q.z));
    return q * uLogo.w + uLogo.xyz;
  }
  if (uScene == STORY_SCENE) {
    if (group < 0.5) return rotX(p, uTime * 0.16) * uLedgerA.w + uLedgerA.xyz;
    if (group < 1.5) return rotX(p, -uTime * 0.13) * uLedgerB.w + uLedgerB.xyz;
    vec3 ea = uLedgerA.xyz + vec3(uLedgerA.w, 0.0, 0.0);
    vec3 eb = uLedgerB.xyz - vec3(uLedgerB.w, 0.0, 0.0);
    return mix(ea, eb, p.x * 0.5 + 0.5) + vec3(0.0, p.y, p.z) * uLedgerA.w;
  }
  p = animateForm(uScene, p, uTime, seed, crumble, alpha);
  return p * uPlace.w + uPlace.xyz;
}

float sceneScale(float group) {
  if (uScene == HERO_SCENE) return uLogo.w;
  if (uScene == STORY_SCENE) return group > 0.5 && group < 1.5 ? uLedgerB.w : uLedgerA.w;
  return uPlace.w;
}

// Screen position in device pixels (xy), distance from the camera (z), and whether it is in front (w).
vec4 project(vec3 p) {
  p = rotX(rotY(p, uRot.x * 0.12), -uRot.y * 0.08);
  float z = CAMERA_Z - p.z;
  if (z < 0.2) return vec4(0.0, 0.0, z, 0.0);
  vec2 ndc = p.xy * FOCAL / z;
  ndc.x /= uAspect;
  return vec4((ndc * 0.5 + 0.5) * uViewport, z, 1.0);
}

vec2 pointerPixels() {
  return (uPointer * 0.5 + 0.5) * uViewport;
}

// flags = group + 4 × gate + 16 × crumble + 32 × reverse
void decodeFlags(float flags, out float group, out float gate, out float crumble, out float reverse) {
  group = mod(flags, 4.0);
  gate = mod(floor(flags / 4.0), 4.0);
  crumble = mod(floor(flags / 16.0), 2.0);
  reverse = mod(floor(flags / 32.0), 2.0);
}

// Packet timing: where along its link a packet is (0 – 1), or −1 while it waits.
float travel(vec4 timing) {
  float cycle = fract(uTime * timing.x + timing.y);
  float local = (cycle - timing.z) / max(timing.w, 0.0001);
  return local < 0.0 || local > 1.0 ? -1.0 : local;
}
`;

const STROKE_VERTEX = /* glsl */ `#version 300 es
precision highp float;

in vec2 aCorner;  // x: 0 at the start, 1 at the end; y: −1 / 1 across
in vec4 iA;       // xyz: link start, w: curve mode
in vec4 iC;       // xyz: control point, w: width (px)
in vec4 iB;       // xyz: link end, w: alpha
in vec4 iU;       // xy: part of the link this segment draws (packets: x = trail length); zw: tone at both ends
in vec4 iT;       // packets: speed, phase, start, duration; links: 0
in vec4 iF;       // flags, seed, build order, dashes
in vec4 iG;       // tags of the two ends

out vec3 vColor;
out float vAlpha;
out float vAcross;
out float vHalf;
out float vCore;
out float vHalo;
out float vU;
out float vDash;
out float vTrail;
out float vSpread;
out float vSeed;
out float vPacket;

${SCENE_GLSL}
${COMMON_GLSL}

void hide() {
  gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
  vAlpha = 0.0;
}

void main() {
  float group, gate, crumble, reverse;
  decodeFlags(iF.x, group, gate, crumble, reverse);
  float q = build(gateValue(gate) * uPresence, iF.z);
  float alpha = iB.w;
  float u0 = iU.x;
  float u1 = iU.y;
  float head = 0.0;
  bool packet = iT.x > 0.0;
  if (packet) {
    float local = travel(iT);
    if (local < 0.0 || q < 0.98) { hide(); return; }
    head = reverse > 0.5 ? 1.0 - local : local;
    u0 = reverse > 0.5 ? head : max(0.0, head - iU.x);
    u1 = reverse > 0.5 ? min(1.0, head + iU.x) : head;
    alpha *= smoothstep(0.0, 0.1, local) * smoothstep(1.0, 0.9, local);
  } else {
    u1 = min(u1, q);
  }
  if (u1 <= u0 + 0.00001) { hide(); return; }

  float alpha0 = alpha;
  float alpha1 = alpha;
  vec4 s0 = project(toWorld(curvePoint(iA.xyz, iC.xyz, iB.xyz, iA.w, u0), group, iF.y, crumble, alpha0));
  vec4 s1 = project(toWorld(curvePoint(iA.xyz, iC.xyz, iB.xyz, iA.w, u1), group, iF.y, crumble, alpha1));
  if (s0.w < 0.5 || s1.w < 0.5) { hide(); return; }

  vec2 along = s1.xy - s0.xy;
  float len = length(along);
  vec2 dir = len > 0.001 ? along / len : vec2(1.0, 0.0);
  vec2 normal = vec2(-dir.y, dir.x);
  float end = aCorner.x;

  vec2 middle = mix(s0.xy, s1.xy, 0.5);
  float reach = 150.0 * uPixelRatio;
  float hover = uHover * exp(-pow(distance(middle, pointerPixels()) / reach, 2.0));
  float focused = uFocus >= 0.0 && (abs(iG.x - uFocus) < 0.5 || abs(iG.y - uFocus) < 0.5) ? 1.0 : 0.0;
  float dimmed = uFocus >= 0.0 ? mix(0.55, 1.9, focused) : 1.0;

  float perspective = clamp(CAMERA_Z / mix(s0.z, s1.z, end), 0.55, 1.6);
  float core = iC.w * uPixelRatio * perspective * (1.0 + 0.4 * hover + 0.45 * focused);
  float halo = core * 1.5 + 1.6 * uPixelRatio;
  // How far the outer fibres of a link fan out from its center line (px).
  float spread = packet ? 0.0 : (2.0 * uPixelRatio + core * 1.4);
  float extent = core * 0.5 + halo * 2.4 + spread;

  vec2 pixel = mix(s0.xy, s1.xy, end) + normal * aCorner.y * extent;
  gl_Position = vec4(pixel / uViewport * 2.0 - 1.0, 0.0, 1.0);

  vU = mix(u0, u1, end);
  vAcross = aCorner.y;
  vHalf = extent;
  vCore = core * 0.5;
  vHalo = halo;
  vDash = iF.w;
  vSpread = spread;
  vSeed = iF.y;
  vPacket = packet ? 1.0 : 0.0;
  vTrail = packet ? clamp(reverse > 0.5 ? 1.0 - (vU - head) / iU.x : 1.0 - (head - vU) / iU.x, 0.0, 1.0) : 1.0;
  vColor = palette(mix(iU.z, iU.w, vU));
  vAlpha = mix(alpha0, alpha1, end) * (1.0 + 1.3 * hover) * dimmed * (packet ? 1.6 : 1.0);
}
`;

const STROKE_FRAGMENT = /* glsl */ `#version 300 es
precision highp float;
in vec3 vColor;
in float vAlpha;
in float vAcross;
in float vHalf;
in float vCore;
in float vHalo;
in float vU;
in float vDash;
in float vTrail;
in float vSpread;
in float vSeed;
in float vPacket;
uniform float uPixelRatio;
out vec4 outColor;

void main() {
  if (vAlpha <= 0.001) discard;
  float across = vAcross * vHalf;
  float d = abs(across);
  float light;
  float white;
  if (vPacket > 0.5) {
    float core = 1.0 - smoothstep(vCore - 0.5, vCore + 0.75, d);
    light = core + exp(-(d * d) / (vHalo * vHalo)) * 0.42;
    white = core * 0.35;
  } else {
    float belly = sin(3.14159265 * clamp(vU, 0.0, 1.0));
    float width = 0.6 * uPixelRatio;
    float fibres = 0.0;
    for (int k = 0; k < 5; k++) {
      float lane = float(k) * 0.5 - 1.0;
      float jitter = fract(sin((vSeed * 13.0 + float(k)) * 78.233) * 43758.5453) - 0.5;
      float offset = (lane * 0.85 + jitter * 0.4) * vSpread * belly;
      fibres += 1.0 - smoothstep(width * 0.4, width * 1.7, abs(across - offset));
    }
    light = fibres * 0.4 + exp(-(d * d) / (vHalo * vHalo)) * 0.08;
    white = 0.08;
  }
  if (vDash > 0.0) {
    float f = fract(vU * vDash);
    float w = max(fwidth(vU * vDash), 0.0001);
    light *= smoothstep(0.0, w, f) * (1.0 - smoothstep(0.55 - w, 0.55 + w, f));
  }
  light *= vTrail * vTrail;
  vec3 color = mix(vColor, vec3(1.0), white) * light * vAlpha;
  outColor = vec4(color, 0.0);
}
`;

const GLYPH_VERTEX = /* glsl */ `#version 300 es
precision highp float;

in vec2 aCorner;  // −1 … 1
in vec4 gP;       // xyz: position (riding packets: link start), w: size
in vec4 gC;       // riding packets: xyz control point, w curve mode
in vec4 gB;       // riding packets: xyz link end; w: tone
in vec4 gT;       // riding packets: speed, phase, start, duration; nodes: 0
in vec4 gF;       // flags, seed, build order, role
in vec4 gX;       // alpha, ripple speed, ripple phase, tag

out vec2 vUV;
out float vPx;
out vec3 vColor;
out float vAlpha;
flat out int vRole;
out float vPulse;
out float vHover;

${SCENE_GLSL}
${COMMON_GLSL}

void hide() {
  gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
  vAlpha = 0.0;
}

void main() {
  float group, gate, crumble, reverse;
  decodeFlags(gF.x, group, gate, crumble, reverse);
  int kind = int(gF.w + 0.5);
  float q = build(gateValue(gate) * uPresence, gF.z);
  float alpha = gX.x;
  vec3 local = gP.xyz;
  float grow;
  if (gT.x > 0.0) {
    float t = travel(gT);
    if (t < 0.0 || q < 0.98) { hide(); return; }
    local = curvePoint(gP.xyz, gC.xyz, gB.xyz, gC.w, reverse > 0.5 ? 1.0 - t : t);
    alpha *= smoothstep(0.0, 0.08, t) * smoothstep(1.0, 0.92, t);
    grow = 1.0;
  } else {
    if (q <= 0.001) { hide(); return; }
    // Pop in with a little overshoot.
    float s = q - 1.0;
    grow = 1.0 + 2.2 * s * s * s + 1.2 * s * s;
  }

  vec4 s = project(toWorld(local, group, gF.y, crumble, alpha));
  if (s.w < 0.5 || alpha <= 0.001) { hide(); return; }

  float hover = uHover * exp(-pow(distance(s.xy, pointerPixels()) / (110.0 * uPixelRatio), 2.0));
  float focused = uFocus >= 0.0 && abs(gX.w - uFocus) < 0.5 ? 1.0 : 0.0;
  float radius = gP.w * sceneScale(group) * FOCAL / s.z * uViewport.y * 0.5;
  radius = max(radius, 1.3 * uPixelRatio) * grow * (1.0 + 0.28 * hover + 0.45 * focused);

  float extent = kind == ${role("atmosphere")} ? 1.4 : kind == ${role("ripple")} ? 3.8 : 4.2;
  vec2 pixel = s.xy + aCorner * radius * extent;
  gl_Position = vec4(pixel / uViewport * 2.0 - 1.0, 0.0, 1.0);

  vUV = aCorner * extent;
  vPx = radius;
  vRole = kind;
  vColor = palette(gB.w);
  vAlpha = alpha * (1.0 + 0.7 * hover) * (uFocus >= 0.0 ? mix(0.6, 1.5, focused) : 1.0);
  vHover = hover;
  vPulse = gX.y > 0.0 ? fract(uTime * gX.y + gX.z) : focused > 0.5 ? fract(uTime * 0.55) : -1.0;
}
`;

const GLYPH_FRAGMENT = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUV;
in float vPx;
in vec3 vColor;
in float vAlpha;
flat in int vRole;
in float vPulse;
in float vHover;
uniform float uPixelRatio;
out vec4 outColor;

// A line of the given width (px) at distance d (in core radii) from a shape's edge.
float stroke(float d, float width) {
  float px = abs(d) * vPx;
  float w = width * uPixelRatio * 0.5;
  return 1.0 - smoothstep(w - 0.5, w + 0.8, px);
}

// Solid shape coverage, anti-aliased over one pixel.
float fill(float d) {
  return 1.0 - smoothstep(-0.5, 0.8, d * vPx);
}

// A soft star with four thin rays.
vec3 star(vec2 uv, vec3 base) {
  float r2 = dot(uv, uv);
  float core = exp(-r2 * 6.0);
  float halo = exp(-r2 * 0.9) * 0.5;
  float rays = exp(-abs(uv.y) * 10.0) * exp(-abs(uv.x) * 0.85) + exp(-abs(uv.x) * 10.0) * exp(-abs(uv.y) * 0.85);
  return base * halo + mix(base, vec3(1.0), 0.7) * (core * 1.2 + rays * 0.45);
}

float hexagon(vec2 p) {
  p = abs(p);
  return max(p.x * 0.8660254 + p.y * 0.5, p.y);
}

void main() {
  if (vAlpha <= 0.001) discard;
  vec2 uv = vUV;
  float r = length(uv);
  vec3 base = vColor;
  vec3 color = vec3(0.0);  // occluding body (premultiplied by cover)
  float cover = 0.0;
  vec3 glow = vec3(0.0);   // additive light
  float halo = exp(-r * r * 0.5);

  if (vRole == ${role("validator")} || vRole == ${role("city")} || vRole == ${role("leaf")}) {
    glow = star(uv, base) * (vRole == ${role("leaf")} ? 0.85 : 1.0);
  } else if (vRole == ${role("hub")}) {
    glow = star(uv * 0.8, base) * 1.2 + base * stroke(r - 2.1, 1.0) * 0.35;
  } else if (vRole == ${role("endpoint")}) {
    float hex = hexagon(uv);
    cover = fill(hex - 1.55) * 0.6;
    color = vec3(0.03, 0.025, 0.06) * cover;
    glow = star(uv * 1.4, base) * 0.7 + base * stroke(hex - 1.55, 1.3) * 0.95;
  } else if (vRole == ${role("verifier")}) {
    float diamond = (abs(uv.x) + abs(uv.y)) / 1.2;
    cover = fill((diamond - 1.2) * 1.2) * 0.6;
    color = vec3(0.03, 0.025, 0.06) * cover;
    glow = star(uv * 1.4, base) * 0.6 + base * stroke((diamond - 1.2) * 1.2, 1.3) * 0.95;
  } else if (vRole == ${role("custodian")}) {
    float box = max(abs(uv.x), abs(uv.y));
    cover = fill(box - 1.0) * 0.8;
    color = vec3(0.04, 0.04, 0.06) * cover;
    glow = base * (stroke(box - 1.0, 1.3) * 0.9 + fill(box - 0.36) * 0.6 + halo * 0.18);
  } else if (vRole == ${role("commit")}) {
    cover = fill(r - 1.0);
    color = vec3(0.03, 0.025, 0.06) * cover;
    glow = base * (stroke(r - 0.82, 1.6) * 1.1 + fill(r - 0.34) * 0.9 + halo * 0.3);
  } else if (vRole == ${role("packet")}) {
    float core = 1.0 - smoothstep(0.0, 1.0, r);
    glow = mix(base, vec3(1.0), 0.6 * core) * (core * 1.4 + halo * 0.9);
  } else if (vRole == ${role("proof")}) {
    float ring = stroke(r - 1.0, 1.5);
    float ticks = stroke(r - 1.32, 1.2) * step(0.82, abs(cos(atan(uv.y, uv.x) * 2.0)));
    glow = base * (ring * 1.2 + ticks * 0.8 + exp(-pow((r - 1.0) * 3.0, 2.0)) * 0.35);
  } else if (vRole == ${role("atmosphere")}) {
    float rim = exp(-pow((r - 1.0) * vPx / (6.0 * uPixelRatio), 2.0));
    float inner = smoothstep(0.55, 1.0, r) * step(r, 1.0) * pow(r, 6.0);
    float outer = step(1.0, r) * exp(-(r - 1.0) * 9.0);
    glow = base * (rim * 0.32 + inner * 0.14 + outer * 0.22);
  }

  if (vPulse >= 0.0) {
    float start = vRole == ${role("ripple")} ? 0.6 : 1.2;
    float radius = start + vPulse * 2.6;
    float fade = (1.0 - vPulse) * (1.0 - vPulse);
    glow += base * stroke(r - radius, 1.4) * fade * 1.2 + base * exp(-pow((r - radius) * 2.2, 2.0)) * fade * 0.25;
  }
  glow *= 1.0 + vHover * 0.5;

  outColor = vec4((color + glow) * vAlpha, cover * min(1.0, vAlpha));
}
`;

function compile(gl: WebGL2RenderingContext, vertex: string, fragment: string): WebGLProgram | null {
  const program = gl.createProgram();
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertex],
    [gl.FRAGMENT_SHADER, fragment],
  ] as const) {
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

const flags = (group: number, gate: number, crumble: boolean, reverse: boolean) =>
  group + gate * 4 + (crumble ? 16 : 0) + (reverse ? 32 : 0);

const STROKE_ATTRIBUTES = ["iA", "iC", "iB", "iU", "iT", "iF", "iG"] as const;
const GLYPH_ATTRIBUTES = ["gP", "gC", "gB", "gT", "gF", "gX"] as const;

function packStrokes(graph: Graph): Float32Array {
  const values: number[] = [];
  for (const link of graph.links) {
    const head = [...link.a, link.mode, ...link.c, link.width, ...link.b, link.alpha];
    const tail = [flags(link.group, link.gate, link.crumble, false), link.seed, link.order, link.dash, ...link.tags, 0, 0];
    for (let s = 0; s < link.segments; s++) {
      values.push(...head, s / link.segments, (s + 1) / link.segments, ...link.tone, 0, 0, 0, 0, ...tail);
    }
  }
  for (const packet of graph.packets) {
    if (packet.tail <= 0) continue;
    const link = graph.links[packet.link];
    values.push(
      ...link.a, link.mode, ...link.c, packet.width, ...link.b, packet.alpha,
      packet.tail, 0, packet.tone, packet.tone,
      packet.speed, packet.phase, packet.start, packet.duration,
      flags(link.group, packet.gate, link.crumble, packet.reverse), link.seed, link.order, 0,
      ...link.tags, 0, 0,
    );
  }
  return new Float32Array(values);
}

function packGlyphs(graph: Graph): Float32Array {
  const values: number[] = [];
  for (const node of graph.nodes) {
    values.push(
      ...node.at, node.size, 0, 0, 0, 0, 0, 0, 0, node.tone,
      0, 0, 0, 0,
      flags(node.group, node.gate, node.crumble, false), node.seed, node.order, ROLES.indexOf(node.role),
      node.alpha, ...node.pulse, node.tag,
    );
  }
  for (const packet of graph.packets) {
    const link = graph.links[packet.link];
    values.push(
      ...link.a, packet.size, ...link.c, link.mode, ...link.b, packet.tone,
      packet.speed, packet.phase, packet.start, packet.duration,
      flags(link.group, packet.gate, link.crumble, packet.reverse), link.seed, link.order, ROLES.indexOf(packet.role),
      packet.alpha, 0, 0, -1,
    );
  }
  return new Float32Array(values);
}

type Batch = { vao: WebGLVertexArrayObject; count: number };

function createBatch(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  corners: WebGLBuffer,
  data: Float32Array,
  names: readonly string[],
): Batch {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, corners);
  const corner = gl.getAttribLocation(program, "aCorner");
  gl.enableVertexAttribArray(corner);
  gl.vertexAttribPointer(corner, 2, gl.FLOAT, false, 0, 0);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  const stride = names.length * 16;
  names.forEach((name, index) => {
    const location = gl.getAttribLocation(program, name);
    if (location < 0) return;
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 4, gl.FLOAT, false, stride, index * 16);
    gl.vertexAttribDivisor(location, 1);
  });
  gl.bindVertexArray(null);
  return { vao, count: data.length / (names.length * 4) };
}

export function createNetworkLayer(gl: WebGL2RenderingContext, scenes: Map<number, Graph>) {
  const strokeProgram = compile(gl, STROKE_VERTEX, STROKE_FRAGMENT);
  const glyphProgram = compile(gl, GLYPH_VERTEX, GLYPH_FRAGMENT);
  if (!strokeProgram || !glyphProgram) return null;

  const strokeCorners = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, strokeCorners);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, -1, 1, -1, 0, 1, 1, 1]), gl.STATIC_DRAW);
  const glyphCorners = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, glyphCorners);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  const batches = new Map<number, { strokes: Batch; glyphs: Batch }>();
  for (const [scene, graph] of scenes) {
    batches.set(scene, {
      strokes: createBatch(gl, strokeProgram, strokeCorners, packStrokes(graph), STROKE_ATTRIBUTES),
      glyphs: createBatch(gl, glyphProgram, glyphCorners, packGlyphs(graph), GLYPH_ATTRIBUTES),
    });
  }

  const programs = [strokeProgram, glyphProgram];
  const locations = programs.map((program) => {
    const cache = new Map<string, WebGLUniformLocation | null>();
    return (name: string) => {
      if (!cache.has(name)) cache.set(name, gl.getUniformLocation(program, name));
      return cache.get(name) ?? null;
    };
  });
  const each = (set: (at: (name: string) => WebGLUniformLocation | null) => void) => {
    programs.forEach((program, index) => {
      gl.useProgram(program);
      set(locations[index]);
    });
  };

  return {
    frame(frame: NetworkFrame) {
      each((at) => {
        gl.uniform1f(at("uTime"), frame.time);
        gl.uniform1f(at("uAspect"), frame.aspect);
        gl.uniform1f(at("uPixelRatio"), frame.pixelRatio);
        gl.uniform2f(at("uViewport"), ...frame.viewport);
        gl.uniform2f(at("uPointer"), ...frame.pointer);
        gl.uniform1f(at("uHover"), frame.hover);
        gl.uniform2f(at("uRot"), ...frame.rot);
        gl.uniform4fv(at("uLogo"), frame.logo);
        gl.uniform4fv(at("uLedgerA"), frame.ledgerA);
        gl.uniform4fv(at("uLedgerB"), frame.ledgerB);
        gl.uniform1f(at("uChannel"), frame.channel);
        gl.uniform1f(at("uProof"), frame.proof);
      });
    },

    /** One scene: its links first (added light), then its nodes (which hide the links behind them). */
    draw(scene: number, place: Vec4, presence: number, focus = -1) {
      const batch = batches.get(scene);
      if (!batch || presence < 0.002) return;
      each((at) => {
        gl.uniform1i(at("uScene"), scene);
        gl.uniform4fv(at("uPlace"), place);
        gl.uniform1f(at("uPresence"), presence);
        gl.uniform1f(at("uFocus"), focus);
      });
      gl.enable(gl.BLEND);
      gl.useProgram(strokeProgram);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.bindVertexArray(batch.strokes.vao);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, batch.strokes.count);
      gl.useProgram(glyphProgram);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.bindVertexArray(batch.glyphs.vao);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, batch.glyphs.count);
      gl.bindVertexArray(null);
    },
  };
}

export type NetworkLayer = NonNullable<ReturnType<typeof createNetworkLayer>>;

