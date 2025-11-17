import { PerspectiveCamera } from "three";

export function createCamera() {
  let camera = new PerspectiveCamera(70, 1, 0.1, 100);
  return camera;
}
