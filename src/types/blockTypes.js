export const ATLAS_CONFIG = {
  tileSize: 77,        // each tile is 77x77  
  atlasWidth: 154,      // each atlas width
  atlasHeight: 77,     // each atlas height
  tilesPerRow: 2,      // each two tiles across (columns)
  tilesPerColumn: 1    // each one row
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

  ground: {
    right: [1, 0],
    left: [1, 0],
    top: [1, 0],  
    bottom: [1, 0],
    front: [1, 0],
    back: [1, 0]
  }

  // startBlock: {
  //   right: [0, 0],
  //   left: [0, 0],
  //   top: [0, 0],
  //   bottom: [0, 0],
  //   front: [0, 0],
  //   back: [0, 0]
  // },

  // endBlock: {
  //   right: [0, 0],
  //   left: [0, 0], 
  //   top: [0, 0],
  //   bottom: [0, 0],
  //   front: [0, 0],
  //   back: [0, 0]
  // }
};

export const BLOCK_DIMS = {
  wall: [5, 5, 5],
  startBlock: [5, 0.5, 5],
  endBlock: [5, 0.5, 5]
}
