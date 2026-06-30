import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

const palette = {
  cream: [255, 250, 243, 255],
  lavender: [129, 106, 157, 255],
  blush: [244, 201, 198, 255],
  soft: [233, 223, 241, 255],
  gold: [223, 169, 87, 255],
  peach: [243, 191, 169, 255],
}

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(name, data) {
  const type = Buffer.from(name)
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const checksum = Buffer.alloc(4)
  checksum.writeUInt32BE(crc32(Buffer.concat([type, data])))
  return Buffer.concat([length, type, data, checksum])
}

function createSurface(size, color) {
  const pixels = Buffer.alloc(size * size * 4)
  for (let index = 0; index < size * size; index += 1) {
    pixels.set(color, index * 4)
  }
  return { size, pixels }
}

function paint(surface, x, y, color) {
  if (x < 0 || y < 0 || x >= surface.size || y >= surface.size) return
  surface.pixels.set(color, (y * surface.size + x) * 4)
}

function circle(surface, centerX, centerY, radius, color) {
  const startX = Math.max(0, Math.floor(centerX - radius))
  const endX = Math.min(surface.size - 1, Math.ceil(centerX + radius))
  const startY = Math.max(0, Math.floor(centerY - radius))
  const endY = Math.min(surface.size - 1, Math.ceil(centerY + radius))
  for (let y = startY; y <= endY; y += 1) {
    for (let x = startX; x <= endX; x += 1) {
      if ((x - centerX) ** 2 + (y - centerY) ** 2 <= radius ** 2) paint(surface, x, y, color)
    }
  }
}

function roundedRect(surface, inset, radius, color) {
  const max = surface.size - inset - 1
  for (let y = inset; y <= max; y += 1) {
    for (let x = inset; x <= max; x += 1) {
      const nearestX = Math.max(inset + radius, Math.min(x, max - radius))
      const nearestY = Math.max(inset + radius, Math.min(y, max - radius))
      if ((x - nearestX) ** 2 + (y - nearestY) ** 2 <= radius ** 2) paint(surface, x, y, color)
    }
  }
}

function heart(surface, centerX, centerY, scale, color) {
  const bound = Math.ceil(scale * 1.45)
  for (let y = centerY - bound; y <= centerY + bound; y += 1) {
    for (let x = centerX - bound; x <= centerX + bound; x += 1) {
      const normalizedX = (x - centerX) / scale
      const normalizedY = -(y - centerY) / scale + 0.18
      const value = (normalizedX ** 2 + normalizedY ** 2 - 1) ** 3 - normalizedX ** 2 * normalizedY ** 3
      if (value <= 0) paint(surface, x, y, color)
    }
  }
}

function polygon(surface, points, color) {
  const minX = Math.floor(Math.min(...points.map(([x]) => x)))
  const maxX = Math.ceil(Math.max(...points.map(([x]) => x)))
  const minY = Math.floor(Math.min(...points.map(([, y]) => y)))
  const maxY = Math.ceil(Math.max(...points.map(([, y]) => y)))
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      let inside = false
      for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
        const [xi, yi] = points[i]
        const [xj, yj] = points[j]
        const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
        if (intersects) inside = !inside
      }
      if (inside) paint(surface, x, y, color)
    }
  }
}

function star(surface, centerX, centerY, outerRadius, color) {
  const points = []
  for (let index = 0; index < 8; index += 1) {
    const angle = -Math.PI / 2 + (index * Math.PI) / 4
    const radius = index % 2 === 0 ? outerRadius : outerRadius * 0.28
    points.push([centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius])
  }
  polygon(surface, points, color)
}

function encode(surface, path) {
  const stride = surface.size * 4
  const raw = Buffer.alloc((stride + 1) * surface.size)
  for (let y = 0; y < surface.size; y += 1) {
    const rowOffset = y * (stride + 1)
    raw[rowOffset] = 0
    surface.pixels.copy(raw, rowOffset + 1, y * stride, (y + 1) * stride)
  }
  const header = Buffer.alloc(13)
  header.writeUInt32BE(surface.size, 0)
  header.writeUInt32BE(surface.size, 4)
  header.set([8, 6, 0, 0, 0], 8)
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
  writeFileSync(path, png)
}

function regularIcon(size, path) {
  const surface = createSurface(size, palette.cream)
  const unit = size / 512
  roundedRect(surface, 0, 116 * unit, palette.cream)
  circle(surface, 88 * unit, 102 * unit, 30 * unit, palette.blush)
  circle(surface, 435 * unit, 394 * unit, 46 * unit, palette.soft)
  circle(surface, 256 * unit, 258 * unit, 182 * unit, palette.lavender)
  heart(surface, 256 * unit, 253 * unit, 77 * unit, palette.cream)
  star(surface, 398 * unit, 117 * unit, 44 * unit, palette.gold)
  star(surface, 111 * unit, 379 * unit, 28 * unit, palette.peach)
  encode(surface, path)
}

function maskableIcon(size, path) {
  const surface = createSurface(size, palette.lavender)
  const unit = size / 512
  circle(surface, 256 * unit, 256 * unit, 166 * unit, palette.cream)
  heart(surface, 256 * unit, 253 * unit, 69 * unit, palette.lavender)
  star(surface, 397 * unit, 120 * unit, 39 * unit, palette.gold)
  star(surface, 111 * unit, 373 * unit, 25 * unit, palette.peach)
  encode(surface, path)
}

regularIcon(512, 'public/pwa-512x512.png')
regularIcon(192, 'public/pwa-192x192.png')
regularIcon(180, 'public/apple-touch-icon.png')
maskableIcon(512, 'public/pwa-maskable-512x512.png')
