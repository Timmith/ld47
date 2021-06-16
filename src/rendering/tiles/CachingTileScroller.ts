import { TileScrollingMaterial } from '~/materials/TileScrollingMaterial'
import { getRandomTexture } from '~/utils/threeUtils'

export default class CachingTileScroller {
  material: TileScrollingMaterial
  constructor(
    private _pixelsPerTile = 32,
    private _width = 640,
    private _height = 480
  ) {
    this.material = new TileScrollingMaterial({
      texture: getRandomTexture(320, 240)
    })
  }
}
