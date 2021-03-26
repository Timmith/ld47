precision lowp float;

uniform sampler2D uTileTex;
uniform sampler2D uMapTex;

varying vec2 vUv;

void main() {
  vec3 sampleMap = texture2D(uMapTex, vUv).rgb;
  vec2 uvTile = floor(sampleMap.xy * 8.0) / 8.0 + fract(vUv * 64.0) / 8.0;
  vec3 sampleTile = texture2D(uTileTex, uvTile).rgb;
  gl_FragColor = vec4(sampleTile, 1.0);
}
