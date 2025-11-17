import { BoxGeometry, Mesh, MeshLambertMaterial } from "three";
import { startPosition } from "../core";

export const startBlock = () => {
  let cellSize = 5;

  let startGeometry = new Mesh(
    new BoxGeometry(cellSize, 0.5, cellSize),
    new MeshLambertMaterial({ color: 0xFFFF00 })
  );

  startGeometry.position.set(
    startPosition[0] * cellSize + cellSize / 2,
    0,
    startPosition[1] * cellSize + cellSize / 2
  );
  return startGeometry;
};
