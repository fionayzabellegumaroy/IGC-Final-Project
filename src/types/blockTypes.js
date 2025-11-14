import { startBlock } from "../components";

export const ATLAS_CONFIG = {
  tileSize: 77,        // Each tile is 77x77  
  atlasWidth: 77,      // Total atlas width
  atlasHeight: 77,     // Total atlas height
  tilesPerRow: 1,      // Single tile
  tilesPerColumn: 1    // Single tile
};

export const BLOCK_TYPES = {
  wall: {
    right: [0, 0],
    left: [0, 0],
    top: [0, 0],
    bottom: [0, 0], 
    front: [0, 0],
    back: [0, 0]
  },
  startBlock: {
    // You can define different textures for start/end blocks later
    right: [0, 0],
    left: [0, 0],
    top: [0, 0],
    bottom: [0, 0],
    front: [0, 0],
    back: [0, 0]
  },
  endBlock: {
    right: [0, 0],
    left: [0, 0], 
    top: [0, 0],
    bottom: [0, 0],
    front: [0, 0],
    back: [0, 0]
  }
};

export const BLOCK_DIMS = {
  wall: [5, 5, 5],
  startBlock: [5, 0.5, 5],
  endBlock: [5, 0.5, 5]
}