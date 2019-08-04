import KeyboardInput from '~/input/KeyboardInput'
import { __physicsScale } from '~/settings/physics'
import { cleanRemoveFromArrayMap, pushToArrayMap } from '~/utils/arrayUtils'
import { KeyboardCodes } from '~/utils/KeyboardCodes'
import { clamp, lerp, radiansDifference } from '~/utils/math'
import { createPhysicBox } from '~/utils/physics'
import {
  Body,
  CircleShape,
  Contact,
  ContactListener,
  Fixture,
  FixtureDef,
  PolygonShape,
  Vec2,
  World
} from '~/vendor/Box2D/Box2D'

class ContactPair {
  characterPart: Fixture
  level: Fixture
  set(characterPart: Fixture, level: Fixture) {
    this.characterPart = characterPart
    this.level = level
    return this
  }
}

const __sharedContactPair = new ContactPair()

function getContactBetweenLegZoneAndLevel(contact: Contact) {
  const fixtureA = contact.GetFixtureA()
  const fixtureB = contact.GetFixtureB()

  // //make sure only one of the fixtures was a sensor
  if (fixtureA.m_isSensor === fixtureB.m_isSensor) {
    return
  }

  if (fixtureA.m_isSensor) {
    return __sharedContactPair.set(fixtureA, fixtureB)
  } else {
    return __sharedContactPair.set(fixtureB, fixtureA)
  }
}
class CharacterContactListener extends ContactListener {
  world: World
  contactPairs: Map<Fixture, Fixture[]>
  constructor(world: World) {
    super()
    this.contactPairs = new Map<Fixture, Fixture[]>()
    this.world = world
  }
  BeginContact(contact: Contact) {
    const contactPair = getContactBetweenLegZoneAndLevel(contact)
    if (contactPair) {
      pushToArrayMap(
        this.contactPairs,
        contactPair.characterPart,
        contactPair.level
      )
    }
  }

  EndContact(contact: Contact) {
    const contactPair = getContactBetweenLegZoneAndLevel(contact)
    if (contactPair) {
      if (contactPair) {
        cleanRemoveFromArrayMap(
          this.contactPairs,
          contactPair.characterPart,
          contactPair.level
        )
      }
    }
  }
}

const safeAngleRange = 0.2
const safeAngleMin = Math.PI * -safeAngleRange
const safeAngleMax = Math.PI * safeAngleRange
const dangerAngleRange = 0.45

export default class CharacterPhysics {
  body: Body
  bodySize: Vec2
  bodyOffset: Vec2
  defaultBodySize: Vec2
  defaultBodyOffset: Vec2
  private autoJump = false
  private autoThrash = false
  private jump = false
  private jumpEnergy = 0
  private recoil = 0
  private tucked = false
  private autoJumpCooldown = 3
  private autoThrashCooldown = 0.5
  private torsoFixture: Fixture
  private torsoShape: PolygonShape
  private legsFixture: Fixture
  private bellyFixture: Fixture
  private armsFixture: Fixture
  private characterContacts: Map<Fixture, Fixture[]>
  constructor(myB2World: World) {
    const characterContactListener = new CharacterContactListener(myB2World)
    myB2World.SetContactListener(characterContactListener)

    const defaultBodySize = new Vec2(0.008, 0.007)
    const defaultBodyOffset = new Vec2(0, 0.002)
    const body = createPhysicBox(
      myB2World,
      defaultBodyOffset.x,
      defaultBodyOffset.y,
      defaultBodySize.x,
      defaultBodySize.y,
      false,
      1.5,
      1.5
    )

    body.m_linearDamping = 1
    this.torsoFixture = body.m_fixtureList!
    this.torsoShape = this.torsoFixture.m_shape as PolygonShape
    const bodyZoneFixtureDef = new FixtureDef()
    const legShape = new CircleShape(0.0025 * __physicsScale)
    legShape.m_p.Set(0, -0.015 * __physicsScale)
    bodyZoneFixtureDef.shape = legShape
    bodyZoneFixtureDef.isSensor = true
    bodyZoneFixtureDef.userData = { type: 'legs' }
    this.legsFixture = body.CreateFixture(bodyZoneFixtureDef)
    const bellyShape = new CircleShape(0.0025 * __physicsScale)
    bellyShape.m_p.Set(0, -0.008 * __physicsScale)
    bodyZoneFixtureDef.shape = bellyShape
    bodyZoneFixtureDef.userData = { type: 'belly', enabled: true }
    this.bellyFixture = body.CreateFixture(bodyZoneFixtureDef)
    const armsShape = new CircleShape(0.0085 * __physicsScale)
    armsShape.m_p.Set(0, 0.003 * __physicsScale)
    bodyZoneFixtureDef.shape = armsShape
    bodyZoneFixtureDef.userData = { type: 'arms' }
    this.armsFixture = body.CreateFixture(bodyZoneFixtureDef)
    body.SetAngularDamping(5)
    this.body = body
    this.bodySize = defaultBodySize.Clone()
    this.bodyOffset = defaultBodyOffset.Clone()
    this.defaultBodySize = defaultBodySize
    this.defaultBodyOffset = defaultBodyOffset
    this.characterContacts = characterContactListener.contactPairs

    const keyboardInput = new KeyboardInput()
    keyboardInput.addListener(this.onKeyCodeEvent)
  }
  onKeyCodeEvent = (code: KeyboardCodes, down: boolean) => {
    if (code === 'Space') {
      this.bellyFixture.m_userData.enabled = !down
      this.tucked = down
      if (!down) {
        this.jump = true
      }
      if (down) {
        this.setTorsoShape(0.01, 0.005, 0, -0.002)
      } else {
        this.recoil = 1
      }
    }
  }

