import { BoxGeometry, Mesh, MeshLambertMaterial } from "three";
import { startPosition } from "../core";
import { CELL_SIZE } from "../utils";

export const startBlock = () => {

  let startGeometry = new Mesh(
    new BoxGeometry(CELL_SIZE, 0.5, CELL_SIZE),
    new MeshLambertMaterial({ color: 0xFFFF00 })
  );

  startGeometry.position.set(
    startPosition[0] * CELL_SIZE + CELL_SIZE / 2,
    0,
    startPosition[1] * CELL_SIZE + CELL_SIZE / 2
  );
  return startGeometry;
};
