import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const BURGER_URL = '/models/food/burger.glb'
const FRIES_URL = '/models/food/fries.glb'
const SODA_URL = '/models/food/soda.glb'

function mat(color, props = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0, ...props })
}

function markAbout(obj) {
  obj.traverse((child) => {
    if (child.isMesh) child.userData.interactive = 'about'
  })
  return obj
}

/** Laminated diner menu face — playful About Me, not a resume dump. */
function createBurgerMenuTexture() {
  const w = 512
  const h = 720
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')

  // Cream paper
  ctx.fillStyle = '#f3e6d0'
  ctx.fillRect(0, 0, w, h)

  // Soft grain
  for (let i = 0; i < 2200; i++) {
    const a = 0.03 + Math.random() * 0.05
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(90,50,20,${a})` : `rgba(255,255,240,${a})`
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5)
  }

  // Red diner border
  ctx.strokeStyle = '#8b1e1a'
  ctx.lineWidth = 14
  ctx.strokeRect(18, 18, w - 36, h - 36)
  ctx.strokeStyle = '#d4a24a'
  ctx.lineWidth = 3
  ctx.strokeRect(32, 32, w - 64, h - 64)

  // Header band
  ctx.fillStyle = '#8b1e1a'
  ctx.fillRect(48, 48, w - 96, 118)

  ctx.fillStyle = '#f3e6d0'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '700 22px "Source Sans 3", system-ui, sans-serif'
  ctx.fillText('EST. ATLANTA · OPEN LATE', w / 2, 78)

  ctx.font = '700 52px "Fraunces", Georgia, serif'
  ctx.fillText("BERGER'S", w / 2, 122)

  // Tagline — not a job title
  ctx.fillStyle = '#8b1e1a'
  ctx.font = 'italic 700 22px "Fraunces", Georgia, serif'
  ctx.fillText('Philosophy · Pixels · Fries', w / 2, 190)

  ctx.fillStyle = '#5a4a3a'
  ctx.font = '500 17px "Source Sans 3", system-ui, sans-serif'
  ctx.fillText('Chef John · Table for one', w / 2, 218)

  // Divider
  ctx.strokeStyle = '#c4a06a'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(70, 240)
  ctx.lineTo(w - 70, 240)
  ctx.stroke()

  const wrapText = (text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ')
    let line = ''
    let yy = y
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, yy)
        line = word
        yy += lineHeight
      } else {
        line = test
      }
    }
    if (line) ctx.fillText(line, x, yy)
    return yy
  }

  const drawDish = (name, desc, y) => {
    ctx.fillStyle = '#8b1e1a'
    ctx.font = '700 19px "Source Sans 3", system-ui, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(name.toUpperCase(), 72, y)

    ctx.fillStyle = '#3a2e24'
    ctx.font = '400 15px "Source Sans 3", system-ui, sans-serif'
    return wrapText(desc, 72, y + 24, w - 144, 20) + 34
  }

  ctx.fillStyle = '#8b1e1a'
  ctx.textAlign = 'center'
  ctx.font = 'italic 700 22px "Fraunces", Georgia, serif'
  ctx.fillText("Tonight's Menu", w / 2, 270)

  let y = 304
  y = drawDish('House Burger', 'Built in Atlanta. No substitutions.', y)
  y = drawDish('Philosopher Fries', 'Vandy-seasoned. Overthinks the sauce.', y)
  y = drawDish('Side of Vinyl', 'Always spinning.', y)
  y = drawDish('House Plants', 'Overwatered with love. Still thriving.', y)
  y = drawDish('Weekend Ride', 'Two wheels. Zero traffic reports.', y)
  y = drawDish('Late Night Special', 'Ships features after midnight.', y)

  // Bottom stamp — career lives on the desk monitor
  ctx.fillStyle = '#6b1f1a'
  ctx.textAlign = 'center'
  ctx.font = '700 14px "Source Sans 3", system-ui, sans-serif'
  ctx.fillText('★ RESUME SERVED AT THE DESK ★', w / 2, h - 48)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

/** Standing laminated burger-joint menu (About Me hotspot). */
function createBurgerMenu() {
  const menu = new THREE.Group()
  menu.name = 'burgerMenu'

  const menuW = 0.22
  const menuH = 0.3
  const menuD = 0.008
  // Build around a bottom-edge pivot so leaning stays on the tabletop
  const midY = menuH / 2

  const coverMat = mat(0x8b1e1a, { roughness: 0.55 })
  const pageMat = new THREE.MeshStandardMaterial({
    map: createBurgerMenuTexture(),
    roughness: 0.7,
    metalness: 0,
  })

  // Back cover
  const back = new THREE.Mesh(new THREE.BoxGeometry(menuW, menuH, menuD * 0.4), coverMat)
  back.position.set(0, midY, -menuD * 0.3)
  back.castShadow = true
  menu.add(back)

  // Front page with menu art
  const page = new THREE.Mesh(new THREE.PlaneGeometry(menuW * 0.96, menuH * 0.96), pageMat)
  page.position.set(0, midY, menuD * 0.5)
  page.castShadow = true
  menu.add(page)

  // Slim spine edge
  const spine = new THREE.Mesh(
    new THREE.BoxGeometry(0.01, menuH, menuD),
    mat(0x6b1f1a, { roughness: 0.5 }),
  )
  spine.position.set(-menuW / 2 + 0.005, midY, 0)
  menu.add(spine)

  // Invisible focus / hit target on the face
  const focus = new THREE.Mesh(
    new THREE.PlaneGeometry(menuW, menuH),
    new THREE.MeshBasicMaterial({ visible: false }),
  )
  focus.name = 'screen'
  focus.position.set(0, midY, menuD * 0.55)
  focus.userData.skipHover = true
  focus.userData.interactive = 'about'
  menu.add(focus)

  menu.userData.screenSize = {
    width: menuW,
    height: menuH,
    // Close enough to read; still wide enough to keep the meal in frame
    fill: 0.52,
  }
  menu.userData.menuH = menuH

  markAbout(menu)
  // Keep the invisible plane as the named screen after traverse
  focus.name = 'screen'

  return menu
}

function prepareFoodModel(scene, { targetHeight, uprightFromZ = false } = {}) {
  // Some Quaternius props are authored Z-up
  if (uprightFromZ) scene.rotation.x = Math.PI / 2

  scene.traverse((child) => {
    if (!child.isMesh) return
    child.castShadow = true
    child.receiveShadow = true
    const mats = Array.isArray(child.material) ? child.material : [child.material]
    for (const m of mats) {
      if (!m) continue
      // Quaternius FBX export is a bit metallic for food
      if ('metalness' in m) m.metalness = Math.min(m.metalness ?? 0, 0.08)
      if ('roughness' in m) m.roughness = Math.max(m.roughness ?? 0.7, 0.65)
      if (m.map) m.map.colorSpace = THREE.SRGBColorSpace
    }
  })

  scene.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(scene)
  const size = new THREE.Vector3()
  box.getSize(size)
  const scale = targetHeight / Math.max(size.y, 0.0001)
  scene.scale.setScalar(scale)

  scene.updateMatrixWorld(true)
  box.setFromObject(scene)
  const center = new THREE.Vector3()
  box.getCenter(center)
  scene.position.x -= center.x
  scene.position.z -= center.z
  scene.position.y -= box.min.y

  return scene
}

function loadFood(url, opts) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    loader.load(
      url,
      (gltf) => resolve(prepareFoodModel(gltf.scene, opts)),
      undefined,
      reject,
    )
  })
}

function createPlate() {
  const plate = new THREE.Group()

  // Single thin disc — stacked dish+well was z-fighting
  const dish = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.125, 0.006, 32),
    mat(0xf2f0ea, { roughness: 0.45 }),
  )
  dish.position.y = 0.003
  dish.castShadow = true
  dish.receiveShadow = true
  plate.add(dish)

  return plate
}

function createBagLabelTexture(name) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 640
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#c4a06a'
  ctx.fillRect(0, 0, 512, 640)

  // Soft kraft grain
  for (let i = 0; i < 1800; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 640
    const a = 0.04 + Math.random() * 0.06
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(90,60,30,${a})` : `rgba(255,235,200,${a})`
    ctx.fillRect(x, y, 1.5, 1.5)
  }

  // Brand band
  ctx.fillStyle = '#6b1f1a'
  ctx.fillRect(48, 120, 416, 280)

  ctx.strokeStyle = '#e8d5b0'
  ctx.lineWidth = 4
  ctx.strokeRect(64, 136, 384, 248)

  const parts = name.trim().split(/\s+/)
  const line1 = (parts[0] || name).toUpperCase()
  const line2 = (parts.slice(1).join(' ') || '').toUpperCase()

  ctx.fillStyle = '#f4ead8'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '700 64px "Source Sans 3", system-ui, sans-serif'
  ctx.fillText(line1, 256, line2 ? 230 : 260)
  if (line2) {
    ctx.font = '700 58px "Source Sans 3", system-ui, sans-serif'
    ctx.fillText(line2, 256, 310)
  }

  ctx.fillStyle = '#5a3d28'
  ctx.font = '600 22px "Source Sans 3", system-ui, sans-serif'
  ctx.fillText('TAKE · OUT', 256, 480)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

function crinklePaperGeometry(
  geo,
  amount = 0.0018,
  { flareTop = 0, flatCenter = null } = {},
) {
  const pos = geo.attributes.position
  // PlaneGeometry is centered; find y extent for optional top flare
  let yMin = Infinity
  let yMax = -Infinity
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    yMin = Math.min(yMin, y)
    yMax = Math.max(yMax, y)
  }
  const ySpan = Math.max(yMax - yMin, 1e-6)
  const rimEps = ySpan * 0.02

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    // Keep top + bottom rims dead flat so every wall meets at the same height
    const onRim = y >= yMax - rimEps || y <= yMin + rimEps

    let wrinkle = 0
    if (!onRim) {
      wrinkle =
        Math.sin(x * 95 + y * 42) * amount * 0.55 +
        Math.sin(x * 155 - y * 68) * amount * 0.35 +
        Math.sin((x + y) * 210) * amount * 0.2
    }

    // Keep a flat panel behind the logo so it doesn’t clip into wrinkles
    if (flatCenter) {
      const nx = Math.abs(x) / flatCenter.hw
      const ny = Math.abs(y - flatCenter.cy) / flatCenter.hh
      const edge = Math.max(nx, ny)
      if (edge < 1) {
        const t = Math.min(1, Math.max(0, (1 - edge) / 0.35))
        wrinkle *= 1 - t * t
      }
    }

    pos.setZ(i, pos.getZ(i) + wrinkle)

    if (flareTop > 0 && !onRim) {
      const t = (y - yMin) / ySpan
      const flare = t * t * flareTop
      pos.setZ(i, pos.getZ(i) + flare)
    }

    // Snap rim to exact height so front/sides can’t drift
    if (onRim) {
      pos.setY(i, y >= yMax - rimEps ? yMax : yMin)
      pos.setZ(i, 0)
    }
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

/** Kraft takeout bag — thin paper walls with a soft crinkle. */
function createFastFoodBag(name = 'John Berger', labelMap = null) {
  const bag = new THREE.Group()
  bag.name = 'fastFoodBag'

  const paperMat = new THREE.MeshStandardMaterial({
    color: 0xc4a06a,
    roughness: 0.96,
    metalness: 0,
    side: THREE.DoubleSide,
  })
  const sideMat = new THREE.MeshStandardMaterial({
    color: 0xb8925c,
    roughness: 0.95,
    metalness: 0,
    side: THREE.DoubleSide,
  })

  const w = 0.115
  const d = 0.07
  const h = 0.22
  const wallY = h / 2
  const flare = 0.0035

  const bottom = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.98, d * 0.98), paperMat)
  bottom.rotation.x = -Math.PI / 2
  bottom.position.y = 0.001
  bottom.receiveShadow = true
  bag.add(bottom)

  const labelW = w * 0.82
  const labelH = h * 0.68
  const front = new THREE.Mesh(
    crinklePaperGeometry(new THREE.PlaneGeometry(w, h, 12, 16), 0.0018, {
      flareTop: flare,
      flatCenter: { hw: labelW * 0.55, hh: labelH * 0.55, cy: -h * 0.02 },
    }),
    paperMat,
  )
  front.position.set(0, wallY, d / 2)
  front.castShadow = true
  bag.add(front)

  const back = new THREE.Mesh(
    crinklePaperGeometry(new THREE.PlaneGeometry(w, h, 12, 16), 0.0016, {
      flareTop: flare,
    }),
    paperMat,
  )
  back.position.set(0, wallY, -d / 2)
  back.rotation.y = Math.PI
  back.castShadow = true
  bag.add(back)

  const left = new THREE.Mesh(
    crinklePaperGeometry(new THREE.PlaneGeometry(d, h, 12, 16), 0.0012, {
      flareTop: flare,
    }),
    sideMat,
  )
  left.position.set(-w / 2, wallY, 0)
  left.rotation.y = -Math.PI / 2
  left.castShadow = true
  bag.add(left)

  const right = new THREE.Mesh(
    crinklePaperGeometry(new THREE.PlaneGeometry(d, h, 12, 16), 0.0012, {
      flareTop: flare,
    }),
    sideMat,
  )
  right.position.set(w / 2, wallY, 0)
  right.rotation.y = Math.PI / 2
  right.castShadow = true
  bag.add(right)

  const map = labelMap ?? createBagLabelTexture(name)
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(labelW, labelH),
    new THREE.MeshStandardMaterial({
      map,
      roughness: 0.9,
      metalness: 0,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
  )
  label.position.set(0, h * 0.48, d / 2 + 0.0035)
  bag.add(label)

  return bag
}

