import { BoxGeometry, Mesh } from "three";
import { createMaterialForType } from '../utils';


export const ground = (gridX, gridZ) => {
  let cellSize = 5;

  let groundGeometry = new BoxGeometry(
    cellSize, 0.1, cellSize
  );

  let groundMaterial = createMaterialForType('ground');

  let ground = new Mesh(groundGeometry, groundMaterial);
  ground.receiveShadow = true;  

  ground.position.set(
    gridX * cellSize + cellSize / 2,
    -0.05,
    gridZ * cellSize + cellSize / 2
  );

   ground.userData = { 
    type: 'ground', 
    gridX: gridX, 
    gridZ: gridZ 
  };
  

  return ground;
};
