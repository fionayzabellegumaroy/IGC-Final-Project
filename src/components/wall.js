import * as THREE from 'three';
import { MeshLambertMaterial } from 'three';
import atlasUrl from '../assets/textures/brick-texture.png';

let CELL_SIZE = 5;
let cachedTexture = null;
let cachedMaterial = null;

function getWallMaterial() {
  if (!cachedMaterial) {
    const loader = new THREE.TextureLoader();
    cachedTexture = loader.load(atlasUrl);
    
    cachedTexture.magFilter = THREE.NearestFilter;
    cachedTexture.minFilter = THREE.NearestFilter;
    cachedTexture.wrapS = THREE.RepeatWrapping;
    cachedTexture.wrapT = THREE.RepeatWrapping;
    
    cachedTexture.colorSpace = THREE.SRGBColorSpace; 
    
    cachedTexture.flipY = false; // force texture to not be processed/gamma corrected

    
    cachedMaterial = new MeshLambertMaterial({ 
      map: cachedTexture,
    });

    cachedMaterial.receiveShadow = true;
  }
  
  return cachedMaterial;
}

export function createWall(gridX, gridZ) {
  const geometry = new THREE.BoxGeometry(CELL_SIZE, CELL_SIZE, CELL_SIZE);
  const material = getWallMaterial();
  const wall = new THREE.Mesh(geometry, material);
  
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