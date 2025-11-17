import { PerspectiveCamera } from "three";
import { startPosition } from "../core";

export const camera = () => {
  let camera = new PerspectiveCamera(70, 1, 0.1, 100);

  let cellSize = 5;

  //this is first person POV
    camera.position.set(
      startPosition[0] * cellSize + cellSize / 2,
      2, // Eye height
      startPosition[1] * cellSize + cellSize / 2
    );

  return camera;
}
