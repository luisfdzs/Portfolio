export const swarmFragment = `
varying vec3 vColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(vColor, smoothstep(0.5, 0.15, d) * vAlpha);
}
`

export const swarmVertex = `
attribute float aSeed;
attribute vec4 aFrom;
attribute vec4 aFromNormal;
attribute vec2 aFromMeta;
attribute vec4 aTo;
attribute vec4 aToNormal;
attribute vec2 aToMeta;
uniform vec3 uFromCenter;
uniform vec2 uFromScale;
uniform float uFromKind;
uniform float uFromSpin;
uniform vec3 uFromPose;
uniform vec2 uFromPivot;
uniform vec3 uToCenter;
uniform vec2 uToScale;
uniform float uToKind;
uniform float uToSpin;
uniform vec3 uToPose;
uniform vec2 uToPivot;
uniform float uMix;
uniform float uStream;
uniform float uCalm;
uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;
uniform float uViewH;
uniform float uPulse;
uniform float uVisible;
uniform float uOcclude;
uniform float uDensity;
uniform float uFormed;
varying vec3 vColor;
varying float vAlpha;

const float PI = 3.14159265;
const float PERSPECTIVE = 5.0;
const float TILT = 0.344;
const vec3 GOLD = vec3(0.878, 0.643, 0.345);
const vec3 CREAM = vec3(0.953, 0.890, 0.765);
const vec3 HOT = vec3(1.0, 0.93, 0.8);
const vec3 DEEP = vec3(0.86, 0.5, 0.13);
const vec3 AMBER = vec3(1.0, 0.75, 0.32);
const vec3 PALE = vec3(1.0, 0.92, 0.66);

struct Side {
  vec3 p;
  vec3 color;
  float alpha;
  float size;
  float solid;
};

float ease(float t) {
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

vec3 spinY(vec3 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

vec3 tilt(vec3 p) {
  float c = cos(TILT);
  float s = sin(TILT);
  return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
}

vec2 swing(vec2 d, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec2(c * d.x - s * d.y, s * d.x + c * d.y);
}

vec3 flow(vec3 q) {
  return vec3(
    sin(q.y * 1.9 + q.z * 0.7) + 0.5 * sin(q.z * 3.1 + q.x * 1.3),
    sin(q.z * 1.7 + q.x * 1.1) + 0.5 * sin(q.x * 2.9 + q.y * 1.7),
    sin(q.x * 1.5 + q.y * 0.9) + 0.5 * sin(q.y * 3.3 + q.z * 1.9)
  ) * 0.55;
}

Side place(vec4 shape, vec4 nrm, float move, vec3 center, vec2 scale, float kind, float spin, vec3 pose, vec2 pivot, float seed) {
  Side s;
  s.solid = 0.0;
  if (kind > 3.5) {
    float role = nrm.x;
    float formed = step(0.0, uFormed);
    float flash = formed * exp(-uFormed * 2.5);
    float fade = formed * smoothstep(0.15, 1.6, uFormed);
    float keep = 1.0 - step(0.5, role);
    float head = uTime * 0.07;
    float comet = keep * fade * max(exp(-fract(nrm.y - head) * 10.0), exp(-fract(nrm.y + 0.5 - head) * 10.0));
    vec2 drift = (1.0 - keep) * fade * vec2(sin(seed * 40.0) * 0.05, 0.12 + 0.2 * seed);
    vec2 local = shape.xy * (1.0 + 0.04 * keep * fade) + drift;
    local += vec2(sin(uTime * 0.9 + seed * 40.0), cos(uTime * 0.7 + seed * 30.0)) * 0.002;
    s.p = center + vec3(local * scale, 0.0);
    s.color = mix(GOLD, CREAM, shape.w) + HOT * (flash * 0.8 + comet * 0.8);
    float before = role > 2.5 ? 0.12 : role > 1.5 ? 0.5 : role > 0.5 ? 0.3 : 0.26;
    float after = keep * (0.05 + 0.4 * comet);
    s.alpha = (mix(before, after, fade) + 0.35 * flash) * uDensity * 0.22;
    s.size = 1.0 + 0.8 * flash + 0.9 * comet;
    return s;
  }
  if (kind > 2.5) {
    float role = nrm.x;
    float sweep = fract(uTime * 0.16);
    float line = mix(0.56, -0.56, smoothstep(0.0, 0.8, sweep));
    float live = 1.0 - smoothstep(0.8, 1.0, sweep);
    float d = shape.y - line;
    float band = exp(-d * d * 500.0) * live;
    float trail = step(0.0, d) * exp(-d * 7.0) * live;
    vec2 local = shape.xy * (1.0 + 0.012 * sin(uTime * 1.1));
    if (role > 0.5 && role < 1.5) {
      local = vec2(shape.x * (0.9 + 0.1 * sin(uTime * 3.0 + seed * 20.0)), line);
      s.p = center + vec3(local * scale, 0.0);
      s.color = mix(GOLD, HOT, shape.w);
      s.alpha = (0.1 + 0.08 * shape.w) * live * uDensity;
      s.size = 1.1;
      return s;
    }
    float pore = step(1.5, role);
    s.p = center + vec3(local * scale, shape.z * scale.x);
    s.color = mix(GOLD, CREAM, shape.w) + HOT * band * (1.0 - pore);
    s.alpha = mix(0.05 + 0.3 * band + 0.05 * trail, 0.02 + 0.1 * band, pore) * uDensity;
    s.size = 1.0 + 0.7 * band;
    return s;
  }
  if (kind > 1.5) {
    s.p = center + vec3(shape.xy * scale, 0.0);
    s.color = mix(GOLD, CREAM, shape.w);
    s.alpha = 0.6;
    s.size = 1.0;
    return s;
  }
  if (kind > 0.5) {
    float role = nrm.x;
    float m = min(scale.x, scale.y);
    if (role < 1.5) {
      vec2 inward = -sign(shape.xy);
      vec2 along = role < 0.5 ? vec2(inward.x, 0.0) : vec2(0.0, inward.y);
      vec2 across = role < 0.5 ? vec2(0.0, 1.0) : vec2(1.0, 0.0);
      float arm = m * (0.09 + 0.05 * uPulse);
      float glint = exp(-abs(nrm.y - fract(uTime * 0.2 + nrm.z)) * 12.0);
      vec2 corner = shape.xy * scale * (1.0 + 0.05 * uPulse);
      s.p = center + vec3(corner + along * nrm.y * arm + across * shape.z * m, 0.0);
      s.color = mix(GOLD, CREAM, shape.w) + HOT * (0.6 * glint + 0.5 * uPulse);
      s.alpha = (0.05 + 0.1 * glint + 0.12 * uPulse) * uDensity;
      s.size = 1.0 + 0.5 * glint;
      return s;
    }
    float rise = fract(nrm.y + uTime * 0.025);
    vec2 local = shape.xy + vec2(sin(uTime * 0.4 + seed * 40.0) * 0.004, rise * 0.05);
    s.p = center + vec3(local * scale, shape.z * m);
    s.color = mix(GOLD, CREAM, shape.w);
    s.alpha = 0.03 * sin(PI * rise) * uDensity;
    s.size = 0.9;
    return s;
  }
  float turns = step(3.5, move);
  float lifts = turns > 0.5 ? 0.0 : move > 2.5 ? 0.5 : step(1.5, move);
  vec3 q = turns > 0.5 ? vec3(pivot + swing(shape.xy - pivot, pose.z), shape.z) : shape.xyz;
  q.y += pose.x * lifts;
  vec3 n = turns > 0.5 ? vec3(swing(nrm.xy, pose.z), nrm.z) : nrm.xyz;
  float oriented = step(0.5, length(nrm.xyz));
  q += (1.0 - oriented) * 0.05 * vec3(
    sin(uTime * 0.7 + seed * 31.0),
    cos(uTime * 0.5 + seed * 17.0),
    sin(uTime * 0.6 + seed * 23.0)
  );
  q = tilt(spinY(q, spin));
  n = tilt(spinY(n, spin));
  float persp = PERSPECTIVE / (PERSPECTIVE - q.z);
  s.p = center + vec3(q.xy * persp, q.z) * scale.x;
  float facing = oriented > 0.5 ? n.z / max(length(n), 0.0001) : 1.0;
  float side = mix(1.0, mix(0.012, 1.0, smoothstep(-0.02, 0.3, facing)), oriented);
  float glow = nrm.w;
  float blink = glow > 2.5 ? 0.0 : glow > 1.5 ? 0.5 + 0.5 * sin(uTime * 2.6) : (glow > 0.5 ? step(0.5, fract(uTime * 1.3)) : 0.0);
  float reveal = glow > 2.5 ? smoothstep(0.04, 0.3, pose.y) : 1.0;
  vec3 col = seed < 0.5 ? mix(DEEP, AMBER, seed * 2.0) : mix(AMBER, PALE, seed * 2.0 - 1.0);
  col = mix(col, vec3(1.0, 0.8, 0.42), 0.7);
  s.color = col * shape.w * (1.0 + 2.2 * blink);
  s.alpha = 0.62 * side * reveal;
  s.size = persp * (1.0 + 0.6 * blink) * mix(0.75 + seed * 0.5, 1.0, 0.75);
  s.solid = step(0.9, reveal);
  return s;
}

void main() {
  float seed = aSeed;
  float t = clamp((uMix - aToMeta.y * 0.35) / 0.65, 0.0, 1.0);
  float e = ease(t);
  Side a = place(aFrom, aFromNormal, aFromMeta.x, uFromCenter, uFromScale, uFromKind, uFromSpin, uFromPose, uFromPivot, seed);
  Side b = place(aTo, aToNormal, aToMeta.x, uToCenter, uToScale, uToKind, uToSpin, uToPose, uToPivot, seed);

  float travel = sin(PI * e);
  float moving = 1.0 - uCalm;
  vec3 p = mix(a.p, b.p, uCalm > 0.5 ? step(0.5, e) : e);

  float pinch = uStream * pow(travel, 0.6) * moving;
  vec3 spine = mix(uFromCenter, uToCenter, e);
  spine.x += sin(e * PI * 2.0 + uTime * 0.5) * uViewH * 0.07 * travel;
  float twist = uTime * 1.3 + e * 11.0 + seed * 6.2832;
  vec3 ring = vec3(swing(position.xy, twist), position.z) * uViewH * (0.03 + 0.09 * travel);
  vec3 stream = spine + ring + flow(position * 2.0 + vec3(0.0, e * 3.0, uTime * 0.2)) * uViewH * 0.035 * travel;
  p = mix(p, stream, pinch);

  float churn = travel * moving * (1.0 - uStream);
  p.y += churn * (0.08 + 0.1 * seed) * uToScale.x;
  p += churn * flow(position * 3.0 + uTime * 0.3) * 0.05 * uToScale.x;

  float heroA = abs(uFromKind - 2.0) < 0.5 ? smoothstep(0.0, 0.22, t) : 1.0;
  float heroB = abs(uToKind - 2.0) < 0.5 ? smoothstep(0.0, 0.22, 1.0 - t) : 1.0;
  float alpha = mix(a.alpha, b.alpha, e);
  alpha = mix(alpha, (0.1 + 0.08 * seed) * uDensity, pinch);
  alpha *= uCalm > 0.5 ? abs(1.0 - 2.0 * e) : 1.0;
  alpha *= heroA * heroB * uVisible;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio * mix(a.size, b.size, e) * (1.0 + 0.45 * pinch + 0.3 * churn);
  vColor = mix(a.color, b.color, e) * (1.0 + 0.35 * travel * (1.0 - pinch));
  vAlpha = alpha;
#ifdef OCCLUDE
  float settledA = (1.0 - step(0.001, t)) * step(uFromKind, 0.5) * a.solid;
  float settledB = step(0.999, t) * step(uToKind, 0.5) * b.solid;
  float bias = 0.035 * mix(uFromScale.x, uToScale.x, step(0.5, t));
  gl_Position = projectionMatrix * vec4(mv.xyz + normalize(mv.xyz) * bias, 1.0);
  gl_PointSize *= uOcclude;
  if (max(settledA, settledB) < 0.5) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
#endif
}
`
