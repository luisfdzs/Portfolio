export const agvFragment = `
varying vec3 vColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(vColor, smoothstep(0.5, 0.2, d) * vAlpha);
}
`

export const agvMorphVertex = `
attribute vec4 aFrom;
attribute vec4 aFromNormalGlow;
attribute vec4 aShape;
attribute vec4 aNormalGlow;
attribute vec3 aCore;
attribute float aSeed;
attribute float aDelay;
attribute float aMove;
uniform float uCharge;
uniform float uBurst;
uniform float uForm;
uniform float uMorph;
uniform float uLift;
uniform float uLiftRatio;
uniform vec2 uPivot;
uniform float uTurn;
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uBias;
uniform float uOcclude;
varying vec3 vColor;
varying float vAlpha;

float ease(float t) {
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

float expoOut(float t) {
  return t >= 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * t);
}

vec3 spin(vec3 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

vec2 swing(vec2 d) {
  float c = cos(uTurn);
  float s = sin(uTurn);
  return vec2(c * d.x - s * d.y, s * d.x + c * d.y);
}

void main() {
  float ex = expoOut(clamp((uBurst - aSeed * 0.12) / 0.88, 0.0, 1.0));
  float fo = ease(clamp((uForm - aDelay * 0.5) / 0.5, 0.0, 1.0));

  vec3 c = aCore * (1.0 + 0.07 * sin(uTime * 5.0 + aSeed * 12.0)) * (1.0 - 0.3 * uCharge);
  c = spin(c, uTime * 1.8);

  vec3 cloud = spin(position, uTime * 0.12 + aSeed * 0.3);
  cloud += 0.12 * vec3(
    sin(uTime * 0.7 + aSeed * 31.0),
    cos(uTime * 0.5 + aSeed * 17.0),
    sin(uTime * 0.6 + aSeed * 23.0)
  );

  float mo = ease(clamp((uMorph - aDelay * 0.35) / 0.65, 0.0, 1.0));
  float travel = sin(3.14159 * mo);
  float turns = step(3.5, aMove);
  float lifts = turns > 0.5 ? 0.0 : aMove > 2.5 ? 0.5 : step(1.5, aMove);
  vec3 target = turns > 0.5 ? vec3(uPivot + swing(aShape.xy - uPivot), aShape.z) : aShape.xyz;
  vec3 shape = mix(aFrom.xyz, target + vec3(0.0, uLift * lifts, 0.0), mo);
  shape += travel * vec3(0.0, 0.08 + 0.1 * aSeed, 0.0);
  shape = spin(shape, travel * (aSeed - 0.5) * 0.6);
  vec4 normalGlow = mo < 0.5 ? aFromNormalGlow : aNormalGlow;
  float shapeTone = mix(aFrom.w, aShape.w, mo);

  vec3 q = mix(mix(c, cloud, ex), shape, fo);
  float swirl = (1.0 - fo) * fo * 4.0;
  q = spin(q, swirl * (1.1 + aSeed * 1.5));
  q += swirl * 0.04 * vec3(
    sin(aSeed * 90.0 + uTime * 3.0),
    cos(aSeed * 70.0 + uTime * 2.0),
    sin(aSeed * 50.0 + uTime * 2.5)
  );

  vec4 mv = modelViewMatrix * vec4(q, 1.0);
  gl_Position = projectionMatrix * mv;

  float burst = ex * (1.0 - ex) * 4.0 * (1.0 - fo);
  float glow = normalGlow.w;
  float blink = glow > 2.5 ? 0.0 : glow > 1.5 ? 0.5 + 0.5 * sin(uTime * 2.6) : (glow > 0.5 ? step(0.5, fract(uTime * 1.3)) : 0.0);
  float tone = mix(1.0, shapeTone, fo);
  float flash = 1.0 + 1.6 * swirl + 0.9 * travel + 2.0 * burst + 1.2 * uCharge * (1.0 - ex) + 2.2 * blink * fo;

  float formed = max(fo, 1.0 - ex);
  gl_PointSize = uSize * mix(0.75 + aSeed * 0.5, 1.0, 0.75 * fo) * uPixelRatio / -mv.z
    * mix(1.6, 1.0, formed) * (1.0 + 0.6 * blink * fo);

  vec3 deep = vec3(0.86, 0.5, 0.13);
  vec3 gold = vec3(1.0, 0.75, 0.32);
  vec3 pale = vec3(1.0, 0.92, 0.66);
  vec3 col = aSeed < 0.5 ? mix(deep, gold, aSeed * 2.0) : mix(gold, pale, aSeed * 2.0 - 1.0);
  col = mix(col, vec3(1.0, 0.8, 0.42), 0.7 * fo);
  vColor = col * tone * flash;

  vec3 n = mo >= 0.5 && turns > 0.5 ? vec3(swing(normalGlow.xy), normalGlow.z) : normalGlow.xyz;
  float oriented = step(0.5, length(n));
  vec3 facingNormal = normalize(normalMatrix * mix(vec3(0.0, 1.0, 0.0), n, oriented));
  float facing = dot(facingNormal, normalize(-mv.xyz));
  float side = mix(1.0, mix(0.012, 1.0, smoothstep(-0.02, 0.3, facing)), oriented * fo * (1.0 - travel));

  float a = mix(mix(0.1, 0.3, ex), 0.62, fo);
  float reveal = glow > 2.5 ? smoothstep(0.04, 0.3, uLiftRatio) : 1.0;
  vAlpha = reveal * a * side * (0.75 + 0.25 * sin(uTime * 3.0 + aSeed * 40.0) * (1.0 - fo));
#ifdef OCCLUDE
  gl_Position = projectionMatrix * vec4(mv.xyz + normalize(mv.xyz) * uBias, 1.0);
  gl_PointSize *= uOcclude;
  if (fo * (1.0 - travel) < 0.97 || reveal < 0.9) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
#endif
}
`
