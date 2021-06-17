import {
  Color,
  Mesh,
  NearestFilter,
  OrthographicCamera,
  PlaneBufferGeometry,
  Scene,
  Vector2,
  Vector4,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three'
import getKeyboardInput from '~/input/getKeyboardInput'
import { BasicTextureMaterial } from '~/materials/BasicTextureMaterial'
import { SimplexNoiseMaterial } from '~/materials/SimplexNoiseMaterial'

import BaseTest2DScene from './BaseTest2DScene'

type ValidMovementKeys = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'

const ValidMovementKeysProxy: { [K in ValidMovementKeys]: 0 } = {
  ArrowUp: 0,
  ArrowDown: 0,
  ArrowLeft: 0,
  ArrowRight: 0
}

export const ValidMovementKeysStrings = Object.keys(ValidMovementKeysProxy)

export function isValidMovementKeys(x: string): x is ValidMovementKeys {
  return ValidMovementKeysStrings.includes(x)
}

export default class TestCachedScrollingNoiseViewShaderScene extends BaseTest2DScene {
  uvST: Vector4
  cacheRenderTarget: WebGLRenderTarget
  textureCachingRoom: Scene
  textureCachingCamera: OrthographicCamera
  scrollDirection = new Vector2()
  lastScrollOffset = new Vector2()
  scrollOffset = new Vector2()
  cacheResolution = new Vector2(256, 256)
  cacheDirty = true
  color: Color
  constructor() {
    super()

    const geo = new PlaneBufferGeometry(1, 1)
    const uvST = new Vector4(1, 1, 0, 0)
    this.uvST = uvST
    const color = new Color(1, 1, 0.4)
    this.color = color
    const previewSource = new Mesh(
      geo,
      new SimplexNoiseMaterial({
        color,
        uvST
      })
    )
    this.scene.add(previewSource)
    const cacheRenderTarget = new WebGLRenderTarget(
      this.cacheResolution.x,
      this.cacheResolution.y,
      {
        magFilter: NearestFilter,
        minFilter: NearestFilter
      }
    )
    const previewCachedRaw = new Mesh(
      geo,
      new BasicTextureMaterial({
        texture: cacheRenderTarget.texture
      })
    )
    const textureCachingRoom = new Scene()
    const textureCachingCamera = new OrthographicCamera(
      -0.5,
      0.5,
      0.5,
      -0.5,
      -0.5,
      0.5
    )
    const noiseSource = previewSource.clone()
    textureCachingRoom.add(textureCachingCamera)
    textureCachingRoom.add(noiseSource)

    this.textureCachingRoom = textureCachingRoom
    this.textureCachingCamera = textureCachingCamera

    previewCachedRaw.position.x = -1
    this.scene.add(previewCachedRaw)
    this.cacheRenderTarget = cacheRenderTarget
    const scrollDirection = this.scrollDirection
    const buttonStates: { [K in ValidMovementKeys]: boolean } = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false
    }
    getKeyboardInput().addListener((key, down) => {
      if (isValidMovementKeys(key)) {
        buttonStates[key] = down
      }
      scrollDirection.x = buttonStates.ArrowLeft ? -1 : 0
      scrollDirection.x += buttonStates.ArrowRight ? 1 : 0
      scrollDirection.y = buttonStates.ArrowUp ? -1 : 0
      scrollDirection.y += buttonStates.ArrowDown ? 1 : 0
    })
  }
  update(dt: number) {
    this.scrollOffset.x += this.scrollDirection.x * dt * this.cacheResolution.x
    this.scrollOffset.y -= this.scrollDirection.y * dt * this.cacheResolution.y
    super.update(dt)
  }
  render(renderer: WebGLRenderer, dt: number) {
    if (this.cacheDirty) {
      renderer.setRenderTarget(this.cacheRenderTarget)
      renderer.render(this.textureCachingRoom, this.textureCachingCamera)
      renderer.setRenderTarget(null)
      this.cacheDirty = false
    } else if (!this.scrollOffset.equals(this.lastScrollOffset)) {
      this.color.setHSL(Math.random(), 1, 0.8)
      let xNew = Math.round(this.scrollOffset.x)
      let xOld = Math.round(this.lastScrollOffset.x)
      let yNew = Math.round(this.scrollOffset.y)
      let yOld = Math.round(this.lastScrollOffset.y)
      let xDelta = xNew - xOld
      let yDelta = yNew - yOld
      if (xDelta !== 0) {
        if (xNew < xOld) {
          const xTemp = xNew
          xNew = xOld
          xOld = xTemp
          xDelta *= -1
          this.uvST.z = xNew / this.cacheResolution.x - 1
        } else {
          this.uvST.z = xNew / this.cacheResolution.x
        }

        this.cacheRenderTarget.viewport.set(
          -this.cacheResolution.x + xNew,
          0,
          this.cacheResolution.x,
          this.cacheResolution.y
        )
        this.cacheRenderTarget.scissor.set(
          xOld,
          0,
          xDelta,
          this.cacheResolution.y
        )
        this.cacheRenderTarget.scissorTest = true
        renderer.setRenderTarget(this.cacheRenderTarget)
        renderer.render(this.textureCachingRoom, this.textureCachingCamera)
        renderer.setRenderTarget(null)
      }
      if (yDelta !== 0) {
        if (yNew < yOld) {
          const yTemp = yNew
          yNew = yOld
          yOld = yTemp
          yDelta *= -1
          this.uvST.w = yNew / this.cacheResolution.y - 1
        } else {
          this.uvST.w = yNew / this.cacheResolution.y
        }
        this.cacheRenderTarget.viewport.set(
          0,
          -this.cacheResolution.y + yNew,
          this.cacheResolution.x,
          this.cacheResolution.y
        )
        this.cacheRenderTarget.scissor.set(
          0,
          yOld,
          this.cacheResolution.x,
          yDelta
        )
        this.cacheRenderTarget.scissorTest = true
        renderer.setRenderTarget(this.cacheRenderTarget)
        renderer.render(this.textureCachingRoom, this.textureCachingCamera)
        renderer.setRenderTarget(null)
      }
      this.lastScrollOffset.copy(this.scrollOffset)
    }
    super.render(renderer, dt)
  }
}
