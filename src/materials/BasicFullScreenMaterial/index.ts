import { DoubleSide, RawShaderMaterial, Texture, Uniform, Vector3 } from 'three'
import { buildParameters } from '~/utils/jsUtils'
import { getTempTexture } from '~/utils/threeUtils'
import { pixelAspectRatioUniform } from '~/uniforms'

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
    transform: new Vector3(0, 0, 1/2048)
}

export class BasicFullScreenMaterial extends RawShaderMaterial {
  constructor(options:Partial<Parameters>) {
    const params = buildParameters(__defaultParams, options)
    super({
      uniforms: {
          uMapTex: new Uniform(params.mapTex),
          uTileTex: new Uniform(params.tileTex),
          uTransform: new Uniform(params.transform),
          uAspectRatio: pixelAspectRatioUniform
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
