import { Mesh, Object3D } from 'three'
import { materialLibrary } from '~/materials/library'
import CharacterPhysics from '~/physics/CharacterPhysics'
import { __physicsScale } from '~/settings/physics'
import { getCachedChamferedBoxGeometry } from '~/utils/geometry'
import { World } from '~/vendor/Box2D/Box2D'

export default class Character {
  visuals: Object3D
  private character: CharacterPhysics
  private torsoMesh: Mesh
  constructor(world: World) {
    this.character = new CharacterPhysics(world)
    const s = this.character.bodySize
    const o = this.character.bodyOffset
    const visuals = new Object3D()
    const torsoMesh = new Mesh(
      getCachedChamferedBoxGeometry(
        s.x + 0.003,
        s.y + 0.003,
        s.x + 0.003,
        0.001
      ),
      materialLibrary.keyboardPlasticKey
    )
    torsoMesh.castShadow = true
    torsoMesh.receiveShadow = true
    torsoMesh.position.set(o.x, o.y, 0)
    visuals.add(torsoMesh)
    this.torsoMesh = torsoMesh
    this.visuals = visuals
  }
  update(dt: number) {
    const char = this.character
    char.update(dt)
    let pos = char.body.GetPosition()
    pos = char.body.GetPosition()
    this.visuals.position.set(pos.x / __physicsScale, pos.y / __physicsScale, 0)
    this.visuals.position.x -= 0.12
    this.visuals.position.y += 0.158
    this.visuals.rotation.z = this.character.body.GetAngle()
    const s = this.character.bodySize
    const ds = this.character.defaultBodySize
    const w = s.x / ds.x
    const h = s.y / ds.y
    this.torsoMesh.scale.set(w, h, w)

    const o = this.character.bodyOffset
    this.torsoMesh.position.set(o.x, o.y, 0)
  }
}