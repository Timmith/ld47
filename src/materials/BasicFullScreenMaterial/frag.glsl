precision lowp float;

uniform sampler2D uTileTex;
uniform sampler2D uMapTex;
uniform vec2 uMapSize;

varying vec2 vUv;

void main() {
  vec4 sampleMapTop = texture2D(uMapTex, vUv);
  vec2 uvTileTop = floor(sampleMapTop.zw * 8.0) / 8.0 + fract(vUv * uMapSize) / 8.0;
  vec4 sampleTileTop = texture2D(uTileTex, uvTileTop);
  gl_FragColor = sampleTileTop;
  if(sampleTileTop.a<0.5) {
    vec4 sampleMapBottom = texture2D(uMapTex, vUv+vec2(0.0, 1.0/64.0));
    vec2 uvTileBottom = floor(sampleMapBottom.xy * 8.0) / 8.0 + fract(vUv * uMapSize) / 8.0;
    vec4 sampleTileBottom = texture2D(uTileTex, uvTileBottom);
    gl_FragColor = sampleTileBottom;
  }
}
