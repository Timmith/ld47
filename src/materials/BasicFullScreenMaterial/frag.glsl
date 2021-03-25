precision lowp float;

uniform sampler2D tileTex;
uniform sampler2D mapTex;
uniform vec3 transform;

void main() {
  vec2 uvMap = (gl_FragCoord.xy + transform.xy) * transform.z;
  vec3 sampleMap = texture2D(mapTex, uvMap).rgb;
  vec2 uvTile = floor(sampleMap.xy * 8.0) / 8.0 + fract(uvMap * 64.0) / 8.0;
  vec3 sampleTile = texture2D(tileTex, uvTile).rgb;
  gl_FragColor = vec4(sampleTile, 1.0);
}
