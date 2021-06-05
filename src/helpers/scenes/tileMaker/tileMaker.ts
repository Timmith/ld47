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
import BushGeometry from '~/geometries/BushGeometry'
import GrassGeometry from '~/geometries/GrassGeometry'
import { getMaterial } from '~/helpers/materials/materialLib'
import { getChamferedBoxGeometry } from '~/utils/geometry'

// const scale = 1
const scale = Math.SQRT2 / 2
export default class TileMaker {
  private _renderQueue: number[] = []
  private _tileRegistry: number[] = []
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
  private _renderTarget = new WebGLRenderTarget(1024, 1024, {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    generateMipmaps: false
  })
  private _tileTexNeedsUpdate = true
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
    const groundMat = getMaterial('ground')
    const ballMat = getMaterial('plastic')
    const grassMat = getMaterial('grass')
    const bushMat = getMaterial('bush')
    const woodMat = getMaterial('wood')
    const ball = new Mesh(new SphereGeometry(16, 32, 16), ballMat)
    ball.scale.y = Math.SQRT1_2
    // ball.position.y = Math.SQRT1_2 * 14
    const pivot = new Object3D()
    // pivot.rotation.y = Math.PI * 0.25
    const floor = new Mesh(new BoxBufferGeometry(32, 2, 32), floorMat)
    const ground = new Mesh(new BoxBufferGeometry(32, 2, 32), groundMat)

    //brick walls

    const drywall = new Mesh(new BoxBufferGeometry(32, 32, 2), drywallMat)
    const brickWidth = 7
    const brickHeight = 3
    const brickGap = 1
    const brickSpacingX = brickWidth + brickGap
    const brickSpacingY = brickHeight
    const brickGeo = getChamferedBoxGeometry(brickWidth, brickHeight, 4.5, 1)
    function makeBrickWall(colStart: number, colEnd: number) {
      const brickWallRoot = new Object3D()
      for (let iRow = 0; iRow < 11; iRow++) {
        for (let iCol = -1; iCol < 1; iCol++) {
          const budge = (iRow % 2) * 0.5 - 0.25
          const brick = new Mesh(brickGeo, brickMat)
          brick.position.set(
            (iCol + budge) * brickSpacingX + brickWidth * 0.5,
            (iRow + 0.5) * brickSpacingY,
            0
          )
          brickWallRoot.add(brick)
        }
      }
      const mortar = new Mesh(
        new BoxBufferGeometry((colEnd - colStart) * brickSpacingX - 1, 32, 1),
        mortarMat
      )
      mortar.position.x = -1
      mortar.position.y = 16
      mortar.position.z = -0.75
      brickWallRoot.add(mortar)
      return brickWallRoot
    }
    const brickWallSectionSC = makeBrickWall(-1, 1)
    const brickWallSectionEC = brickWallSectionSC.clone(true)
    const brickWallSectionNC = brickWallSectionSC.clone(true)
    const brickWallSectionWC = brickWallSectionSC.clone(true)
    brickWallSectionSC.position.z = 8
    brickWallSectionSC.position.x = 0
    brickWallSectionEC.position.x = 8
    brickWallSectionEC.rotation.y = Math.PI * 0.5
    brickWallSectionWC.position.x = -8
    brickWallSectionWC.rotation.y = Math.PI * -0.5
    brickWallSectionNC.position.z = -8
    brickWallSectionNC.rotation.y = Math.PI
    function makeBrickWallSectionsLR(brickWallC: Object3D) {
      const brickWallL = brickWallC.clone(true)
      const brickWallR = brickWallC.clone(true)
      function moveRelX(brickWall: Object3D, amt: number) {
        brickWall.position.x += Math.cos(brickWall.rotation.y) * amt
        brickWall.position.z += Math.sin(brickWall.rotation.y) * amt
      }
      moveRelX(brickWallL, -16)
      moveRelX(brickWallR, 16)
      return { brickWallL, brickWallR }
    }
    const {
      brickWallL: brickWallSectionSL,
      brickWallR: brickWallSectionSR
    } = makeBrickWallSectionsLR(brickWallSectionSC)
    const {
      brickWallL: brickWallSectionWL,
      brickWallR: brickWallSectionWR
    } = makeBrickWallSectionsLR(brickWallSectionWC)
    const {
      brickWallL: brickWallSectionNL,
      brickWallR: brickWallSectionNR
    } = makeBrickWallSectionsLR(brickWallSectionNC)
    const {
      brickWallL: brickWallSectionEL,
      brickWallR: brickWallSectionER
    } = makeBrickWallSectionsLR(brickWallSectionEC)

