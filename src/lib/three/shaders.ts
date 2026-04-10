export const THREE_VERTEX_SHADER = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const THREE_FRAGMENT_SHADER = `
precision highp float;

varying vec2 vUv;

uniform vec2 uResolution;
uniform float uTime;
uniform float uRadius;
uniform float uWidth;
uniform float uGradientOffset;
uniform float uColorSpeed;
uniform float uHueOffset;
uniform float uIntensity;
uniform vec3 uPalette1;
uniform vec3 uPalette2;
uniform vec3 uPalette3;
uniform vec3 uPalette4;
 
vec3 paletteColor(float t) {
  float segment = fract(t) * 4.0;

  if (segment < 1.0) {
    return mix(uPalette1, uPalette2, segment);
  }

  if (segment < 2.0) {
    return mix(uPalette2, uPalette3, segment - 1.0);
  }

  if (segment < 3.0) {
    return mix(uPalette3, uPalette4, segment - 2.0);
  }

  return mix(uPalette4, uPalette1, segment - 3.0);
}

void main() {
  vec2 resolution = max(uResolution, vec2(1.0));
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec2 center = vec2(0.5, 0.5);
  vec2 fromCenter = abs(uv - center);

  float cornerRadius = clamp(uRadius / min(resolution.x, resolution.y), 0.0, 0.085);
  vec2 rectBounds = vec2(0.5 - cornerRadius, 0.5 - cornerRadius);
  vec2 distToRect = max(fromCenter - rectBounds, 0.0);
  float cornerDist = length(distToRect);
  float rectDist = max(fromCenter.x, fromCenter.y);
  float cornerInfluence = smoothstep(0.35, 0.45, rectDist);
  float roundedDist = cornerDist + (0.5 - cornerRadius);
  float distFromCenter = mix(rectDist, roundedDist, cornerInfluence * 0.5);

  float widthNorm = clamp(uWidth / 12.0, 0.0, 1.0);
  float gradientWidth = mix(0.016, 0.027, widthNorm);
  float gradientEnd = 0.5 + uGradientOffset;
  float gradientStart = gradientEnd - gradientWidth;
  float edgeGradient = smoothstep(gradientStart, gradientEnd, distFromCenter);

  float hueBase = uHueOffset + uTime * uColorSpeed;
  float smoothHue =
    uv.x * 0.22 +
    uv.y * 0.16 +
    sin(uv.x * 3.14159265) * 0.08 +
    cos(uv.y * 3.14159265) * 0.08;
  float timeVariation = sin(uTime * 0.2) * 0.03;
  float hue = fract(hueBase + smoothHue + timeVariation);
  vec3 rainbowColor = paletteColor(hue);
  rainbowColor = mix(
    rainbowColor,
    vec3(1.0),
    0.08 + 0.02 * sin(uTime * 0.2 + distFromCenter * 4.0)
  );
  rainbowColor = pow(rainbowColor, vec3(0.9));

  float wave1 = sin(uv.x * 4.0 + uTime * 0.8) * 0.05;
  float wave2 = sin(uv.y * 4.0 + uTime * 0.6) * 0.05;
  float waveEffect = (wave1 + wave2) * 0.12 + 0.98;
  float pulse = sin(uTime * 1.5) * 0.018 + 0.988;
  float edgePulse = mix(1.0, pulse, edgeGradient);

  float alpha = edgeGradient * waveEffect * edgePulse * uIntensity;
  alpha = smoothstep(0.0, 1.0, alpha);
  alpha = pow(alpha, 1.32);
  alpha = clamp(alpha * 0.54, 0.0, 0.46);

  if (alpha < 0.002) {
    discard;
  }

  gl_FragColor = vec4(rainbowColor, alpha);
}
`
