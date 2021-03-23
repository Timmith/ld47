import { WebGLRenderer } from 'three'
import { Box2DPreviewMesh } from '~/meshes/Box2DPreviewMesh'
import { createPhysicBox, createPhysicsCircle } from '~/utils/physics'
import { Body, Vec2 } from '~/vendor/Box2D/Box2D'
import { getSimulator } from '~/helpers/physics/simulator'

import { BaseTestScene } from './BaseTestScene'
import { detRand } from '~/utils/random'
import { nowInSeconds } from '~/utils/performance'


export default class TestPhysicsScene extends BaseTestScene {
  protected b2Preview: Box2DPreviewMesh
  protected sim = getSimulator(nowInSeconds)
  private circleBodies: Body[] = []
  constructor(testBox = true, totalEnemies = 20, enemiesSelfCollide = true) {
    super()
    const b2World = this.sim.world

    setInterval(() => console.log(this.sim.logPerformance()), 2000)
    const b2Preview = new Box2DPreviewMesh(b2World)
    this.scene.add(b2Preview)

    this.b2Preview = b2Preview
    

    for (let i = 0; i < totalEnemies; i++) {
      const circleBody = createPhysicsCircle(
        this.sim.world,
        detRand(-1, 1),
        1 + detRand(-0.2, 0.2),
        0.05,
        enemiesSelfCollide
      )
      this.circleBodies.push(circleBody)
    }

    if (testBox) {
      createPhysicBox(b2World, 0, -0.3, 1, 0.1)
      createPhysicBox(b2World, 0.2, 0.3, 1, 0.1)
      const ramp = createPhysicBox(b2World, 1.8, 0, 1, 0.1)
      ramp.SetAngle(Math.PI * 0.25)
    }
  }
  update(dt: number) {
    super.update(dt)
    this.sim.update(dt)
    this.b2Preview.update(dt)
    for (const circleBody of this.circleBodies) {
      const p = circleBody.GetPosition()
      if (p.y < -1) {
        circleBody.SetLinearVelocity(new Vec2(0.0, 0.0))
        circleBody.SetPositionXY(detRand(-1, 1), 1 + detRand(-0.2, 0.2))
      }
    }
  }
  render(renderer: WebGLRenderer, dt: number) {
    super.render(renderer, dt)
  }
}
