import { DoubleSide, RawShaderMaterial, Texture, Uniform, Vector3 } from 'three'
import { pixelAspectRatioUniform } from '~/uniforms'
import { buildParameters } from '~/utils/jsUtils'
import { getTempTexture } from '~/utils/threeUtils'

import fragmentShader from './frag.glsl'
import vertexShader from './vert.glsl'

interface Parameters {
  spriteTex: Texture
  transform: Vector3
}

const __defaultParams: Parameters = {
  spriteTex: getTempTexture(),
  transform: new Vector3(0, 0, 1 / 2048)
}

export class SpritesPointMaterial extends RawShaderMaterial {
  constructor(options: Partial<Parameters>) {
    const params = buildParameters(__defaultParams, options)
    super({
      uniforms: {
        uSpriteTex: new Uniform(params.spriteTex),
        uTransform: new Uniform(params.transform),
        uAspectRatio: pixelAspectRatioUniform
      },
      vertexShader,
      fragmentShader,
      // alphaTest: 0.5,
      // transparent: true,
      depthWrite: true,
      depthTest: true,
      side: DoubleSide
    })
  }
}
