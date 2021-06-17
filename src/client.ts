import { Clock, Color, Vector3 } from 'three'

import { simpleTweener } from './animation/tweeners'
import { BaseTestScene } from './helpers/scenes/BaseTestScene'
import TestLightingScene from './helpers/scenes/TestLighting'
import renderer from './renderer'
import { testClasses } from './tests'
import { timeUniform } from './uniforms'
import { cameraShaker } from './utils/cameraShaker'
import { getUrlParam } from './utils/location'
import { nextFrameUpdate } from './utils/onNextFrame'
import { taskTimer } from './utils/taskTimer'
import UpdateManager from './utils/UpdateManager'

document.addEventListener('gesturestart', e => e.preventDefault()) // disable zooming on mobile

const clock = new Clock()
renderer.setClearColor(new Color(0x344556), 1.0)
cameraShaker.camera.position.set(0, 0.5, 0.5)
cameraShaker.camera.lookAt(new Vector3())

let TestClass: new () => BaseTestScene = TestLightingScene
const testParam = getUrlParam('test') || 'graphicsCharacter'
if (testClasses.hasOwnProperty(testParam)) {
  TestClass = testClasses[testParam]
}

const test: BaseTestScene = new TestClass()

const nthFrame: number = parseInt(getUrlParam('nthFrame') || '1')
let frameCounter = 0
let renderDt = 0
const loop = () => {
  frameCounter++
  const dt = Math.min(clock.getDelta(), 0.1) * simpleTweener.speed
  renderDt += dt

  nextFrameUpdate()
  simpleTweener.rafTick()
  UpdateManager.update(dt)
  taskTimer.update(dt)
  timeUniform.value += dt

  test.update(dt)
  if (frameCounter % nthFrame !== 0) {
    requestAnimationFrame(loop)
    return
  }
  test.render(renderer, renderDt)
  renderDt = 0

  requestAnimationFrame(loop)
}

// Start loop
requestAnimationFrame(loop)
