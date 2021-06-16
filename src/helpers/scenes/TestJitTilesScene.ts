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

      const masks32: number[] = []
      for (let i = 0; i < 32; i++) {
        masks32[i] = 1 << i
      }
      const masks8: number[] = []
      for (let i = 0; i < 8; i++) {
        masks8[i] = 1 << i
      }

      const metaPropertyLookup = [
        'floor',
        'beam',
        'bricks',
        'drywall',
        'grass',
        'bush'
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
        'ground',
        'grassC',
        'grassN',
        'grassNE',
        'grassE',
        'grassSE',
        'grassS',
        'grassSW',
        'grassW',
        'grassNW',
        'bushC',
        'bushN',
        'bushNE',
        'bushE',
        'bushSE',
        'bushS',
        'bushSW',
        'bushW',
        'bushNW'
      ]
      const bytesPerTile = Math.ceil(visualPropertyLookup.length / 8)

      function metaBitsHas(val: number, maskName: string) {
        return val & masks32[metaPropertyLookup.indexOf(maskName)]
      }

      function metaBitsFlip(val: number, maskName: string) {
        return val ^ masks32[metaPropertyLookup.indexOf(maskName)]
      }

      function visualBitsEnable(val: Uint8Array, maskName: string) {
        const i = visualPropertyLookup.indexOf(maskName)
        const ib = ~~(i / 8)
        const i8 = i % 8
        val[ib] |= masks8[i8]
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
        if (localMetaBitsHas('floor') && localMetaBitsHas('bush')) {
          localMetaBitsFlip('bush')
        }
        if (
          !localMetaBitsHas('floor') &&
          !localMetaBitsHas('grass') &&
          detRandGraphics() > 0.5
        ) {
          localMetaBitsFlip('grass')
        }
        if (!localMetaBitsHas('grass') && localMetaBitsHas('bush')) {
          localMetaBitsFlip('bush')
        }
        metaPropertyTiles[i] = localMetaProps
      }
      const visualProperties = new Uint8Array(totalTiles * bytesPerTile)
      for (let i = 0, i4 = 0; i < totalTiles; i++, i4 += 4) {
        localMetaProps = metaPropertyTiles[i]
        const x = i % 64
        const y = ~~(i / 64)
        const metaPropsN =
          metaPropertyTiles[wrap(x, 0, 64) + wrap(y - 1, 0, 64) * 64]
        const metaPropsNE =
          metaPropertyTiles[wrap(x + 1, 0, 64) + wrap(y - 1, 0, 64) * 64]
        const metaPropsE =
          metaPropertyTiles[wrap(x + 1, 0, 64) + wrap(y, 0, 64) * 64]
        const metaPropsSE =
          metaPropertyTiles[wrap(x + 1, 0, 64) + wrap(y + 1, 0, 64) * 64]
        const metaPropsS =
          metaPropertyTiles[wrap(x, 0, 64) + wrap(y + 1, 0, 64) * 64]
        const metaPropsSW =
          metaPropertyTiles[wrap(x - 1, 0, 64) + wrap(y + 1, 0, 64) * 64]
        const metaPropsW =
          metaPropertyTiles[wrap(x - 1, 0, 64) + wrap(y, 0, 64) * 64]
        const metaPropsNW =
          metaPropertyTiles[wrap(x - 1, 0, 64) + wrap(y - 1, 0, 64) * 64]
        const visProps = new Uint8Array(bytesPerTile)
        function myVisualBitsEnable(maskName: string) {
          visualBitsEnable(visProps, maskName)
        }

        myVisualBitsEnable(localMetaBitsHas('floor') ? 'floor' : 'ground')

        const propMaskGrass = masks32[metaPropertyLookup.indexOf('grass')]
        if (localMetaBitsHas('grass')) {
          myVisualBitsEnable('grassC')
          if (metaPropsN & propMaskGrass) {
            myVisualBitsEnable('grassN')
          }
          if (metaPropsE & propMaskGrass) {
            myVisualBitsEnable('grassE')
          }
          if (metaPropsS & propMaskGrass) {
            myVisualBitsEnable('grassS')
          }
          if (metaPropsW & propMaskGrass) {
            myVisualBitsEnable('grassW')
          }
          if (
            metaPropsNE & propMaskGrass &&
            metaPropsN & propMaskGrass &&
            metaPropsE & propMaskGrass
          ) {
            myVisualBitsEnable('grassNE')
          }
          if (
            metaPropsNW & propMaskGrass &&
            metaPropsN & propMaskGrass &&
            metaPropsW & propMaskGrass
          ) {
            myVisualBitsEnable('grassNW')
          }
          if (
            metaPropsSE & propMaskGrass &&
            metaPropsS & propMaskGrass &&
            metaPropsE & propMaskGrass
          ) {
            myVisualBitsEnable('grassSE')
          }
          if (
            metaPropsSW & propMaskGrass &&
            metaPropsS & propMaskGrass &&
            metaPropsW & propMaskGrass
          ) {
            myVisualBitsEnable('grassSW')
          }
        }
        const propMaskBush = masks32[metaPropertyLookup.indexOf('bush')]
        if (localMetaBitsHas('bush')) {
          myVisualBitsEnable('bushC')
          if (metaPropsN & propMaskBush) {
            myVisualBitsEnable('bushN')
          }
          if (metaPropsE & propMaskBush) {
            myVisualBitsEnable('bushE')
          }
          if (metaPropsS & propMaskBush) {
            myVisualBitsEnable('bushS')
          }
          if (metaPropsW & propMaskBush) {
            myVisualBitsEnable('bushW')
          }
          if (
            metaPropsNE & propMaskBush &&
            metaPropsN & propMaskBush &&
            metaPropsE & propMaskBush
          ) {
            myVisualBitsEnable('bushNE')
          }
          if (
            metaPropsNW & propMaskBush &&
            metaPropsN & propMaskBush &&
            metaPropsW & propMaskBush
          ) {
            myVisualBitsEnable('bushNW')
          }
          if (
            metaPropsSE & propMaskBush &&
            metaPropsS & propMaskBush &&
            metaPropsE & propMaskBush
          ) {
            myVisualBitsEnable('bushSE')
          }
          if (
            metaPropsSW & propMaskBush &&
            metaPropsS & propMaskBush &&
            metaPropsW & propMaskBush
          ) {
            myVisualBitsEnable('bushSW')
          }
        }
        const propMaskBeam = masks32[metaPropertyLookup.indexOf('beam')]
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
        const propMaskBricks = masks32[metaPropertyLookup.indexOf('bricks')]
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
        visualProperties.set(visProps, 0)
        const idBottom = tileMaker.getTileId(visProps)
        const visProps2 = visProps.slice()
        visProps2[0] |= 1
        const idTop = tileMaker.getTileId(visProps2)
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