function createDiningChair() {
  const chair = new THREE.Group()
  chair.name = 'diningChair'

  const wood = mat(0x6e5340, { roughness: 0.58, metalness: 0.04 })
  const woodDark = mat(0x5a4332, { roughness: 0.62 })
  const seatMat = mat(0xc8b8a4, { roughness: 0.88 })
  const seatDeep = mat(0xb8a894, { roughness: 0.9 })

  const seatW = 0.4
  const seatD = 0.38
  const seatY = 0.46
  const legH = seatY - 0.02

  // Slightly tapered square legs
  const legTop = 0.028
  const legBot = 0.022
  const legInset = 0.04
  const legs = [
    [seatW / 2 - legInset, seatD / 2 - legInset],
    [-(seatW / 2 - legInset), seatD / 2 - legInset],
    [seatW / 2 - legInset, -(seatD / 2 - legInset)],
    [-(seatW / 2 - legInset), -(seatD / 2 - legInset)],
  ]
  for (const [x, z] of legs) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(legTop, legH, legTop),
      wood,
    )
    // Taper via scale at bottom — approximate with uniform + foot
    leg.scale.set(1, 1, 1)
    leg.position.set(x, legH / 2, z)
    leg.castShadow = true
    chair.add(leg)

    const foot = new THREE.Mesh(
      new THREE.BoxGeometry(legBot, 0.02, legBot),
      woodDark,
    )
    foot.position.set(x, 0.01, z)
    chair.add(foot)
  }

  // Stretchers (H + side rails)
  const stretcherY = 0.18
  const sideStretcher = new THREE.Mesh(
    new THREE.BoxGeometry(0.016, 0.016, seatD - legInset * 2 - 0.02),
    woodDark,
  )
  for (const x of [seatW / 2 - legInset, -(seatW / 2 - legInset)]) {
    const s = sideStretcher.clone()
    s.position.set(x, stretcherY, 0)
    s.castShadow = true
    chair.add(s)
  }
  const cross = new THREE.Mesh(
    new THREE.BoxGeometry(seatW - legInset * 2 - 0.02, 0.014, 0.014),
    woodDark,
  )
  cross.position.set(0, stretcherY, 0.02)
  cross.castShadow = true
  chair.add(cross)

  // Seat apron under the cushion
  const apron = new THREE.Mesh(
    new THREE.BoxGeometry(seatW - 0.02, 0.04, seatD - 0.02),
    wood,
  )
  apron.position.set(0, seatY - 0.03, 0.01)
  apron.castShadow = true
  chair.add(apron)

  // Upholstered seat — soft top + thinner base
  const cushion = new THREE.Mesh(
    new THREE.BoxGeometry(seatW - 0.04, 0.045, seatD - 0.05),
    seatMat,
  )
  cushion.position.set(0, seatY + 0.01, 0.015)
  cushion.castShadow = true
  cushion.receiveShadow = true
  chair.add(cushion)

  const piped = new THREE.Mesh(
    new THREE.BoxGeometry(seatW - 0.06, 0.012, seatD - 0.07),
    seatDeep,
  )
  piped.position.set(0, seatY + 0.035, 0.015)
  chair.add(piped)

  // Rounded front lip on the seat
  const lip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, seatW - 0.06, 10, 1, false, 0, Math.PI),
    seatMat,
  )
  lip.rotation.z = Math.PI / 2
  lip.rotation.y = Math.PI
  lip.position.set(0, seatY + 0.01, seatD / 2 - 0.04)
  chair.add(lip)

  // Back posts
  const backH = 0.48
  const postY = seatY + backH / 2 + 0.02
  const postZ = -(seatD / 2 - 0.02)
  for (const x of [seatW / 2 - 0.05, -(seatW / 2 - 0.05)]) {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.026, backH, 0.026),
      wood,
    )
    post.position.set(x, postY, postZ)
    post.castShadow = true
    chair.add(post)
  }

  // Top crest rail
  const crest = new THREE.Mesh(
    new THREE.BoxGeometry(seatW - 0.06, 0.032, 0.028),
    wood,
  )
  crest.position.set(0, seatY + backH + 0.01, postZ)
  crest.castShadow = true
  chair.add(crest)

  // Horizontal back slats
  const slatGeo = new THREE.BoxGeometry(seatW - 0.1, 0.028, 0.012)
  for (const t of [0.22, 0.42, 0.62, 0.8]) {
    const slat = new THREE.Mesh(slatGeo, woodDark)
    slat.position.set(0, seatY + 0.04 + t * backH, postZ + 0.01)
    slat.castShadow = true
    chair.add(slat)
  }

  // Lumbar pad behind the lower slats
  const lumbar = new THREE.Mesh(
    new THREE.BoxGeometry(seatW - 0.14, 0.14, 0.02),
    seatMat,
  )
  lumbar.position.set(0, seatY + 0.2, postZ + 0.022)
  lumbar.castShadow = true
  chair.add(lumbar)

  return chair
}

