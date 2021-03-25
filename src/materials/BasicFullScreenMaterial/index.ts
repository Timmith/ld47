import { DoubleSide, RawShaderMaterial, Texture, Uniform, Vector3 } from 'three'
import { buildParameters } from '~/utils/jsUtils'
import { getTempTexture } from '~/utils/threeUtils'

import fragmentShader from './frag.glsl'
import vertexShader from './vert.glsl'

type Parameters = {
    mapTex:Texture,
    tileTex:Texture,
    transform: Vector3
}

const __defaultParams:Parameters = {
    mapTex: getTempTexture(),
    tileTex: getTempTexture(),
    transform: new Vector3(50, 100, 1/2048)
}

export class BasicFullScreenMaterial extends RawShaderMaterial {
  constructor(options:Partial<Parameters>) {
    const params = buildParameters(__defaultParams, options)
    super({
      uniforms: {
          mapTex: new Uniform(params.mapTex),
          tileTex: new Uniform(params.tileTex),
          transform: new Uniform(params.transform)
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      side: DoubleSide
    })
  }
}
