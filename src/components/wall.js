import { BoxGeometry, Mesh } from "three";
import { createMaterialForType } from "../utils";
import { CELL_SIZE } from "../utils";

const geometry = new BoxGeometry(CELL_SIZE, CELL_SIZE, CELL_SIZE);
const material = createMaterialForType("wall");

export function createWall(gridX, gridZ, height) {
  const wall = new Mesh(geometry, material);

  wall.receiveShadow = true;

  wall.position.set(
    gridX * CELL_SIZE + CELL_SIZE / 2,
    height,
    gridZ * CELL_SIZE + CELL_SIZE / 2
  );

  wall.userData = {
    type: "wall",
    gridX: gridX,
    gridZ: gridZ,
  };

  return wall;
}
