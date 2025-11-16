import * as THREE from 'three';
import { MeshLambertMaterial } from 'three';
import atlasUrl from '../assets/textures/textures.png';
import { createMaterialForType } from '../utils';

let CELL_SIZE = 5;
let cachedTexture = null;
let cachedMaterial = null;

export function createWall(gridX, gridZ) {
  const geometry = new THREE.BoxGeometry(CELL_SIZE, CELL_SIZE, CELL_SIZE);
  const material = createMaterialForType('wall');
  const wall = new THREE.Mesh(geometry, material);
  
  wall.receiveShadow = true;
  wall.position.set(
    gridX * CELL_SIZE + CELL_SIZE / 2,
    CELL_SIZE / 2,
    gridZ * CELL_SIZE + CELL_SIZE / 2
  );

  wall.userData = { 
    type: 'wall', 
    gridX: gridX, 
    gridZ: gridZ 
  };
  
  return wall;
}