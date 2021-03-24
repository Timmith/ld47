import { WebGLRenderer } from 'three'
import { Box2DPreviewMesh } from '~/meshes/Box2DPreviewMesh'
import { getSimulator } from '~/helpers/physics/simulator'

import { BaseTestScene } from './BaseTestScene'
import { nowInSeconds } from '~/utils/performance'
import BasicBalls from '~/physics/tests/BasicBalls'


export default class TestPhysicsScene extends BaseTestScene {
  protected b2Preview: Box2DPreviewMesh
  protected sim = getSimulator(nowInSeconds, new BasicBalls())
  constructor() {
    super()
    const b2World = this.sim.world

    setInterval(() => console.log(this.sim.logPerformance()), 2000)
    const b2Preview = new Box2DPreviewMesh(b2World)
    this.scene.add(b2Preview)

    this.b2Preview = b2Preview

  }
  update(dt: number) {
    super.update(dt)
    this.sim.update(dt)
    this.b2Preview.update(dt)
  }
  render(renderer: WebGLRenderer, dt: number) {
    super.render(renderer, dt)
  }
}
