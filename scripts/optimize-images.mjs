// Resizes the original itch.io material into web-sized JPEG/WebP files in public/img.
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const SRC = process.env.ITCH_MATERIAL_DIR ?? 'C:/Users/SLim/Downloads/itch.io material'
const OUT = 'public/img'
mkdirSync(OUT, { recursive: true })

const jobs = [
  ['1789718294584_2222443411111068601_8486855465131227305_2d8e0c3011857130fe836e8e076febd9.jpg', 'cover', 1318],
  ['FireRescue_20261014_03_NhaChay_Gameplay.png', 'gameplay-house', 1600],
  ['9eaeaf92-058c-4791-b2f8-30616764160d.png', 'water-hose', 1600],
  ['FireRescue_20261014_Firetruck2_01_GocTruoc.png', 'demo-map-truck', 1600],
  ['FireRescue_20261014_Scale09_01_NhanVat.png', 'firefighter', 1600],
  ['d03dd260-1b2f-4600-a199-79192032396e.png', 'gameplay-victim', 1600],
]

for (const [file, name, width] of jobs) {
  const img = sharp(join(SRC, file)).resize({ width, withoutEnlargement: true })
  await img.clone().webp({ quality: 78 }).toFile(join(OUT, `${name}.webp`))
  await img.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(join(OUT, `${name}.jpg`))
  console.log('ok', name)
}
