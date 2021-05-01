import {
  Color,
  MeshStandardMaterial,
  MeshStandardMaterialParameters
} from 'three'

type CuratedMaterialName =
  | 'brick'
  | 'mortar'
  | 'drywall'
  | 'floor'
  | 'wood'
  | 'plastic'

export const standardMaterialParamLib: {
  [K in CuratedMaterialName]: MeshStandardMaterialParameters
} = {
  brick: {
    roughness: 1,
    color: new Color(0.3, 0.11, 0.1)
  },
  mortar: {
    roughness: 1,
    color: new Color(0.1, 0.1, 0.1)
  },
  drywall: {
    roughness: 1,
    color: new Color(0.8, 0.8, 0.8)
  },
  floor: {
    roughness: 1,
    color: new Color(0.3, 0.25, 0.2)
  },
  wood: {
    roughness: 1,
    color: new Color(0.4, 0.3, 0.2)
  },
  plastic: {
    roughness: 0.5,
    color: new Color(0.2, 0.25, 0.4)
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
