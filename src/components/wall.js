import * as THREE from 'three';

let CELL_SIZE = 5;

export function createWall(gridX, gridZ) {
  let wall = new THREE.Mesh(
    new THREE.BoxGeometry(CELL_SIZE, 20, CELL_SIZE), //make it a cube wall
    new THREE.MeshStandardMaterial({ color: 0x888888 }) // temporary make it gray
  );
  
  wall.position.set(
    gridX * CELL_SIZE + CELL_SIZE/ 2,
    10,
    gridZ * CELL_SIZE + CELL_SIZE / 2
  );
  
  return wall;
}