import { WebGLRenderer } from 'three'
import { Box2DPreviewMesh } from '~/meshes/Box2DPreviewMesh'
import { __physicsScale } from '~/settings/physics'
import { rand } from '~/utils/math'
import { createPhysicBox, createPhysicsCircle } from '~/utils/physics'
import { Body, Vec2, World } from '~/vendor/Box2D/Box2D'

import { BaseTestScene } from './BaseTestScene'

export default class TestPhysicsScene extends BaseTestScene {
  protected b2Preview: Box2DPreviewMesh
  protected myB2World: World
  private circleBodies: Body[] = []
  constructor(testBox = true, totalEnemies = 20, enemiesSelfCollide = true) {
    super()
    const myB2World = new World(new Vec2(0, -9.8))
    const b2Preview = new Box2DPreviewMesh(myB2World)
    this.scene.add(b2Preview)

    this.myB2World = myB2World
    this.b2Preview = b2Preview

    for (let i = 0; i < totalEnemies; i++) {
      const circleBody = createPhysicsCircle(
        this.myB2World,
        rand(-0.1, 0.1),
        0.1 + rand(-0.02, 0.02),
        0.005,
        enemiesSelfCollide
      )
      this.circleBodies.push(circleBody)
    }

    if (testBox) {
      createPhysicBox(this.myB2World, 0, -0.03, 0.1, 0.01)
      createPhysicBox(this.myB2World, 0.02, 0.03, 0.1, 0.01)
      const ramp = createPhysicBox(this.myB2World, 0.08, 0, 0.1, 0.01)
      ramp.SetAngle(Math.PI * 0.25)
    }
  }
  update(dt: number) {
    super.update(dt)
    this.myB2World.Step(dt, 10, 4)
    this.b2Preview.update(dt)
    for (const circleBody of this.circleBodies) {
      const p = circleBody.GetPosition()
      if (p.y < -1) {
        circleBody.SetLinearVelocity(new Vec2(0.0, 0.0))
        circleBody.SetPositionXY(
          rand(-0.1, 0.1) * __physicsScale,
          (0.1 + rand(-0.02, 0.02)) * __physicsScale
        )
      }
    }
  }
  render(renderer: WebGLRenderer, dt: number) {
    super.render(renderer, dt)
  }
}
