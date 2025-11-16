import { PlaneGeometry, Mesh, MeshLambertMaterial } from "three";
import { maze } from "../core";
import * as THREE from 'three';
import atlasUrl from '../assets/textures/textures.png';
import { createMaterialForType } from '../utils';

let CELL_SIZE = 5;
let cachedTexture = null;
let cachedMaterial = null;

export function createGround(gridX, gridZ) {
  let groundGeometry = new THREE.BoxGeometry(
    CELL_SIZE, 0.1, CELL_SIZE
  );

  let groundMaterial = createMaterialForType('ground');

  let ground = new Mesh(groundGeometry, groundMaterial);
  ground.receiveShadow = true;  

  ground.position.set(
    gridX * CELL_SIZE + CELL_SIZE / 2,
    -0.05,
    gridZ * CELL_SIZE + CELL_SIZE / 2
  );

   ground.userData = { 
    type: 'ground', 
    gridX: gridX, 
    gridZ: gridZ 
  };
  

  return ground;
};

