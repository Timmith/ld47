import {
  DoubleSide,
  RawShaderMaterial,
  Texture,
  Uniform,
  Vector2,
  Vector4
} from 'three'
import { buildParameters } from '~/utils/jsUtils'

import fragmentShader from './frag.glsl'
import vertexShader from './vert.glsl'

interface Parameters {
  uvST: Vector4
}

const __defaultParams: Parameters = {
  uvST: new Vector4(0.2, 0.2, 0, 0)
}

interface Uniforms {
  uUvST: { value: Vector4 }
}

export class SimplexNoiseMaterial extends RawShaderMaterial {
  constructor(options: Partial<Parameters> = {}) {
    const params = buildParameters(__defaultParams, options)
    const uUvST = new Uniform(params.uvST)
    const uniforms: Uniforms = {
      uUvST
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
