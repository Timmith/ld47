import { BufferGeometry, PerspectiveCamera, WebGLRenderer } from 'three'
import TextMesh from '~/text/TextMesh'
import { textSettings } from '~/text/TextSettings'
import { FPSControls } from '~/utils/fpsControls'
import { getUrlFlag } from '~/utils/location'
import { createPhysicBox } from '~/utils/physics'
import { Body, Fixture, Vec2, World } from '~/vendor/Box2D/Box2D'
import TestPhysicsScene from './TestPhysics'

const SCALE = (1)

export default class TestTextPhysicsScene extends TestPhysicsScene {
  constructor() {
    super()
    const fps = new FPSControls(this.camera as PerspectiveCamera)
    if (getUrlFlag('fpsCam')) {
      fps.toggle(true)
    }

    const s = 10

    const testCode = new TextMesh(
      [
        '/**',
        '* For the brave souls who get this far: You are the chosen ones,',
        '* the valiant knights of programming who toil away, without rest,',
        '* fixing our most awful code. To you, true saviors, kings of men,',
        '* I say this: never gonna give you up, never gonna let you down,',
        '* never gonna run around and desert you. Never gonna make you cry,',
        '* never gonna say goodbye. Never gonna tell a lie and hurt you.',
        '*/'
      ].join('\n'),
      textSettings.code
    )
    testCode.scale.multiplyScalar(s)
    testCode.position.x -= 2
    this.scene.add(testCode)

    setTimeout(()=> textToPhysicsBodies(testCode, this.myB2World), 1000)

    const init = async () => {
      //
    }
    init()
  }
  update(dt: number) {
    super.update(dt)
  }
  render(renderer: WebGLRenderer, dt: number) {
    super.render(renderer, dt)
  }
}

export function textToPhysicsBodies(mesh:TextMesh, world:World){
  if (mesh.geometry instanceof BufferGeometry) {
    const verts = mesh.geometry.attributes.position.array
    const leap = 3*4

    for(var i = 0; i < verts.length; i+=leap) {

        var bx:number = (verts[i+0] + verts[i+3])/2
        var by:number = (verts[i+1] + verts[i+7])/2
        var bwidth:number = (verts[i+3] - verts[i+0])
        var bheight:number = (verts[i+1] - verts[i+7])

        createPhysicBox(world, bx * SCALE, by * SCALE, bwidth * SCALE, bheight * SCALE)
    }
  }
}
