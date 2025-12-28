// util: gerar thumbnail a partir de dataURL usando canvas
export async function generateThumbnail(dataURL, maxWidth = 600) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const ratio = img.width / img.height
      const w = Math.min(maxWidth, img.width)
      const h = Math.round(w / ratio)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#fff'
      ctx.fillRect(0,0,w,h)
      ctx.drawImage(img, 0, 0, w, h)
      const out = canvas.toDataURL('image/jpeg', 0.85)
      resolve(out)
    }
    img.onerror = (e) => reject(e)
    img.src = dataURL
  })
}