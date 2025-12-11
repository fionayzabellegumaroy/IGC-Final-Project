import {
  ClampToEdgeWrapping,
  MeshLambertMaterial,
  NearestFilter,
  SRGBColorSpace,
  TextureLoader,
} from "three";
import atlasUrl from "../assets/textures/textures.png";
import { BLOCK_TYPES, ATLAS_CONFIG } from "../config/blockTypes";

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

export function createMaterialForType(blockType) {
  let texture = getTexture();
  let blockConfig = BLOCK_TYPES[blockType];

  if (!blockConfig) {
    return new MeshLambertMaterial({ map: texture });
  }

  // create 6 materials, one for each face
  let materials = [];
  let faceNames = ["right", "left", "top", "bottom", "front", "back"];

  for (let i = 0; i < 6; i++) {
    let material = new MeshLambertMaterial({
      map: texture.clone(),
    });

    let [tileX, tileY] = blockConfig[faceNames[i]];
    let { tileSize, atlasWidth, atlasHeight } = ATLAS_CONFIG;

    // set texture offset and repeat for this specific tile
    material.map.repeat.set(tileSize / atlasWidth, tileSize / atlasHeight);

    material.map.offset.set(
      (tileX * tileSize) / atlasWidth,
      1 - ((tileY + 1) * tileSize) / atlasHeight
    );

    materials.push(material);
  }

  return materials;
}
