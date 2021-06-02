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

      const masks: number[] = []
      for (let i = 0; i < 32; i++) {
        masks[i] = 1 << i
      }

      const metaPropertyLookup = [
        'floor',
        'beam',
        'bricks',
        'drywall',
        'grass',
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
        'grass',
        'ground'
      ]

      function metaBitsHas(val: number, maskName: string) {
        return val & masks[metaPropertyLookup.indexOf(maskName)]
      }

      function metaBitsFlip(val: number, maskName: string) {
        return val ^ masks[metaPropertyLookup.indexOf(maskName)]
      }

      function visualBitsEnable(val: number, maskName: string) {
        return val | masks[visualPropertyLookup.indexOf(maskName)]
      }

      const totalTiles = 64 * 64
      const metaPropertyTiles = new Uint8Array(totalTiles)

      let localMetaProps = 0
      function localMetaBitsFlip(maskName: string) {
        localMetaProps = metaBitsFlip(localMetaProps, maskName)
      }
      function localMetaBitsHas(maskName: string) {
        return metaBitsHas(localMetaProps, maskName)
      }

      for (let i = 0; i < totalTiles; i++) {
        localMetaProps = ~~detRandGraphics(255)
        if (localMetaBitsHas('floor') && detRandGraphics() > 0.3) {
          localMetaBitsFlip('floor')
        }
        if (!localMetaBitsHas('floor') && localMetaBitsHas('beam')) {
          localMetaBitsFlip('beam')
        }
        if (!localMetaBitsHas('beam') && localMetaBitsHas('bricks')) {
          localMetaBitsFlip('bricks')
        }
        if (localMetaBitsHas('floor') && localMetaBitsHas('grass')) {
          localMetaBitsFlip('grass')
        }
        metaPropertyTiles[i] = localMetaProps
      }
      const visualProperties = new Uint32Array(totalTiles)
      for (let i = 0, i4 = 0; i < totalTiles; i++, i4 += 4) {
        localMetaProps = metaPropertyTiles[i]
        const x = i % 64
        const y = ~~(i / 64)
        const metaPropsE =
          metaPropertyTiles[wrap(x + 1, 0, 64) + wrap(y, 0, 64) * 64]
        const metaPropsW =
          metaPropertyTiles[wrap(x - 1, 0, 64) + wrap(y, 0, 64) * 64]
        const metaPropsN =
          metaPropertyTiles[wrap(x, 0, 64) + wrap(y - 1, 0, 64) * 64]
        const metaPropsS =
          metaPropertyTiles[wrap(x, 0, 64) + wrap(y + 1, 0, 64) * 64]
        let visProps = 0
        function myVisualBitsEnable(maskName: string) {
          visProps = visualBitsEnable(visProps, maskName)
        }

        myVisualBitsEnable(localMetaBitsHas('floor') ? 'floor' : 'ground')

        if (localMetaBitsHas('grass')) {
          myVisualBitsEnable('grass')
        }
        const propMaskBeam = masks[metaPropertyLookup.indexOf('beam')]
        const beamC = localMetaProps & propMaskBeam
        const beamN = metaPropsN & propMaskBeam
        const beamE = metaPropsE & propMaskBeam
        const beamS = metaPropsS & propMaskBeam
        const beamW = metaPropsW & propMaskBeam
        if (beamC) {
          if (beamE && beamW && !beamS && !beamN) {
            myVisualBitsEnable('beamEW')
          } else if (!beamE && !beamW && beamS && beamN) {
            myVisualBitsEnable('beamNS')
          } else {
            myVisualBitsEnable('beamCenter')
            if (beamE) {
              myVisualBitsEnable('beamE')
            }
            if (beamW) {
              myVisualBitsEnable('beamW')
            }
            if (beamN) {
              myVisualBitsEnable('beamN')
            }
            if (beamS) {
              myVisualBitsEnable('beamS')
            }
          }
        }
        const propMaskBricks = masks[metaPropertyLookup.indexOf('bricks')]
        if (localMetaProps & propMaskBricks) {
          const bricksS = metaPropsN & propMaskBricks
          const bricksE = metaPropsE & propMaskBricks
          const bricksN = metaPropsS & propMaskBricks
          const bricksW = metaPropsW & propMaskBricks
          if (bricksN) {
            myVisualBitsEnable('bricks0')
            myVisualBitsEnable('bricks1')
          } else if (!(beamC && beamS)) {
            myVisualBitsEnable('bricks8')
          }
          if (bricksE) {
            myVisualBitsEnable('bricks2')
            myVisualBitsEnable('bricks3')
          } else if (!(beamC && beamE)) {
            myVisualBitsEnable('bricks9')
          }
          if (bricksW) {
            myVisualBitsEnable('bricks7')
            myVisualBitsEnable('bricks6')
          } else if (!(beamC && beamW)) {
            myVisualBitsEnable('bricks11')
          }
          if (bricksS) {
            myVisualBitsEnable('bricks4')
            myVisualBitsEnable('bricks5')
          } else if (!(beamC && beamN)) {
            myVisualBitsEnable('bricks10')
          }
        }
        visualProperties[i] = visProps
        const idBottom = tileMaker.getTileId(visProps)
        const idTop = tileMaker.getTileId(visProps | 1)
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
