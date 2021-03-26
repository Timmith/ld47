import { Mesh, PlaneGeometry, WebGLRenderer } from 'three'
import { BasicFullScreenMaterial } from '~/materials/BasicFullScreenMaterial';
import { loadPixelatedTexture } from '~/utils/threeUtils';

import { BaseTestScene } from './BaseTestScene'
import { getMouseBoundViewTransform } from '~/helpers/viewTransformMouse';


export default class TestTileMapScene extends BaseTestScene {
  constructor() {
    super()

    const scene = this.scene
    const transform = getMouseBoundViewTransform()
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
