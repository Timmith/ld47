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

import TileDescription from './TileDescription'

// const scale = 1
const scale = Math.SQRT2 / 2
const layer = 0
export default class TileMaker {
  private _renderQueue: number[] = []
  private _tileRegistry: TileDescription[] = []
  private _scene = new Scene()
  private _camera = new OrthographicCamera(
    -16,
    16,
    (layer * 32 + 16) * scale,
    (layer * 32 - 16) * scale,
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

  get texture() {
    return this._renderTarget.texture
  }
  constructor() {
    const scene = this._scene
    this._camera.rotateX(Math.PI * -0.25)
    this._camera.position.set(0, 32, 32)
    scene.add(this._camera)
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

    const woodPlateGeo = getChamferedBoxGeometry(32, 3, 6, 1)
    const bottomPlate = new Mesh(woodPlateGeo, woodMat)
    pivot.add(bottomPlate)
    bottomPlate.position.y = 1.5
    const topPlate = new Mesh(woodPlateGeo, woodMat)
    pivot.add(topPlate)
    topPlate.position.y = 32 - 1.5

    const woodStudGeo = getChamferedBoxGeometry(4, 32 - 6, 6, 1)
    const stud = new Mesh(woodStudGeo, woodMat)
    pivot.add(stud)
    stud.position.y = 16

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
    pivot.add(drywall)
    floor.position.y = -1
    scene.add(floor)
    // scene.add(ball)
    scene.add(pivot)
    this._pivot = pivot
  }
  getTileId(tileDescription: TileDescription) {
    let index = this._tileRegistry.indexOf(tileDescription)
    if (index == -1) {
      this._tileRegistry.push(tileDescription)
      index = this._tileRegistry.length
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
      for (let iCol = 0; iCol < 8; iCol++) {
        for (let iRow = 0; iRow < 8; iRow++) {
          this._pivot.rotation.y = (~~detRandGraphics(0, 4) * Math.PI * 2) / 4
          this._pivot.updateMatrix()
          this._pivot.updateMatrixWorld()
          // this._testMaterial.color.setHSL(detRandGraphics(), detRandGraphics(), detRandGraphics())
          renderer.setViewport(iCol * 32, iRow * 32, 32, 32)
          renderer.setScissor(iCol * 32, iRow * 32, 32, 32)
          renderer.render(this._scene, this._camera)
        }
      }
      renderer.setViewport(oldViewport)
      renderer.setScissor(oldScissor)
      renderer.setScissor(0, 0, 256, 256)
      renderer.setRenderTarget(null)
      renderer.setPixelRatio(originalPixelRatio)
      this._renderQueue.length = 0
    }
  }
}
