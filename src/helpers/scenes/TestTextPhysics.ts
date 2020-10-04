import { BufferGeometry, PerspectiveCamera, WebGLRenderer } from 'three'
import TextMesh from '~/text/TextMesh'
import { textSettings } from '~/text/TextSettings'
import { FPSControls } from '~/utils/fpsControls'
import { getUrlFlag } from '~/utils/location'
import { __pixelSizeMeters } from '~/settings/physics'
import { createPhysicBox } from '~/utils/physics'
import { Body, Fixture, Vec2, World } from '~/vendor/Box2D/Box2D'
import TestPhysicsScene from './TestPhysics'

const SCALE = 10

export default class TestTextPhysicsScene extends TestPhysicsScene {
  constructor() {
    super()
    const fps = new FPSControls(this.camera as PerspectiveCamera)
    if (getUrlFlag('fpsCam')) {
      fps.toggle(true)
    }

    let lastKnownTextBodies:Body[] | undefined

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
      textSettings.code, undefined, undefined, 
      
    )
    testCode.scale.multiplyScalar(s)
    testCode.position.x -= 2
    this.scene.add(testCode)

    testCode.onMeasurementsUpdated = () => {
        if(lastKnownTextBodies) {
            for (const body of lastKnownTextBodies) {
                //
            }
            lastKnownTextBodies = undefined
        }
        textToPhysicsBodies(testCode, this.myB2World)
    }

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
    const leap = mesh.geometry.attributes.position.itemSize*4
    const pos = mesh.position
    for(var i = 0; i < verts.length; i+=leap) {
        const l = verts[i+0]
        const r = verts[i+4]
        const t = verts[i+1]
        const b = verts[i+3]
        var bx:number = (l+r)/2 +pos.x * __pixelSizeMeters
        var by:number = (t+b)/2 +pos.y * __pixelSizeMeters
        var bwidth:number = r-l
        var bheight:number = t-b

        createPhysicBox(world, bx * SCALE, by * SCALE, bwidth * SCALE, bheight * SCALE)
    }
  }
}
