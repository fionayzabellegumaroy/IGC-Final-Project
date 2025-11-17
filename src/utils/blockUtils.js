import { BoxGeometry, ClampToEdgeWrapping, MeshLambertMaterial, NearestFilter, SRGBColorSpace, TextureLoader } from 'three';
import atlasUrl from '../assets/textures/textures.png';
import { BLOCK_TYPES, ATLAS_CONFIG, BLOCK_DIMS } from '../types/blockTypes';

function getTileUVs(tileX, tileY) {
  let { tileSize, atlasWidth, atlasHeight } = ATLAS_CONFIG;
  
  // calculate normalized UV coordinates
  let uMin = (tileX * tileSize) / atlasWidth;
  let uMax = ((tileX + 1) * tileSize) / atlasWidth;
  let vMin = 1 - ((tileY + 1) * tileSize) / atlasHeight;
  let vMax = 1 - (tileY * tileSize) / atlasHeight;
  
  return [
    uMin, vMax,  // bottom-left
    uMax, vMax,  // bottom-right  
    uMax, vMin,  // top-right
    uMin, vMin   // top-left
  ];
}

export function createBlockGeometry(blockType) {
  let dims = BLOCK_DIMS && BLOCK_DIMS[blockType] ? BLOCK_DIMS[blockType] : [1, 1, 1];
  let geometry = new BoxGeometry(dims[0], dims[1], dims[2]);
  
  let uvs = geometry.attributes.uv.array;
  let blockConfig = BLOCK_TYPES[blockType];
  
  if (!blockConfig) {
    console.warn(`Block type ${blockType} not found in BLOCK_TYPES`);
    return geometry;
  }

  let faceNames = ['right', 'left', 'top', 'bottom', 'front', 'back'];
  
  geometry.clearGroups();

  for (let i = 0; i < 6; i++) {
    geometry.addGroup(i * 6, 6, i); // startIndex, count, materialIndex
  }
  
  for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
    let faceName = faceNames[faceIndex];
    let [tileX, tileY] = blockConfig[faceName];
    let faceUVs = getTileUVs(tileX, tileY);
    
    let startIdx = faceIndex * 8;
    for (let i = 0; i < 8; i++) {
      uvs[startIdx + i] = faceUVs[i];
    }
  }

  geometry.attributes.uv.needsUpdate = true;
  return geometry;
}

let textureCache = new Map();

function getTexture() {
  let texture = textureCache.get(atlasUrl);
  if (!texture) {
    let loader = new TextureLoader();
    texture = loader.load(atlasUrl);
    
    texture.magFilter = NearestFilter;
    texture.minFilter = NearestFilter;
    texture.wrapS = ClampToEdgeWrapping;
    texture.wrapT = ClampToEdgeWrapping;
    texture.colorSpace = SRGBColorSpace;
    
    textureCache.set(atlasUrl, texture);
  }
  return texture;
}

export function createMaterialForType(blockType, opts = {}) {
  let texture = getTexture();
  let blockConfig = BLOCK_TYPES[blockType];
  
  if (!blockConfig) {
    return new MeshLambertMaterial({ map: texture });
  }

  // create 6 materials, one for each face
  let materials = [];
  let faceNames = ['right', 'left', 'top', 'bottom', 'front', 'back'];
  
  for (let i = 0; i < 6; i++) {
    let material = new MeshLambertMaterial({ 
      map: texture.clone(),
    });
    
    let [tileX, tileY] = blockConfig[faceNames[i]];
    let { tileSize, atlasWidth, atlasHeight } = ATLAS_CONFIG;
    
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