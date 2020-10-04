import { WebGLRenderer } from 'three'
import { Box2DPreviewMesh } from '~/meshes/Box2DPreviewMesh'
import TextMesh from '~/text/TextMesh'
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
        rand(-1, 1),
        1 + rand(-0.2, 0.2),
        0.05,
        enemiesSelfCollide
      )
      this.circleBodies.push(circleBody)
    }

    const testTextMesh = new TextMesh('G')

    testTextMesh.geometry.boundingBox.max.x
    testTextMesh.geometry.boundingBox.max.y
    testTextMesh.geometry.boundingBox.min.x
    testTextMesh.geometry.boundingBox.min.y

    for (let i = 0; i < 10; i++) {
      createPhysicBox(this.myB2World, i - 5, -0.3, 0.5, 0.1)
    }

    /*     if (testBox) {
      createPhysicBox(this.myB2World, 0, -0.3, 1, 0.1)
      createPhysicBox(this.myB2World, 0.2, 0.3, 1, 0.1)
      const ramp = createPhysicBox(this.myB2World, 0.8, 0, 1, 0.1)
      ramp.SetAngle(Math.PI * 0.25)
    } */
  }

  update(dt: number) {
    super.update(dt)
    this.myB2World.Step(dt, 10, 4)
    this.b2Preview.update(dt)

    for (const circleBody of this.circleBodies) {
      const p = circleBody.GetPosition()
      if (p.y < -1) {
        circleBody.SetLinearVelocity(new Vec2(0.0, 0.0))
        circleBody.SetPositionXY(rand(-1, 1), 1 + rand(-0.2, 0.2))
      }
    }
  }
  render(renderer: WebGLRenderer, dt: number) {
    super.render(renderer, dt)
  }
}

/* export function textToPhysicsBodies(mesh:TextMesh):Body[]{
  private verts = mesh.geometry.boundingBox.min.x
  


  new private verts:Array

  mesh.geometry.vertices.array
  bodies = []
  leap = 3*4
  for(var i = 0; i < verts.length; i+=leap) {
    body = new body()
    fixture = new fixture()
    verts2d = []
    for(var j = 0; j < leap; i+=3) {
      verts2d.push(new vec2(verts[i+j], verts2[i+j+1]))
    }
    fixture.setpoly(verts2d)
    body.addfixture(fixture)
    bodies.push(body)
  }
  return bodies
} */
