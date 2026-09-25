const FLOW = `
vec3 flow(vec3 q) {
  return vec3(
    sin(q.y * 1.9 + q.z * 0.7) + 0.5 * sin(q.z * 3.1 + q.x * 1.3),
    sin(q.z * 1.7 + q.x * 1.1) + 0.5 * sin(q.x * 2.9 + q.y * 1.7),
    sin(q.x * 1.5 + q.y * 0.9) + 0.5 * sin(q.y * 3.3 + q.z * 1.9)
  ) * 0.55;
}
`

const ROTATE = `
vec3 rotateY(vec3 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

vec3 rotateX(vec3 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
}
`

const CHOREOGRAPHY = `
${FLOW}
${ROTATE}
uniform float uTime;
uniform float uGlobeRot;
uniform vec3 uGlobe;
uniform float uGlobeR;
uniform float uNameZ;
uniform float uBeamLength;
uniform vec3 uCamVel;
uniform float uStreak;
uniform float uIntro;
uniform float uHover;
uniform float uWall;
attribute vec3 aBeam;
attribute vec3 aGlobe;
attribute vec3 aName;
attribute vec4 aSeed;
attribute vec4 aTone;
varying vec3 vColor;
varying float vAlpha;

const vec3 GOLD = vec3(0.878, 0.643, 0.345);
const vec3 CREAM = vec3(0.953, 0.890, 0.765);
const vec3 BRONZE = vec3(0.55, 0.39, 0.22);
const vec3 HOT = vec3(1.0, 0.93, 0.8);
const vec3 LAND = vec3(0.78, 0.57, 0.32);
const vec3 OCEAN = vec3(0.36, 0.29, 0.2);

float compaction(float t) {
  float c = clamp((t - 3.9 - aSeed.y * 0.5) / 1.1, 0.0, 1.0);
  return c * c * (3.0 - 2.0 * c);
}

float easeInOut(float t) {
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

float easeOutBack(float t) {
  float c1 = 1.20158;
  float c3 = c1 + 1.0;
  return 1.0 + c3 * pow(t - 1.0, 3.0) + c1 * pow(t - 1.0, 2.0);
}

float phase(float t, float start, float span, float delay) {
  return clamp((t - start - delay * span * 0.55) / (span * 0.45), 0.0, 1.0);
}

vec3 choreograph(float t, out float k1, out float k2, out float k3, out float speed) {
  float role = aTone.w;
  float along = -aBeam.z / uBeamLength;

  vec3 button = position;
  float idle = 1.0 - step(0.6001, t);
  button.xy *= 1.0 + 0.045 * uHover * idle;
  button += vec3(sin(uWall * 1.7 + aSeed.x * 30.0), cos(uWall * 1.3 + aSeed.y * 30.0), 0.0)
    * (0.003 + 0.012 * uHover) * idle;
  float collapse = clamp((t - 0.6) / 0.28, 0.0, 1.0);
  collapse = collapse * collapse * collapse;
  float twist = collapse * 1.4;
  vec3 pre = vec3(
    cos(twist) * button.x - sin(twist) * button.y,
    sin(twist) * button.x + cos(twist) * button.y,
    button.z
  ) * (1.0 - collapse);
  float blast = clamp((t - 0.88) / 0.5, 0.0, 1.0);
  float azimuth = aSeed.x * 6.28318;
  float elevation = aSeed.z * 2.0 - 1.0;
  float ring = sqrt(1.0 - elevation * elevation);
  vec3 direction = vec3(cos(azimuth) * ring, sin(azimuth) * ring, elevation * 0.5);
  float reach = (1.0 - pow(1.0 - blast, 3.0)) * (1.2 + aSeed.w * 0.45) + max(t - 0.88, 0.0) * 0.6;
  vec3 burst = direction * reach;
  vec3 code = blast > 0.0 ? burst : pre;
  float swirl = uTime * 0.9;
  vec3 beam = vec3(
    cos(swirl) * aBeam.x - sin(swirl) * aBeam.y,
    sin(swirl) * aBeam.x + cos(swirl) * aBeam.y,
    aBeam.z
  );
  float compact = compaction(t);
  float loose = 1.0 - compact;
  float spread = loose * (0.12 + 0.33 * aSeed.w) * (1.0 - 0.7 * step(0.0, aTone.y));
  vec3 shell = aGlobe * (1.0 + spread) + (aSeed.xyz - 0.5) * loose * 0.18;
  vec3 globe = rotateX(rotateY(shell, uGlobeRot - loose * 0.9), 0.32) * uGlobeR + uGlobe;
  vec3 name = aName + vec3(0.0, 0.35, uNameZ);

  float d1 = aSeed.y;
  float d2 = (1.0 - along) * 0.65 + aSeed.z * 0.35;
  float d3 = clamp(aName.x / 11.0 + 0.5, 0.0, 1.0) * 0.65 + aSeed.w * 0.35;
  float p1 = phase(t, 1.25, 1.0, d1);
  float p2 = phase(t, 3.1, 1.7, d2);
  float p3 = phase(t, 6.6, 2.1, d3);
  k1 = easeInOut(p1);
  k2 = easeInOut(p2);
  k3 = easeOutBack(p3) * role;

  vec3 p = mix(code, beam, k1);
  p = mix(p, globe, k2);
  p = mix(p, name, k3);

  float turbulence = sin(p1 * 3.14159) * 0.8 + sin(p2 * 3.14159) * 1.0 + sin(p3 * 3.14159) * 0.7 * role;
  if (turbulence > 0.001) {
    vec3 q = p * 0.32 + vec3(0.0, 0.0, t * 0.18);
    p += flow(q + aSeed.xyz * 6.0) * turbulence;
  }

  float settled = step(0.999, p3) * role;
  if (settled > 0.5) {
    p.xy += vec2(sin(t * 1.3 + aSeed.x * 40.0), cos(t * 1.1 + aSeed.y * 40.0)) * 0.012;
  }

  speed = clamp(turbulence, 0.0, 1.0);
  return p;
}

float arcShown() {
  if (aTone.y < 0.0) return 1.0;
  float draw = clamp((uTime - 4.3 - aSeed.w * 1.1) / 1.1, 0.0, 1.0);
  return step(aTone.y, draw);
}

vec3 tint(float k1, float k2, float k3, float speed) {
  float idle = 1.0 - step(0.6001, uTime);
  float across = clamp(position.x / 1.75 + 0.5, 0.0, 1.0) * 0.85 + clamp(position.y / 0.4 + 0.5, 0.0, 1.0) * 0.15;
  float shimmer = smoothstep(0.07, 0.0, abs(fract(uWall * 0.3) - across)) * idle;
  float flash = exp(-pow((uTime - 0.88) / 0.07, 2.0));
  float ember = (1.0 - clamp((uTime - 0.88) / 0.6, 0.0, 1.0)) * step(0.88, uTime);
  vec3 code = mix(GOLD, CREAM, aTone.x)
    + HOT * (shimmer * 0.6 + uHover * idle * 0.3 + flash * 0.9 + ember * 0.35);
  float core = 1.0 - clamp(length(aBeam.xy) / 1.1, 0.0, 1.0);
  vec3 beam = mix(GOLD, HOT, core * core * 0.7);
  float arc = step(0.0, aTone.y);
  float pulse = smoothstep(0.06, 0.0, abs(fract(uTime * 0.35 - aSeed.w) - aTone.y)) * arc;
  float sea = step(aTone.y, -1.5);
  vec3 globe = mix(mix(LAND, OCEAN, sea), GOLD, arc) + HOT * pulse * 0.7;
  globe = mix(mix(GOLD, BRONZE, 0.4), globe, compaction(uTime));
  float sweep = smoothstep(0.1, 0.0, abs(clamp(aName.x / 11.0 + 0.5, 0.0, 1.0) - (uTime - 8.5) / 0.9)) * aTone.w;
  vec3 name = mix(GOLD, CREAM, aTone.z) + HOT * sweep * 0.55;
  vec3 color = mix(code, beam, k1);
  color = mix(color, globe, k2);
  return mix(color, name, clamp(k3, 0.0, 1.0));
}

float opacity(float k1, float k2, float k3, float speed, float depth) {
  float role = aTone.w;
  float arc = step(0.0, aTone.y);
  float squeeze = clamp((uTime - 0.6) / 0.28, 0.0, 1.0) * (1.0 - step(0.88, uTime));
  float code = (0.07 + 0.03 * uHover * (1.0 - step(0.6001, uTime))) * (1.0 - 0.93 * squeeze * squeeze)
    + 0.3 * smoothstep(0.88, 1.3, uTime);
  float beam = 0.3;
  float sea = step(aTone.y, -1.5);
  float surface = mix(mix(0.62, 0.16, sea), 0.8, arc);
  float globe = mix(0.46, surface, compaction(uTime)) * arcShown();
  float a = mix(code, beam, k1);
  a = mix(a, globe, k2);
  float hold = smoothstep(6.3, 7.0, uTime);
  a = mix(a, a * (1.0 - hold), k2);
  a = mix(a, 0.6, clamp(k3, 0.0, 1.0));
  float beamWeight = k1 * (1.0 - k2);
  a *= mix(1.0, smoothstep(28.0, 5.0, depth), beamWeight);
  a *= 1.0 - 0.75 * speed;
  return a * uIntro;
}
`

