import TestPhysicsTileMapPNGScene from '~/helpers/scenes/TestPhysicsTileMapPNG'
import TestSpritesOnTileMapScene from '~/helpers/scenes/TestSpritesOnTileMapScene'
import TestTileMapScene from '~/helpers/scenes/TestTileMapScene'

import TestCachedScrollingNoiseViewShaderScene from './helpers/scenes/TestCachedScrollingNoiseViewShaderScene'
import TestCharacterControlScene from './helpers/scenes/TestCharacterControl'
import TestCharacterControlOnTextScene from './helpers/scenes/TestCharacterControlOnText'
import TestGraphicsCharacterScene from './helpers/scenes/TestGraphicsCharacter'
import TestGraphicsLevelScene from './helpers/scenes/TestGraphicsLevel'
import TestJitTilesScene from './helpers/scenes/TestJitTilesScene'
import TestKeyboardCharacterScene from './helpers/scenes/TestKeyboardCharacter'
import TestKeyboardInputScene from './helpers/scenes/TestKeyboardInput'
import TestLightingScene from './helpers/scenes/TestLighting'
import TestNoiseShaderScene from './helpers/scenes/TestNoiseShaderScene'
import TestPhysicsScene from './helpers/scenes/TestPhysics'
import TestPhysicsCharacterScene from './helpers/scenes/TestPhysicsCharacter'
import TestPhysicsConcaveBodiesScene from './helpers/scenes/TestPhysicsConcaveBodies'
import TestPhysicsPNGScene from './helpers/scenes/TestPhysicsPNG'
import TestStencilsScene from './helpers/scenes/TestStencils'
import TestTextScene from './helpers/scenes/TestText'
import TestTextPhysicsScene from './helpers/scenes/TestTextPhysics'
import TestTileViewBufferScene from './helpers/scenes/TestTileViewBufferScene'

export const testClasses: { [K: string]: any } = {
  characterControl: TestCharacterControlScene,
  characterControlOnText: TestCharacterControlOnTextScene,
  graphicsLevel: TestGraphicsLevelScene,
  graphicsCharacter: TestGraphicsCharacterScene,
  keyboard: TestKeyboardInputScene,
  keyboardCharacter: TestKeyboardCharacterScene,
  lighting: TestLightingScene,
  physics: TestPhysicsScene,
  textPhysics: TestTextPhysicsScene,
  physicsConcave: TestPhysicsConcaveBodiesScene,
  physicsCharacter: TestPhysicsCharacterScene,
  physicsTileMapPNG: TestPhysicsTileMapPNGScene,
  physicsPNG: TestPhysicsPNGScene,
  stencils: TestStencilsScene,
  text: TestTextScene,
  tileMap: TestTileMapScene,
  spritesOnTileMap: TestSpritesOnTileMapScene,
  jitTiles: TestJitTilesScene,
  noiseShader: TestNoiseShaderScene,
  cachedScrollingNoiseViewShader: TestCachedScrollingNoiseViewShaderScene,
  tileViewBuffer: TestTileViewBufferScene
}