  setTorsoShape(width: number, height: number, x: number, y: number) {
    this.bodySize.Set(width, height)
    this.bodyOffset.Set(x, y)
    this.torsoShape.SetAsBox(
      width * 0.5 * __physicsScale,
      height * 0.5 * __physicsScale,
      new Vec2(x * __physicsScale, y * __physicsScale)
    )
  }

  update(dt: number) {
    if (this.tucked) {
      this.jumpEnergy += dt
    } else if (this.recoil > 0) {
      this.recoil -= dt * 3
      if (this.recoil < 0) {
        this.recoil = 0
      }
      const w = lerp(0.008, 0.006, this.recoil)
      const h = lerp(0.007, 0.009, this.recoil)
      this.setTorsoShape(w, h, 0, lerp(0, 0.002, this.recoil))
    }
    const char = this.body
    this.autoJumpCooldown -= dt
    this.autoThrashCooldown -= dt
    const vel = char.GetLinearVelocity()
    if (this.characterContacts.size > 0) {
      const angleDiff = radiansDifference(char.GetAngle(), 0)
      const walkSafe = Math.abs(angleDiff) < safeAngleRange
      if (this.characterContacts.has(this.legsFixture) && walkSafe) {
        const runSpeed = vel.x < 0 ? vel.x * 0.6 : vel.x
        if (vel.y < 0) {
          char.SetLinearVelocity(new Vec2(runSpeed, 0)) //stop if falling
        }
        char.ApplyForceToCenter(new Vec2(0.025, 0)) // run right
      }
      if (!this.tucked && this.characterContacts.has(this.bellyFixture)) {
        char.ApplyLinearImpulseToCenter(new Vec2(0, 0.0015), true)
      }
      if (
        Math.abs(angleDiff) > dangerAngleRange &&
        ((this.autoThrash && this.autoThrashCooldown <= 0) || this.jump) &&
        this.characterContacts.has(this.armsFixture)
      ) {
        this.jump = false
        this.jumpEnergy = 0
        this.autoThrashCooldown = 0.5
        char.ApplyLinearImpulseToCenter(
          new Vec2(0, clamp(this.jumpEnergy * 0.05 + 0.002, 0, 0.01)),
          true
        )
        if (angleDiff < 0) {
          char.ApplyAngularImpulse(0.0001)
        } else if (angleDiff > 0) {
          char.ApplyAngularImpulse(-0.0001)
        }
      }
      if (
        ((this.autoJump && this.autoJumpCooldown <= 0) || this.jump) &&
        this.characterContacts.has(this.legsFixture)
      ) {
        this.jump = false
        this.autoJumpCooldown = 2
        const vel = char.GetLinearVelocity()
        char.SetLinearVelocity(
          new Vec2(vel.x, 100 * clamp(this.jumpEnergy * 0.1 + 0.01, 0, 0.04))
        )
        this.jumpEnergy = 0
      }
    }

    const angleDiff = radiansDifference(char.GetAngle(), 0)
    if (angleDiff < safeAngleMin) {
      char.ApplyAngularImpulse(0.00001)
    } else if (angleDiff > safeAngleMax) {
      char.ApplyAngularImpulse(-0.00001)
    }
    if (char.GetPosition().y < -3) {
      char.SetLinearVelocity(new Vec2(0.0, 0.0))
      char.SetPositionXY(0 * __physicsScale, 0.05 * __physicsScale)
      this.autoThrashCooldown = 0.5
      this.autoJumpCooldown = 3
    }
  }
}
