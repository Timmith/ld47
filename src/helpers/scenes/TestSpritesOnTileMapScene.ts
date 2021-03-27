import { Float32BufferAttribute, Points } from 'three'
import SpritesGeometry from '~/geometries/SpritesPointGeometry'
import { SpritesPointMaterial } from '~/materials/SpritesPointMaterial'
import { mod } from '~/utils/math'
import { loadPixelatedTexture } from '~/utils/threeUtils'

import TestTileMapScene from './TestTileMapScene'

const __radiansToCardinal = 8 / (Math.PI * 2)
export default class TestSpritesOnTileMapScene extends TestTileMapScene {
  private _tempXyFramesAttr: Float32BufferAttribute
  private _tempVelocities: Float32Array
  private total = 10000
  constructor() {
    super()

    const scene = this.scene
    const transform = this._transform
    const tempVelocities = new Float32Array(this.total * 2)
    const speed = 0.02
    for (let i = 0; i < this.total; i++) {
      const i2 = i * 2
      const angle = (~~(Math.random() * 8) / 8) * Math.PI * 2
      // const angle = rand(-Math.PI, Math.PI)
      tempVelocities[i2] = Math.cos(angle) * speed
      tempVelocities[i2 + 1] = Math.sin(angle) * speed
    }
    const initSpritesRenderer = async () => {
      const playerSpriteTex = await loadPixelatedTexture(
        'game/spriteAnimations/donotcommit-player.png',
        false
      )
      const geometry = new SpritesGeometry(this.total)
      this._tempXyFramesAttr = geometry.xyFrameAttr
      const sprites = new Points(
        geometry,
        new SpritesPointMaterial({
          spriteTex: playerSpriteTex,
          transform
        })
      )
      sprites.frustumCulled = false
      sprites.renderOrder = 1
      scene.add(sprites)
    }
    initSpritesRenderer()
    this._transform = transform
    this._tempVelocities = tempVelocities
  }
  update(dt: number) {
    super.update(dt)
    if (!this._tempXyFramesAttr) {
      return
    }
    const xyF = this._tempXyFramesAttr.array as Float32Array
    const vel = this._tempVelocities
    const time = performance.now() * 0.002
    for (let i = 0; i < this.total; i++) {
      const i2 = i * 2
      const i3 = i * 3
      xyF[i3] = mod(xyF[i3] + vel[i2] * dt, 1)
      xyF[i3 + 1] = mod(xyF[i3 + 1] + vel[i2 + 1] * dt, 1)
      const dir = ~~mod(
        Math.atan2(vel[i2 + 1], vel[i2]) * __radiansToCardinal + 1,
        8
      )
      xyF[i3 + 2] = dir * 8 + ~~(mod(time, 1) * 6)
    }
    this._tempXyFramesAttr.needsUpdate = true
  }
}

for (let i = 0; i < 8; i++) {
  const angle = (i / 8) * Math.PI * 2
  const dir = mod(angle * __radiansToCardinal, 8)
  console.log(angle)
  console.log(dir)
}
