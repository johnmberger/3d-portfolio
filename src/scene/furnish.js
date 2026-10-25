import {
  WALL_H,
  WALL_POS,
  createRoom,
  createPlants,
  createBicycle,
  createMonitor,
  createDiningTable,
  createTurntable,
  createVinylRack,
  createFloorLamp,
  createHangingPendant,
  createLightSwitch,
  createRug,
  createDog,
  createWallArt,
  createBathroom,
  createCreditsPlaque,
  createCouch,
  createArmchair,
  createTV,
  createKitchenette,
  createSideTables,
  createRoundCoffeeTable,
  createWallInstruments,
} from '../objects/index.js'

/** Builds every prop, adds it to the scene, and returns the handles the rest of the app animates. */
export function furnishRoom(scene, { isMobile }) {
  const room = createRoom({ sideWindowGlow: !isMobile })
  const plants = createPlants()
  const {
    group: bicycle,
    ready: bikeReady,
    startLoad: startBikeLoad,
  } = createBicycle({ defer: true })
  const monitor = createMonitor()
  const { group: dining, ready: diningReady } = createDiningTable()
  const turntable = createTurntable()
  const vinylRack = createVinylRack()
  // Front-right corner of the lounge rug (open end of the sectional), aimed at the TV
  const lamp = createFloorLamp({
    position: [-0.88, 0, 0.78],
    rotationY: -Math.PI / 2,
    name: 'loungeLamp',
  })
  // Ceiling pendant over the back-right plant corner (where the hanging planter was)
  const plantPendant = createHangingPendant({
    position: [WALL_POS - 1.0, WALL_H - 0.01, -(WALL_POS - 1.0)],
    cordLength: 0.9,
    name: 'plantPendant',
  })
  const lightSwitch = createLightSwitch()
  const rug = createRug()
  const { group: dog, ready: dogReady } = createDog()
  const wallArt = createWallArt()
  const bathroom = createBathroom({ vanityFill: !isMobile })
  const creditsPlaque = createCreditsPlaque()
  const couch = createCouch()
  const listeningChair = createArmchair({
    // On the room-side edge of the listening rug, facing the vinyl
    position: [-2.2, 0, -2.05],
    rotationY: Math.PI + 0.35,
    fabricColor: 0xa89880,
    fabricDeepColor: 0x96866e,
    pillowColor: 0x8a8e92,
  })
  const tv = createTV()
  const kitchenette = createKitchenette({ underCabinetLights: !isMobile })
  const sideTables = createSideTables()
  const roundCoffee = createRoundCoffeeTable({
    position: [-1.85, 0, 2.65],
    staticSmoke: isMobile,
  })
  const { group: instruments, ready: instrumentsReady } = createWallInstruments({
    fillLight: !isMobile,
  })
  scene.add(
    room,
    plants,
    bicycle,
    monitor,
    dining,
    turntable,
    vinylRack,
    lamp,
    plantPendant,
    lightSwitch,
    rug,
    dog,
    wallArt,
    bathroom,
    creditsPlaque,
    couch,
    listeningChair,
    tv,
    kitchenette,
    sideTables,
    roundCoffee,
    instruments,
  )

  const photoShelf = wallArt.getObjectByName('photoShelf')
  const interactiveRoots = {
    monitor,
    turntable,
    vinylRack,
    bathroom,
    credits: creditsPlaque,
    about: dining,
    photo: photoShelf,
    dog,
    tv,
    lightSwitch,
  }

  return {
    room,
    plants,
    bikeReady,
    startBikeLoad,
    monitor,
    dining,
    diningReady,
    turntable,
    vinylRack,
    lamp,
    plantPendant,
    lightSwitch,
    dog,
    dogReady,
    bathroom,
    creditsPlaque,
    tv,
    roundCoffee,
    instrumentsReady,
    photoShelf,
    monitorScreen: monitor.getObjectByName('screen'),
    earwormsScreen: turntable.getObjectByName('screen'),
    vinylScreen: vinylRack.getObjectByName('screen'),
    bathroomScreen: bathroom.getObjectByName('screen'),
    creditsScreen: creditsPlaque.getObjectByName('screen'),
    aboutScreen: dining.getObjectByName('screen'),
    photoScreen: photoShelf.getObjectByName('screen'),
    dogScreen: dog.getObjectByName('screen'),
    tvScreen: tv.getObjectByName('screen'),
    interactiveRoots,
  }
}
