import * as THREE from 'three'

/** Shared MeshStandardMaterial helper for prop builders. */
export function mat(color, props = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.55,
    metalness: 0.05,
    ...props,
  })
}

/** Mark a mesh as a focus/hover hotspot. */
export function markInteractive(mesh, kind) {
  mesh.userData.interactive = kind
  return mesh
}
