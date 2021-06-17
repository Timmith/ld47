import {
  Color,
  DoubleSide,
  MeshStandardMaterial,
  MeshStandardMaterialParameters
} from 'three'

type CuratedMaterialName =
  | 'ground'
  | 'brick'
  | 'mortar'
  | 'drywall'
  | 'floor'
  | 'wood'
  | 'plastic'
  | 'grass'
  | 'bush'
  | 'berry'

export const standardMaterialParamLib: {
  [K in CuratedMaterialName]: MeshStandardMaterialParameters
} = {
  ground: {
    roughness: 1,
    color: new Color(0.16, 0.14, 0.13)
  },
  brick: {
    roughness: 1,
    color: new Color(0.5, 0.2, 0.15)
  },
  mortar: {
    roughness: 1,
    color: new Color(0.2, 0.2, 0.2)
  },
  drywall: {
    roughness: 1,
    color: new Color(0.8, 0.8, 0.8)
  },
  floor: {
    roughness: 1,
    color: new Color(0.4, 0.32, 0.25)
  },
  wood: {
    roughness: 1,
    color: new Color(0.6, 0.4, 0.3)
  },
  plastic: {
    roughness: 0.5,
    color: new Color(0.2, 0.25, 0.4)
  },
  grass: {
    roughness: 0.75,
    color: new Color(0.3, 0.75, 0.3),
    side: DoubleSide
    // wireframe: true
  },
  bush: {
    roughness: 0.6,
    color: new Color(0.125, 0.2, 0.125),
    side: DoubleSide
    // wireframe: true
  },
  berry: {
    roughness: 0.5,
    color: new Color(0.6, 0.15, 0.225),
    side: DoubleSide
    // wireframe: true
  }
}

const materialCache = new Map<CuratedMaterialName, MeshStandardMaterial>()

export function getMaterial(name: CuratedMaterialName) {
  if (!materialCache.has(name)) {
    materialCache.set(
      name,
      new MeshStandardMaterial(standardMaterialParamLib[name])
    )
  }
  return materialCache.get(name)!
}