    //wooden beams, struts and studs

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
    drywall.position.y = 16
    drywall.position.z = -4
    // ball.position.y = 14
    // this._camera.position.y = 16
    // this._camera.rotateY(Math.PI * -0.25)
    pivot.add(brickWallSectionNC)
    pivot.add(brickWallSectionWC)
    pivot.add(brickWallSectionSC)
    pivot.add(brickWallSectionEC)
    pivot.add(brickWallSectionNL)
    pivot.add(brickWallSectionWL)
    pivot.add(brickWallSectionSL)
    pivot.add(brickWallSectionEL)
    pivot.add(brickWallSectionNR)
    pivot.add(brickWallSectionWR)
    pivot.add(brickWallSectionSR)
    pivot.add(brickWallSectionER)
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
    ground.position.y = -1
    scene.add(ground)
    // scene.add(ball)
    scene.add(pivot)


    const grassGeoA = new GrassGeometry()
    const grassGeoH = new GrassGeometry()
    const grassGeoV = new GrassGeometry()
    const grassGeoCorner = new GrassGeometry()
    //grass
    const grassC = new Mesh(grassGeoA, grassMat)
    scene.add(grassC)
    const grassN = new Mesh(grassGeoV, grassMat)
    scene.add(grassN)
    grassN.position.set(0, 0, 16)
    const grassNE = new Mesh(grassGeoCorner, grassMat)
    scene.add(grassNE)
    grassNE.position.set(16, 0, 16)
    const grassE = new Mesh(grassGeoH, grassMat)
    scene.add(grassE)
    grassE.position.set(16, 0, 0)
    const grassSE = new Mesh(grassGeoCorner, grassMat)
    scene.add(grassSE)
    grassSE.position.set(16, 0, -16)
    const grassS = new Mesh(grassGeoV, grassMat)
    scene.add(grassS)
    grassS.position.set(0, 0, -16)
    const grassSW = new Mesh(grassGeoCorner, grassMat)
    scene.add(grassSW)
    grassSW.position.set(-16, 0, -16)
    const grassW = new Mesh(grassGeoH, grassMat)
    scene.add(grassW)
    grassW.position.set(-16, 0, 0)
    const grassNW = new Mesh(grassGeoCorner, grassMat)
    scene.add(grassNW)
    grassNW.position.set(-16, 0, 16)

    const bushGeoA = new BushGeometry()
    const bushGeoH = new BushGeometry()
    const bushGeoV = new BushGeometry()
    const bushGeoCorner = new BushGeometry()
    //bush
    const bushC = new Mesh(bushGeoA, bushMat)
    scene.add(bushC)
    const bushN = new Mesh(bushGeoV, bushMat)
    scene.add(bushN)
    bushN.position.set(0, 0, 16)
    const bushNE = new Mesh(bushGeoCorner, bushMat)
    scene.add(bushNE)
    bushNE.position.set(16, 0, 16)
    const bushE = new Mesh(bushGeoH, bushMat)
    scene.add(bushE)
    bushE.position.set(16, 0, 0)
    const bushSE = new Mesh(bushGeoCorner, bushMat)
    scene.add(bushSE)
    bushSE.position.set(16, 0, -16)
    const bushS = new Mesh(bushGeoV, bushMat)
    scene.add(bushS)
    bushS.position.set(0, 0, -16)
    const bushSW = new Mesh(bushGeoCorner, bushMat)
    scene.add(bushSW)
    bushSW.position.set(-16, 0, -16)
    const bushW = new Mesh(bushGeoH, bushMat)
    scene.add(bushW)
    bushW.position.set(-16, 0, 0)
    const bushNW = new Mesh(bushGeoCorner, bushMat)
    scene.add(bushNW)
    bushNW.position.set(-16, 0, 16)

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
      brickWallSectionWR, // 0
      brickWallSectionEL, // 1
      brickWallSectionNR, // 2
      brickWallSectionSR, // 3
      brickWallSectionER, // 4
      brickWallSectionWL, // 5
      brickWallSectionSL, // 6
      brickWallSectionNL, // 7
      brickWallSectionNC, // 8
      brickWallSectionEC, // 9
      brickWallSectionSC, // 10
      brickWallSectionWC, // 11
      ground,
      grassC,
      grassN,
      grassNE,
      grassE,
      grassSE,
      grassS,
      grassSW,
      grassW,
      grassNW,
      bushC,
      bushN,
      bushNE,
      bushE,
      bushSE,
      bushS,
      bushSW,
      bushW,
      bushNW
    ]

    this._indexedMeshes = indexedMeshes
  }
  getTileId(tileDescription: number) {
    let index = this._tileRegistry.indexOf(tileDescription)
    if (index == -1) {
      index = this._tileRegistry.length
      if (index >= 1024) {
        console.error(`no more room for tiles! (${index})`)
      }
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
        const iCol = index % 32
        const iRow = ~~(index / 32)
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
      renderer.setViewport(oldViewport)
      renderer.setScissor(oldScissor)
      renderer.setRenderTarget(null)
      renderer.setPixelRatio(originalPixelRatio)
      this._renderQueue.length = 0
    }
  }
}
