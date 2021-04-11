precision lowp float;

uniform sampler2D uTileTex;
uniform sampler2D uMapTex;
uniform vec2 uMapSize;

varying vec2 vUv;

void main() {
  vec3 sampleMap = texture2D(uMapTex, vUv).rgb;
  vec2 uvTile = floor(sampleMap.xy * 8.0) / 8.0 + fract(vUv * uMapSize) / 8.0;
  vec4 sampleTile = texture2D(uTileTex, uvTile);
  // if(sampleTile.a<0.989) {
  //   discard;
  // }
  gl_FragColor = vec4(sampleTile.rgb, (sampleTile.a-252.0/255.0)*128.0);
}
