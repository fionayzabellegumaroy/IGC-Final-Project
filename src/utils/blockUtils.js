import * as THREE from 'three';
import atlasUrl from '../assets/textures/textures.png';
import { BLOCK_TYPES, ATLAS_CONFIG, BLOCK_DIMS } from '../types/blockTypes';

function getTileUVs(tileX, tileY) {
  const { tileSize, atlasWidth, atlasHeight } = ATLAS_CONFIG;
  
  // calculate normalized UV coordinates
  const uMin = (tileX * tileSize) / atlasWidth;
  const uMax = ((tileX + 1) * tileSize) / atlasWidth;
  const vMin = 1 - ((tileY + 1) * tileSize) / atlasHeight;
  const vMax = 1 - (tileY * tileSize) / atlasHeight;
  
  return [
    uMin, vMax,  // bottom-left
    uMax, vMax,  // bottom-right  
    uMax, vMin,  // top-right
    uMin, vMin   // top-left
  ];
}

export function createBlockGeometry(blockType) {
  const dims = BLOCK_DIMS && BLOCK_DIMS[blockType] ? BLOCK_DIMS[blockType] : [1, 1, 1];
  const geometry = new THREE.BoxGeometry(dims[0], dims[1], dims[2]);
  
  const uvs = geometry.attributes.uv.array;
  const blockConfig = BLOCK_TYPES[blockType];
  
  if (!blockConfig) {
    console.warn(`Block type ${blockType} not found in BLOCK_TYPES`);
    return geometry;
  }

  const faceNames = ['right', 'left', 'top', 'bottom', 'front', 'back'];
  
  geometry.clearGroups();

  for (let i = 0; i < 6; i++) {
    geometry.addGroup(i * 6, 6, i); // startIndex, count, materialIndex
  }
  
  for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
    const faceName = faceNames[faceIndex];
    const [tileX, tileY] = blockConfig[faceName];
    const faceUVs = getTileUVs(tileX, tileY);
    
    const startIdx = faceIndex * 8;
    for (let i = 0; i < 8; i++) {
      uvs[startIdx + i] = faceUVs[i];
    }
  }

  geometry.attributes.uv.needsUpdate = true;
  return geometry;
}

const textureCache = new Map();

function getTexture() {
  let texture = textureCache.get(atlasUrl);
  if (!texture) {
    const loader = new THREE.TextureLoader();
    texture = loader.load(atlasUrl);
    
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    
    textureCache.set(atlasUrl, texture);
  }
  return texture;
}

export function createMaterialForType(blockType, opts = {}) {
  const texture = getTexture();
  const blockConfig = BLOCK_TYPES[blockType];
  
  if (!blockConfig) {
    return new THREE.MeshStandardMaterial({ map: texture });
  }

  // create 6 materials, one for each face
  const materials = [];
  const faceNames = ['right', 'left', 'top', 'bottom', 'front', 'back'];
  
  for (let i = 0; i < 6; i++) {
    const material = new THREE.MeshStandardMaterial({ 
      map: texture.clone(),
      roughness: 0.8,
      metalness: 0
    });
    
    const [tileX, tileY] = blockConfig[faceNames[i]];
    const { tileSize, atlasWidth, atlasHeight } = ATLAS_CONFIG;
    
    // set texture offset and repeat for this specific tile
    material.map.repeat.set(
      tileSize / atlasWidth,
      tileSize / atlasHeight
    );
    material.map.offset.set(
      (tileX * tileSize) / atlasWidth,
      1 - ((tileY + 1) * tileSize) / atlasHeight
    );
    
    materials.push(material);
  }
  
  return materials;
}