import * as THREE from 'three';

import { PlaneGeometry, Mesh, MeshStandardMaterial } from "three";

const player = () => {
  let cell_size = 1;
  let playerMesh = new THREE.Mesh(
    new THREE.BoxGeometry(cell_size, 0.5, cell_size),
    new THREE.MeshStandardMaterial({ color: 0xFFA500 })
  );
  return playerMesh;
};

export { player };
