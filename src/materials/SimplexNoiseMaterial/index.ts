import { Color, DoubleSide, RawShaderMaterial, Uniform, Vector4 } from 'three'
import { buildParameters } from '~/utils/jsUtils'

import fragmentShader from './frag.glsl'
import vertexShader from './vert.glsl'

interface Parameters {
  uvST: Vector4
  color: Color
}

const __defaultParams: Parameters = {
  uvST: new Vector4(0.2, 0.2, 0, 0),
  color: new Color(1, 1, 0)
}

interface Uniforms {
  uUvST: { value: Vector4 }
  uColor: { value: Color }
}

export class SimplexNoiseMaterial extends RawShaderMaterial {
  constructor(options: Partial<Parameters> = {}) {
    const params = buildParameters(__defaultParams, options)
    const uUvST = new Uniform(params.uvST)
    const uColor = new Uniform(params.color)
    const uniforms: Uniforms = {
      uUvST,
      uColor
    }
    const defines: { [key: string]: boolean | string | number } = {}

    super({
      uniforms,
      defines,
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
