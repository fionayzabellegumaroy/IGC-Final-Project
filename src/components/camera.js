import { PerspectiveCamera } from "three";
import { startPosition } from "../core";
import { CELL_SIZE, EYE_HEIGHT } from "../utils";

export const camera = () => {
  let camera = new PerspectiveCamera(65, 0.9, 0.1, 100);


  camera.position.set(
    startPosition[0] * CELL_SIZE + CELL_SIZE / 2,
    EYE_HEIGHT,
    startPosition[1] * CELL_SIZE + CELL_SIZE / 2
  );

  return camera;
};