import {
  DataTexture,
  Mesh,
  NearestFilter,
  PlaneGeometry,
  RepeatWrapping,
  RGBAFormat,
  UnsignedByteType,
  UVMapping,
  Vector3,
  WebGLRenderer
} from 'three'
import { getMouseBoundViewTransform } from '~/helpers/viewTransformMouse'
import { BasicFullScreenMaterial } from '~/materials/BasicFullScreenMaterial'
import { wrap } from '~/utils/math'
import { detRandGraphics } from '~/utils/random'

import { BaseTestScene } from './BaseTestScene'
import TileMaker from './tileMaker/tileMaker'

export default class TestJitTilesScene extends BaseTestScene {
  protected _transform: Vector3
  private _tileMaker = new TileMaker()
  constructor() {
    super()

    const scene = this.scene
    const tileMaker = this._tileMaker
    const transform = getMouseBoundViewTransform()
    const tileTex = this._tileMaker.texture
    async function initMapRenderer() {
      const data = new Uint8Array(64 * 64 * 4)

      const masks = []
      for (let i = 0; i < 32; i++) {
        masks[i] = 1 << i
      }

      const tilePropertyLookup = [
        'floor',
        'beam',
        'bricks',
        'drywall',
        'unused',
        'unused2'
      ]

      const visualPropertyLookup = [
        'layer2',
        'floor',
        'beamCenter',
        'beamN',
        'beamE',
        'beamS',
        'beamW',
        'beamNS',
        'beamEW',
        'bricks0',
        'bricks1',
        'bricks2',
        'bricks3',
        'bricks4',
        'bricks5',
        'bricks6',
        'bricks7',
        'bricks8',
        'bricks9',
        'bricks10',
        'bricks11',
        'bricks12'
      ]

      const totalTiles = 64 * 64
      const tileProperties = new Uint8Array(totalTiles)
      for (let i = 0; i < totalTiles; i++) {
        let props = ~~detRandGraphics(255) | 1
        if (
          !(props & masks[tilePropertyLookup.indexOf('beam')]) &&
          props & masks[tilePropertyLookup.indexOf('bricks')]
        ) {
          props = props ^ masks[tilePropertyLookup.indexOf('bricks')]
        }
        tileProperties[i] = props
      }
      const visualProperties = new Uint32Array(totalTiles)
      for (let i = 0, i4 = 0; i < totalTiles; i++, i4 += 4) {
        const props = tileProperties[i]
        const x = i % 64
        const y = ~~(i / 64)
        const propsE = tileProperties[wrap(x + 1, 0, 64) + wrap(y, 0, 64) * 64]
        const propsW = tileProperties[wrap(x - 1, 0, 64) + wrap(y, 0, 64) * 64]
        const propsN = tileProperties[wrap(x, 0, 64) + wrap(y - 1, 0, 64) * 64]
        const propsS = tileProperties[wrap(x, 0, 64) + wrap(y + 1, 0, 64) * 64]
        let val = 0
        if (props & masks[tilePropertyLookup.indexOf('floor')]) {
          val = val | masks[visualPropertyLookup.indexOf('floor')]
        }
        const propMaskBeam = masks[tilePropertyLookup.indexOf('beam')]
        const beamC = props & propMaskBeam
        const beamN = propsN & propMaskBeam
        const beamE = propsE & propMaskBeam
        const beamS = propsS & propMaskBeam
        const beamW = propsW & propMaskBeam
        if (beamC) {
          if (beamE && beamW && !beamS && !beamN) {
            val = val | masks[visualPropertyLookup.indexOf('beamEW')]
          } else if (!beamE && !beamW && beamS && beamN) {
            val = val | masks[visualPropertyLookup.indexOf('beamNS')]
          } else {
            val = val | masks[visualPropertyLookup.indexOf('beamCenter')]
            if (beamE) {
              val = val | masks[visualPropertyLookup.indexOf('beamE')]
            }
            if (beamW) {
              val = val | masks[visualPropertyLookup.indexOf('beamW')]
            }
            if (beamN) {
              val = val | masks[visualPropertyLookup.indexOf('beamN')]
            }
            if (beamS) {
              val = val | masks[visualPropertyLookup.indexOf('beamS')]
            }
          }
        }
        const propMaskBricks = masks[tilePropertyLookup.indexOf('bricks')]
        if (props & propMaskBricks) {
          const bricksS = propsN & propMaskBricks
          const bricksE = propsE & propMaskBricks
          const bricksN = propsS & propMaskBricks
          const bricksW = propsW & propMaskBricks
          if (bricksN) {
            val = val | masks[visualPropertyLookup.indexOf('bricks0')]
            val = val | masks[visualPropertyLookup.indexOf('bricks1')]
          } else if (!(beamC && beamS)) {
            val = val | masks[visualPropertyLookup.indexOf('bricks8')]
          }
          if (bricksE) {
            val = val | masks[visualPropertyLookup.indexOf('bricks2')]
            val = val | masks[visualPropertyLookup.indexOf('bricks3')]
          } else if (!(beamC && beamE)) {
            val = val | masks[visualPropertyLookup.indexOf('bricks9')]
          }
          if (bricksW) {
            val = val | masks[visualPropertyLookup.indexOf('bricks7')]
            val = val | masks[visualPropertyLookup.indexOf('bricks6')]
          } else if (!(beamC && beamW)) {
            val = val | masks[visualPropertyLookup.indexOf('bricks11')]
          }
          if (bricksS) {
            val = val | masks[visualPropertyLookup.indexOf('bricks4')]
            val = val | masks[visualPropertyLookup.indexOf('bricks5')]
          } else if (!(beamC && beamN)) {
            val = val | masks[visualPropertyLookup.indexOf('bricks10')]
          }
        }
        // val = val | masks[visualPropertyLookup.indexOf('bricks3')]
        // val = val | masks[visualPropertyLookup.indexOf('bricks8')]
        // val = val | masks[visualPropertyLookup.indexOf('bricks12')]
        visualProperties[i] = val
        const idBottom = tileMaker.getTileId(val)
        const idTop = tileMaker.getTileId(val | 1)
        const indexBottomX = (idBottom * 8) % 256
        const indexBottomY = ~~(idBottom / 32) * 8
        data[i4] = indexBottomX
        data[i4 + 1] = indexBottomY
        const indexTopX = (idTop * 8) % 256
        const indexTopY = ~~(idTop / 32) * 8
        data[i4 + 2] = indexTopX
        data[i4 + 3] = indexTopY
        // data[i4] = ~~rand2(0, 255)
        // data[i4+1] = ~~rand2(0, 255)
        // data[i4+2] = ~~rand2(0, 255)
        // data[i4+3] = ~~rand2(0, 255)
        // const testSrt = visualProperties[0].toString(16)
      }

      const mapTex = new DataTexture(
        data,
        64,
        64,
        RGBAFormat,
        UnsignedByteType,
        UVMapping,
        RepeatWrapping,
        RepeatWrapping,
        NearestFilter,
        NearestFilter
      )
      mapTex.needsUpdate = true

      const material = new BasicFullScreenMaterial({
        mapTex,
        tileTex,
        transform
      })

      const mapPreview = new Mesh(new PlaneGeometry(2, 2, 1, 1), material)
      scene.add(mapPreview)
    }
    initMapRenderer()
    this._transform = transform
  }
  update(dt: number) {
    super.update(dt)
  }
  render(renderer: WebGLRenderer, dt: number) {
    this._tileMaker.render(renderer)
    super.render(renderer, dt)
  }
}
