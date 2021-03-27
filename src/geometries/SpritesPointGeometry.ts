import {
  BufferGeometry,
  Float32BufferAttribute,
  Uint16BufferAttribute
} from 'three'
import { rand } from '~/utils/math'

export default class SpritesPointGeometry extends BufferGeometry {
  xyFrameAttr: Float32BufferAttribute
  constructor(total: number) {
    super()
    const partsPerItem = 3
    const arr = new Float32Array(total * partsPerItem)
    for (let i = 0; i < total; i++) {
      const i3 = i * 3
      arr[i3] = rand(0, 1)
      arr[i3 + 1] = rand(0, 1)
      arr[i3 + 2] = ~~rand(0, 64)
    }
    const attr = new Float32BufferAttribute(arr, partsPerItem, false)
    this.xyFrameAttr = attr
    this.addAttribute('xyFrame', attr, partsPerItem)

    const indices = new Uint16Array(total)
    for (let i = 0; i < total; i++) {
      indices[i] = i
    }
    const indexBufferAttr = new Uint16BufferAttribute(indices, 1, false)
    this.setIndex(indexBufferAttr)
  }
}
