import { BoxGeometry, Mesh } from "three";
import { CELL_SIZE, createMaterialForType } from "../utils";

let groundGeometry = new BoxGeometry(CELL_SIZE, 0.1, CELL_SIZE);
let groundMaterial = createMaterialForType("ground");

export const ground = (gridX, gridZ) => {
  let ground = new Mesh(groundGeometry, groundMaterial);
  ground.receiveShadow = true;

  ground.position.set(
    gridX * CELL_SIZE + CELL_SIZE / 2,
    -0.05,
    gridZ * CELL_SIZE + CELL_SIZE / 2
  );

  ground.userData = {
    type: "ground",
    gridX: gridX,
    gridZ: gridZ,
  };

  return ground;
};