/** Table knife — one continuous silhouette from butt to tip. */
function createKnife(material) {
  const knife = new THREE.Group()
  knife.name = 'knife'

  // Full profile in top-down (X = length, Y = width): handle → bolster → blade
  const shape = new THREE.Shape()
  shape.moveTo(-0.06, -0.0035)
  shape.lineTo(-0.058, -0.0045)
  shape.lineTo(-0.02, -0.0048)
  shape.lineTo(-0.008, -0.0042)
  shape.lineTo(-0.002, -0.0055) // bolster into blade
  shape.lineTo(0.045, -0.005)
  shape.lineTo(0.07, -0.002)
  shape.lineTo(0.078, 0) // tip
  shape.lineTo(0.07, 0.0018)
  shape.lineTo(0.04, 0.0048)
  shape.lineTo(-0.002, 0.005)
  shape.lineTo(-0.008, 0.004)
  shape.lineTo(-0.02, 0.0046)
  shape.lineTo(-0.058, 0.0045)
  shape.lineTo(-0.06, 0.0035)
  shape.lineTo(-0.06, -0.0035)

  const body = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, {
      depth: 0.0022,
      bevelEnabled: true,
      bevelThickness: 0.00035,
      bevelSize: 0.00035,
      bevelSegments: 1,
    }),
    material,
  )
  body.rotation.x = -Math.PI / 2
  body.position.y = 0.0022
  body.castShadow = true
  knife.add(body)

  return knife
}

