import {
  DataTexture,
  NearestFilter,
  RGBAFormat,
  sRGBEncoding,
  Texture,
  TextureLoader,
  UnsignedByteType
} from 'three'

let __tempTexture: DataTexture | undefined
export function getTempTexture() {
  if (!__tempTexture) {
    const s = 4
    const total = s * s * 4
    const data = new Uint8Array(total)
    for (let i = 0; i < total; i++) {
      data[i] = 0
    }
    __tempTexture = new DataTexture(data, s, s, RGBAFormat, UnsignedByteType)
  }
  return __tempTexture!
}

export async function loadPixelatedTexture(path: string, flipY = true) {
  return new Promise<Texture>(resolve => {
    const loader = new TextureLoader()
    loader.load(
      path,
      texture => {
        texture.encoding = sRGBEncoding
        texture.minFilter = NearestFilter
        texture.magFilter = NearestFilter
        texture.flipY = flipY
        resolve(texture)
      },
      undefined,
      function(err) {
        console.error('An error happened.')
      }
    )
  })
}

export function getCanvasOfImageTexture(texture: Texture) {
  const image = texture.image as ImageBitmap
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('could not get canvas context2d')
  }
  context.drawImage(image, 0, 0)
  return context
}
