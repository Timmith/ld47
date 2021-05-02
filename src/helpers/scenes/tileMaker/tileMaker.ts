import {
  BoxBufferGeometry,
  Color,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  NearestFilter,
  Object3D,
  OrthographicCamera,
  Scene,
  SphereGeometry,
  Vector4,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three'
import { getMaterial } from '~/helpers/materials/materialLib'
import { getChamferedBoxGeometry } from '~/utils/geometry'
import { detRandGraphics } from '~/utils/random'

import { TileDescription } from './TileDescription'

// const scale = 1
const scale = Math.SQRT2 / 2
const layer = 0
export default class TileMaker {
  private _renderQueue: number[] = []
  private _tileRegistry: TileDescription[] = []
  private _scene = new Scene()
  private _cameraBottom = new OrthographicCamera(
    -16,
    16,
    (0 * 32 + 16) * scale,
    (0 * 32 - 16) * scale,
    0,
    64
  )
  private _cameraTop = new OrthographicCamera(
    -16,
    16,
    (1 * 32 + 16) * scale,
    (1 * 32 - 16) * scale,
    0,
    64
  )
  private _renderTarget = new WebGLRenderTarget(256, 256, {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    generateMipmaps: false
  })
  private _tileTexNeedsUpdate = true
  private _pivot: Object3D
  private _indexedMeshes: Object3D[]

  get texture() {
    return this._renderTarget.texture
  }
  constructor() {
    const scene = this._scene
    this._cameraBottom.rotateX(Math.PI * -0.25)
    this._cameraBottom.position.set(0, 32, 32)
    scene.add(this._cameraBottom)
    this._cameraTop.rotateX(Math.PI * -0.25)
    this._cameraTop.position.set(0, 32, 32)
    scene.add(this._cameraTop)
    const ambient = new HemisphereLight(
      new Color(0.4, 0.6, 0.9),
      new Color(0.6, 0.25, 0)
    )
    scene.add(ambient)
    const light = new DirectionalLight(new Color(1, 0.9, 0.7), 1)
    light.position.set(-0.25, 1, 0.25).normalize()
    scene.add(light)
    const brickMat = getMaterial('brick')
    const mortarMat = getMaterial('mortar')
    const drywallMat = getMaterial('drywall')
    const floorMat = getMaterial('floor')
    const ballMat = getMaterial('plastic')
    const woodMat = getMaterial('wood')
    const ball = new Mesh(new SphereGeometry(16, 32, 16), ballMat)
    ball.scale.y = Math.SQRT1_2
    // ball.position.y = Math.SQRT1_2 * 14
    const pivot = new Object3D()
    // pivot.rotation.y = Math.PI * 0.25
    const floor = new Mesh(new BoxBufferGeometry(32, 2, 32), floorMat)
    const mortar = new Mesh(new BoxBufferGeometry(32, 32, 2), mortarMat)
    const drywall = new Mesh(new BoxBufferGeometry(32, 32, 2), drywallMat)
    const brickWidth = 7
    const brickHeight = 3
    const brickGap = 1
    const brickSpacingX = brickWidth + brickGap
    const brickSpacingY = brickHeight
    const brickGeo = getChamferedBoxGeometry(brickWidth, brickHeight, 4.5, 1)
    const brickWallRoot = new Object3D()
    for (let iRow = 0; iRow < 11; iRow++) {
      for (let iCol = -6; iCol < 6; iCol++) {
        const budge = (iRow % 2) * 0.5 - 0.25
        const brick = new Mesh(brickGeo, brickMat)
        brick.position.set(
          (iCol + budge) * brickSpacingX + 0.5,
          (iRow + 0.5) * brickSpacingY,
          0
        )
        brickWallRoot.add(brick)
      }
    }

    const woodPlateGeo = getChamferedBoxGeometry(36, 3, 6, 1)
    const bottomPlate = new Mesh(woodPlateGeo, woodMat)
    bottomPlate.position.y = 1.5
    const topPlate = new Mesh(woodPlateGeo, woodMat)
    topPlate.position.y = 32 - 1.5
    const woodBeamGeo = getChamferedBoxGeometry(6, 32, 6, 1)
    const beamCenter = new Mesh(woodBeamGeo, woodMat)
    beamCenter.position.y = 16

    const woodStudGeo = getChamferedBoxGeometry(4, 32 - 6, 6, 1)
    const stud = new Mesh(woodStudGeo, woodMat)
    const beamFullSectionEW = new Object3D()
    beamFullSectionEW.add(bottomPlate)
    beamFullSectionEW.add(topPlate)
    beamFullSectionEW.add(stud)
    stud.position.y = 16
    const stud2 = stud.clone()
    stud2.position.x -= 16
    const stud3 = stud.clone()
    stud3.position.x += 16
    beamFullSectionEW.add(stud2)
    beamFullSectionEW.add(stud3)
    const beamFullSectionNS = beamFullSectionEW.clone(true)
    beamFullSectionNS.rotation.y = Math.PI * 0.5

    const woodPlateShortGeo = getChamferedBoxGeometry(15, 3, 6, 1)
    const bottomShortPlate = new Mesh(woodPlateShortGeo, woodMat)
    bottomShortPlate.position.x = 1
    bottomShortPlate.position.y = 1.5
    const topShortPlate = new Mesh(woodPlateShortGeo, woodMat)
    topShortPlate.position.x = 1
    topShortPlate.position.y = 32 - 1.5

    const beamW = new Object3D()
    const shortBeam = new Object3D()
    shortBeam.add(topShortPlate)
    shortBeam.add(bottomShortPlate)
    const stud4 = stud.clone()
    stud4.position.x = -4.5
    const stud5 = stud.clone()
    stud5.position.x = 6.5
    shortBeam.add(stud4)
    shortBeam.add(stud5)
    shortBeam.position.x = 16 - 13 * 0.5
    beamW.add(shortBeam)
    const beamS = beamW.clone()
    beamS.rotation.y = Math.PI * 0.5
    const beamE = beamW.clone()
    beamW.rotation.y = Math.PI
    const beamN = beamW.clone()
    beamN.rotation.y = Math.PI * -0.5

    // brick.rotation.y = Math.PI * 0.25
    mortar.position.y = 16
    mortar.position.z = -0.25
    drywall.position.y = 16
    drywall.position.z = -4
    // ball.position.y = 14
    // this._camera.position.y = 16
    // this._camera.rotateY(Math.PI * -0.25)
    pivot.add(brickWallRoot)
    brickWallRoot.position.z = 5
    brickWallRoot.add(mortar)
    pivot.add(beamCenter)
    pivot.add(beamW)
    pivot.add(beamS)
    pivot.add(beamE)
    pivot.add(beamN)
    pivot.add(beamFullSectionEW)
    pivot.add(beamFullSectionNS)
    // pivot.add(drywall)
    floor.position.y = -1
    scene.add(floor)
    // scene.add(ball)
    scene.add(pivot)

    const dummy = new Object3D()

    const indexedMeshes = [
      dummy,
      floor,
      beamCenter,
      beamN, // 'beamN',
      beamE, // 'beamE',
      beamS, // 'beamS',
      beamW, // 'beamW',
      beamFullSectionNS, // 'beamNS',
      beamFullSectionEW, // 'beamEW',
      brickWallRoot
      // 'bricks1',
      // 'bricks2',
      // 'bricks3',
      // 'bricks4',
      // 'bricks5',
      // 'bricks6',
      // 'bricks7',
      // 'bricks8',
      // 'bricks9',
      // 'bricks10',
      // 'bricks11',
      // 'bricks12',
      // 'bricks13',
      // 'bricks14',
      // 'bricks15'
    ]

    this._indexedMeshes = indexedMeshes

    this._pivot = pivot
  }
  getTileId(tileDescription: TileDescription) {
    let index = this._tileRegistry.indexOf(tileDescription)
    if (index == -1) {
      index = this._tileRegistry.length
      this._tileRegistry.push(tileDescription)
      this._renderQueue.push(index)
      this._tileTexNeedsUpdate = true
    }
    return index
  }
  render(renderer: WebGLRenderer) {
    if (this._tileTexNeedsUpdate) {
      const originalPixelRatio = renderer.getPixelRatio()
      renderer.setPixelRatio(1)
      const oldViewport = new Vector4()
      const oldScissor = new Vector4()
      renderer.getViewport(oldViewport)
      renderer.getScissor(oldScissor)
      this._tileTexNeedsUpdate = false
      renderer.setRenderTarget(this._renderTarget)
      for (let i = 0; i < this._renderQueue.length; i++) {
        const index = this._renderQueue[i]
        const iCol = index % 8
        const iRow = ~~(index / 8)
        // this._pivot.rotation.y = (~~detRandGraphics(0, 4) * Math.PI * 2) / 4
        // this._pivot.updateMatrix()
        // this._pivot.updateMatrixWorld()
        // this._testMaterial.color.setHSL(detRandGraphics(), detRandGraphics(), detRandGraphics())
        const visualProps = this._tileRegistry[index]
        const layer2 = !!(visualProps & 1)
        for (let j = 0; j < this._indexedMeshes.length; j++) {
          this._indexedMeshes[j].visible = !!(visualProps & (1 << j))
        }
        renderer.setViewport(iCol * 32, iRow * 32, 32, 32)
        renderer.setScissor(iCol * 32, iRow * 32, 32, 32)
        renderer.render(
          this._scene,
          layer2 ? this._cameraTop : this._cameraBottom
        )
      }
      // for (let iCol = 0; iCol < 8; iCol++) {
      //   for (let iRow = 0; iRow < 8; iRow++) {
      //     this._pivot.rotation.y = (~~detRandGraphics(0, 4) * Math.PI * 2) / 4
      //     this._pivot.updateMatrix()
      //     this._pivot.updateMatrixWorld()
      //     // this._testMaterial.color.setHSL(detRandGraphics(), detRandGraphics(), detRandGraphics())
      //     renderer.setViewport(iCol * 32, iRow * 32, 32, 32)
      //     renderer.setScissor(iCol * 32, iRow * 32, 32, 32)
      //     renderer.render(this._scene, this._camera)
      //   }
      // }
      renderer.setViewport(oldViewport)
      renderer.setScissor(oldScissor)
      renderer.setScissor(0, 0, 256, 256)
      renderer.setRenderTarget(null)
      renderer.setPixelRatio(originalPixelRatio)
      this._renderQueue.length = 0
    }
  }
}
