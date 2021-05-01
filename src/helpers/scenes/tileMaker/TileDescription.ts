interface Orientation {
  n?: boolean
  s?: boolean
  e?: boolean
  w?: boolean
}
interface OrientationLR {
  nl?: boolean
  nr?: boolean
  sl?: boolean
  sr?: boolean
  el?: boolean
  er?: boolean
  wl?: boolean
  wr?: boolean
}

export default interface TileDescription {
  beams?: Orientation
  bricks?: OrientationLR
  drywall?: OrientationLR
}
