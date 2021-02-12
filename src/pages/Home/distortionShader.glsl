#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform float uPointerDown;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;

vec2 computeUV (vec2 uv, float k, float kcube) {
  vec2 t = uv - 0.5;
  float r2 = t.x * t.x + t.y * t.y;
  float f = 0.0;
  if (kcube == 0.0) {
    f = 1.0 + r2 * k;
  } else {
    f = 1.0 + r2 * (k + kcube * sqrt(r2));
  }
  vec2 nUv = f * t + 0.5;
  nUv.y = 1.0 - nUv.y;
  return nUv;
}

void main () {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;

  float k = 0.6 * uPointerDown;
  float kcube = -0.53 * uPointerDown;
  float offset = 0.02 * uPointerDown;
  
  float red = texture2D(uSampler, computeUV(uv, k + offset, kcube)).r;
  float green = texture2D(uSampler, computeUV(uv, k, kcube)).g;
  float blue = texture2D(uSampler, computeUV(uv, k - offset, kcube)).b;
  
  gl_FragColor = vec4(red, green, blue, 1.0);
}