export const pointsVertex = `
${CHOREOGRAPHY}
uniform float uSize;
uniform float uPixelRatio;

void main() {
  float k1;
  float k2;
  float k3;
  float speed;
  vec3 p = choreograph(uTime, k1, k2, k3, speed);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float scale = mix(1.0, 1.5, k1 * (1.0 - k2)) * mix(1.0, 1.1, k2);
  gl_PointSize = clamp(uSize * uPixelRatio * scale / -mv.z, 1.0, 6.0 * uPixelRatio);
  vColor = tint(k1, k2, k3, speed);
  vAlpha = opacity(k1, k2, k3, speed, -mv.z);
}
`

export const pointsFragment = `
varying vec3 vColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(vColor, smoothstep(0.5, 0.05, d) * vAlpha);
}
`

export const holdVertex = `
${ROTATE}
uniform float uGlobeRot;
uniform vec3 uGlobe;
uniform float uGlobeR;
uniform float uHold;
uniform float uSize;
uniform float uPixelRatio;
attribute vec3 aGlobe;
attribute vec4 aTone;
varying vec3 vColor;
varying float vAlpha;

const vec3 LAND = vec3(0.78, 0.57, 0.32);
const vec3 OCEAN = vec3(0.36, 0.29, 0.2);

void main() {
  float sea = step(aTone.y, -1.5);
  float arc = step(0.0, aTone.y);
  vec3 p = rotateX(rotateY(aGlobe, uGlobeRot), 0.32) * uGlobeR + uGlobe;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(uSize * uPixelRatio * 1.1 / -mv.z, 1.0, 6.0 * uPixelRatio) * (1.0 - arc);
  vColor = mix(LAND, OCEAN, sea);
  vAlpha = mix(0.62, 0.16, sea) * (1.0 - arc) * uHold;
}
`

export const streakVertex = `
${CHOREOGRAPHY}
attribute float aTail;

void main() {
  float k1;
  float k2;
  float k3;
  float speed;
  vec3 p = choreograph(uTime, k1, k2, k3, speed);
  p -= uCamVel * uStreak * aTail * (0.5 + aSeed.x);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  vColor = tint(k1, k2, k3, speed);
  vAlpha = opacity(k1, k2, k3, speed, -mv.z) * (1.0 - aTail) * clamp(length(uCamVel) * uStreak * 0.4, 0.0, 0.7);
}
`

export const streakFragment = `
varying vec3 vColor;
varying float vAlpha;

void main() {
  gl_FragColor = vec4(vColor, vAlpha);
}
`