/** Dinner fork — continuous handle into neck/head, then four tines. */
function createFork(material) {
  const fork = new THREE.Group()
  fork.name = 'fork'

  // Handle + neck + shoulder as one piece
  const shape = new THREE.Shape()
  shape.moveTo(-0.058, -0.0032)
  shape.lineTo(-0.056, -0.0042)
  shape.lineTo(-0.018, -0.0044)
  shape.lineTo(-0.004, -0.0036)
  shape.lineTo(0.006, -0.0075) // widen into head
  shape.lineTo(0.014, -0.008)
  shape.lineTo(0.014, 0.008)
  shape.lineTo(0.006, 0.0075)
  shape.lineTo(-0.004, 0.0036)
  shape.lineTo(-0.018, 0.0044)
  shape.lineTo(-0.056, 0.0042)
  shape.lineTo(-0.058, 0.0032)
  shape.lineTo(-0.058, -0.0032)

  const body = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, {
      depth: 0.002,
      bevelEnabled: true,
      bevelThickness: 0.0003,
      bevelSize: 0.0003,
      bevelSegments: 1,
    }),
    material,
  )
  body.rotation.x = -Math.PI / 2
  body.position.y = 0.002
  body.castShadow = true
  fork.add(body)

  // Tines rooted in the head so they read as connected
  const tineZs = [-0.006, -0.002, 0.002, 0.006]
  for (const z of tineZs) {
    const tineShape = new THREE.Shape()
    tineShape.moveTo(0.01, -0.0009)
    tineShape.lineTo(0.042, -0.0007)
    tineShape.lineTo(0.048, 0)
    tineShape.lineTo(0.042, 0.0007)
    tineShape.lineTo(0.01, 0.0009)
    tineShape.lineTo(0.01, -0.0009)

    const tine = new THREE.Mesh(
      new THREE.ExtrudeGeometry(tineShape, {
        depth: 0.0016,
        bevelEnabled: false,
      }),
      material,
    )
    tine.rotation.x = -Math.PI / 2
    tine.position.set(0, 0.0022, z)
    tine.castShadow = true
    fork.add(tine)
  }

  return fork
}

