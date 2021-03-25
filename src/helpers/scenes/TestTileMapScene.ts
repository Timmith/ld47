import { Mesh, PlaneGeometry, Vector3, WebGLRenderer } from 'three'
import { BasicFullScreenMaterial } from '~/materials/BasicFullScreenMaterial';
import { loadPixelatedTexture } from '~/utils/threeUtils';
import { lerp } from '~/utils/math';

import { BaseTestScene } from './BaseTestScene'


export default class TestTileMapScene extends BaseTestScene {
  constructor() {
    super()

    const scene = this.scene
    const transform = new Vector3(0, 0, 1/2048)
    setInterval(() => {
      const time = performance.now() * 0.0002
      transform.x = ~~(Math.cos(time) * 200 + 200)
      transform.y = ~~(Math.sin(time) * 200 + 200)
      transform.z = lerp(1/512, 1/4096, Math.sin(time*2) * 0.5 + 0.5)

    }, 50)
    async function initMapRenderer() {
        const mapTex = await loadPixelatedTexture(
            'game/tilemaps/test.png',
        )
        const tileTex = await loadPixelatedTexture(
            'game/tilesets/test.png',
        )

        const material = new BasicFullScreenMaterial( {
            mapTex,
            tileTex,
            transform
         } );
         const mapPreview = new Mesh(new PlaneGeometry(2, 2, 1, 1), material)
        scene.add(mapPreview)
    }
    initMapRenderer()
  }
  update(dt: number) {
    super.update(dt)
  }
  render(renderer: WebGLRenderer, dt: number) {
    super.render(renderer, dt)
  }
}
