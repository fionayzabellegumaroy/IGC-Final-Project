import * as THREE from 'three';
import atlasUrl from '../assets/textures/brick-texture.png';
import { BLOCK_TYPES, ATLAS_CONFIG, BLOCK_DIMS } from '../types/blockTypes';

// create a BoxGeometry that is sized by BLOCK_DIMS from types, and apply proper UV coordinates
export function createBlockGeometry(blockType) {
  const dims = BLOCK_DIMS && BLOCK_DIMS[blockType] ? BLOCK_DIMS[blockType] : [1, 1, 1];
  const geometry = new THREE.BoxGeometry(dims[0], dims[1], dims[2]);
  
  const uvs = geometry.attributes.uv.array;

  const standardUVs = [
    0, 1,  // bottom-left
    1, 1,  // bottom-right  
    1, 0,  // top-right
    0, 0   // top-left
  ];

  // apply the same UV mapping to all 6 faces
  for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
    const startIdx = faceIndex * 8;
    
    for (let i = 0; i < 8; i++) {
      uvs[startIdx + i] = standardUVs[i];
    }
  }

  geometry.attributes.uv.needsUpdate = true;
  return geometry;
}

const textureCache = new Map();

export function createMaterialForType(blockType, opts = {}) {
  let url = atlasUrl;

  let texture = textureCache.get(url);
  if (!texture) {
    const loader = new THREE.TextureLoader();
    texture = loader.load(url);
    
    // ensure no scaling or offset
    texture.repeat.set(1, 1);
    texture.offset.set(0, 0);
    
    // proper color space
    texture.colorSpace = THREE.SRGBColorSpace;
    
    textureCache.set(url, texture);
  }

  const material = new THREE.MeshStandardMaterial({ 
    map: texture,
    roughness: 0.8,
    metalness: 1
  });
  
  return material;
}