/**
 * Dining table with Quaternius burger, fries, and soda (CC0).
 * https://quaternius.com/packs/ultimatefood.html
 */
export function createDiningTable() {
  const group = new THREE.Group()
  group.name = 'diningTable'

  const woodMat = mat(0x8a7355, { roughness: 0.65, metalness: 0.05 })
  const legMat = mat(0x6b5840, { roughness: 0.7 })

  const top = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 0.85), woodMat)
  top.position.y = 0.74
  top.castShadow = true
  top.receiveShadow = true
  group.add(top)

  const apron = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.06, 0.77), legMat)
  apron.position.y = 0.695
  group.add(apron)

  const legGeo = new THREE.BoxGeometry(0.06, 0.7, 0.06)
  for (const [x, z] of [
    [0.58, 0.32],
    [-0.58, 0.32],
    [0.58, -0.32],
    [-0.58, -0.32],
  ]) {
    const leg = new THREE.Mesh(legGeo, legMat)
    leg.position.set(x, 0.35, z)
    leg.castShadow = true
    group.add(leg)
  }

  const surfaceY = 0.765

  // Invisible hit deck over the whole tabletop so the meal (not only the menu) is clickable
  const hitDeck = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.08, 0.85),
    new THREE.MeshBasicMaterial({ visible: false }),
  )
  hitDeck.position.y = surfaceY + 0.04
  hitDeck.userData.interactive = 'about'
  hitDeck.userData.skipHover = true
  group.add(hitDeck)

  // Meal set — menu as backdrop; food sits in front (toward the camera) so it
  // stays visible when you zoom the menu.
  const menu = createBurgerMenu()
  menu.position.set(0.02, surfaceY + 0.004, 0.02)
  menu.rotation.y = Math.PI + 0.08
  group.add(menu)

  group.userData.screenSize = menu.userData.screenSize

  const plate = createPlate()
  plate.position.set(-0.28, surfaceY, -0.14)
  group.add(plate)

  const burgerSlot = new THREE.Group()
  burgerSlot.name = 'hamburger'
  burgerSlot.position.set(-0.28, surfaceY + 0.006, -0.15)
  burgerSlot.rotation.y = 0.25
  group.add(burgerSlot)

  const friesSlot = new THREE.Group()
  friesSlot.name = 'fries'
  friesSlot.position.set(0.22, surfaceY, -0.02)
  friesSlot.rotation.y = -0.35 + Math.PI
  group.add(friesSlot)

  const drinkSlot = new THREE.Group()
  drinkSlot.name = 'drink'
  // Left of the menu, still behind the burger in the zoomed view
  drinkSlot.position.set(-0.22, surfaceY, 0.06)
  group.add(drinkSlot)

  const brandLogo = createBagLabelTexture('John Berger')

  const bag = createFastFoodBag('John Berger', brandLogo)
  bag.position.set(0.38, surfaceY, -0.08)
  bag.rotation.y = -0.4 + Math.PI + Math.PI / 2
  group.add(bag)

  // Napkin nearer the menu; utensils sit on the near edge of the napkin
  const napkinX = 0.02
  const napkinZ = -0.26
  const napkinRot = 0.12
  const napkin = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.004, 0.16),
    mat(0xe8efe9, { roughness: 0.9 }),
  )
  napkin.position.set(napkinX, surfaceY + 0.002, napkinZ)
  napkin.rotation.y = napkinRot
  group.add(napkin)

  const cutleryMat = mat(0xc0c4c8, { roughness: 0.3, metalness: 0.8 })
  const cosN = Math.cos(napkinRot)
  const sinN = Math.sin(napkinRot)
  const cutleryGap = 0.045
  // localZ negative = toward the table edge / camera
  const cutleryLocalZ = -0.035
  const placeOnNapkin = (localX, localZ = 0) => ({
    x: napkinX + localX * cosN + localZ * sinN,
    z: napkinZ - localX * sinN + localZ * cosN,
  })

  const knifePos = placeOnNapkin(cutleryGap, cutleryLocalZ)
  const knife = createKnife(cutleryMat)
  knife.position.set(knifePos.x, surfaceY + 0.016, knifePos.z)
  knife.rotation.y = Math.PI / 2 + 0.45 + Math.PI
  group.add(knife)

  const forkPos = placeOnNapkin(-cutleryGap, cutleryLocalZ)
  const fork = createFork(cutleryMat)
  fork.position.set(forkPos.x, surfaceY + 0.016, forkPos.z)
  fork.rotation.y = Math.PI / 2 - 0.45 + Math.PI
  group.add(fork)

  // Table surface + meal props are the about hotspot (chairs stay scenic)
  markAbout(top)
  markAbout(apron)
  markAbout(plate)
  markAbout(bag)
  markAbout(napkin)
  markAbout(knife)
  markAbout(fork)

  // Four chairs around the table
  const chairs = [
    { x: 0, z: 0.62, ry: Math.PI },
    { x: 0, z: -0.62, ry: 0 },
    { x: 0.85, z: 0, ry: -Math.PI / 2 },
    { x: -0.85, z: 0, ry: Math.PI / 2 },
  ]
  for (const { x, z, ry } of chairs) {
    const chair = createDiningChair()
    chair.position.set(x, 0, z)
    chair.rotation.y = ry
    group.add(chair)
  }

  // In front of the smaller side window
  group.position.set(3.0, 0, -0.35)
  group.rotation.y = Math.PI / 2

  const ready = Promise.all([
    loadFood(BURGER_URL, { targetHeight: 0.11 }),
    loadFood(FRIES_URL, { targetHeight: 0.18, uprightFromZ: true }),
    loadFood(SODA_URL, { targetHeight: 0.26 }),
  ]).then(([burger, fries, soda]) => {
    burgerSlot.add(burger)
    friesSlot.add(fries)
    drinkSlot.add(soda)
    markAbout(burger)
    markAbout(fries)
    markAbout(soda)
    return group
  })

  return { group, ready }
}
