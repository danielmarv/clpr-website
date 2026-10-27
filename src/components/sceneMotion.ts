// Shared by ProtocolField and networkLayer.ts, which must move the same drawing the same way.

export const CAMERA_Z = 4.2;
export const FOCAL = 1 / Math.tan((40 / 2) * (Math.PI / 180));

/** The section illustrations, in the order the shaders index them. Sections pick one with `data-form`. */
export const FORMS = [
  "chain",
  "route",
  "bridge",
  "mesh",
  "globe",
  "branches",
  "community",
] as const;
export type FormName = (typeof FORMS)[number];

const form = (name: FormName) => FORMS.indexOf(name);

export const SCENE_GLSL = /* glsl */ `
const float PI = 3.14159265;
const float CAMERA_Z = ${CAMERA_Z.toFixed(4)};
const float FOCAL = ${FOCAL.toFixed(4)};

vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }
vec3 rotX(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z); }
vec3 rotZ(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x - s * p.y, s * p.x + c * p.y, p.z); }

// Violet tail → magenta bowl → pink → peach coil, as in the CLPR artwork.
// A negative tone is the cold grey of things CLPR does without (bridges, custodians).
vec3 palette(float t) {
  if (t < 0.0) return vec3(0.6, 0.6, 0.72);
  vec3 violet = vec3(0.52, 0.44, 1.0);
  vec3 magenta = vec3(0.84, 0.32, 0.86);
  vec3 pink = vec3(1.0, 0.38, 0.62);
  vec3 peach = vec3(1.0, 0.72, 0.6);
  if (t < 0.4) return mix(violet, magenta, t / 0.4);
  if (t < 0.75) return mix(magenta, pink, (t - 0.4) / 0.35);
  return mix(pink, peach, min(1.0, (t - 0.75) / 0.25));
}

// Motion of each illustration, in the order of FORMS. seed: 0–1 per element.
// crumble: 1 for the parts of the bridge that fall apart.
vec3 animateForm(int form, vec3 p, float t, float seed, float crumble, inout float alpha) {
  if (form == ${form("chain")}) {
    p = rotX(rotY(p, -0.15 + sin(t * 0.15) * 0.25), 0.12);
  } else if (form == ${form("route")}) {
    p = rotX(rotY(p, -0.42 + sin(t * 0.13) * 0.14), 0.24);
  } else if (form == ${form("bridge")}) {
    if (crumble > 0.5) {
      float cycle = fract(t * 0.05 + seed);
      float fall = clamp((cycle - 0.62) / 0.38, 0.0, 1.0);
      p.y -= fall * fall * 2.0;
      p.x += (fract(seed * 7.13) - 0.5) * fall * 0.7;
      p.z += (fract(seed * 3.71) - 0.5) * fall * 0.5;
      alpha *= (1.0 - fall) * smoothstep(0.0, 0.08, cycle);
    }
    p = rotX(rotY(p, -0.26 + sin(t * 0.12) * 0.12), 0.2);
  } else if (form == ${form("mesh")}) {
    float wave = sin(p.x * 1.3 + t * 0.5) * cos(p.z * 0.9 + t * 0.35);
    p.y = -1.25 + 0.18 * wave + 0.06 * sin(p.x * 2.7 - p.z * 1.9 + t * 0.8);
    alpha *= 0.5 + 0.75 * max(0.0, wave);
  } else if (form == ${form("globe")}) {
    // The far side shows only faintly through.
    p = rotX(rotY(p, t * 0.06 - 0.45), 0.36);
    float behind = smoothstep(0.02, -0.22, p.z) * smoothstep(1.08, 0.92, length(p.xy));
    alpha *= 1.0 - 0.88 * behind;
  } else if (form == ${form("branches")}) {
    p = rotX(rotY(p, -0.35 + sin(t * 0.14) * 0.15), 0.22);
  } else {
    p = rotX(rotY(p, -0.2 + t * 0.04), 0.2);
  }
  return p;
}
`;
