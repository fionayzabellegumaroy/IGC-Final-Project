import { BoxGeometry, Mesh } from 'three';
import { createMaterialForType } from '../utils';

export function createWall(gridX, gridZ, height) {
  let cellSize = 5;
  const geometry = new BoxGeometry(cellSize, cellSize, cellSize);
  const material = createMaterialForType('wall');
  const wall = new Mesh(geometry, material);
  
  wall.receiveShadow = true;
  

  wall.position.set(
    gridX * cellSize + cellSize / 2,
    height,
    gridZ * cellSize + cellSize / 2
  );


  wall.userData = { 
    type: 'wall', 
    gridX: gridX, 
    gridZ: gridZ 
  };
  
  return wall;
}
