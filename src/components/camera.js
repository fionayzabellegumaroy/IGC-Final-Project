import { PerspectiveCamera } from 'three';

function createCamera() {
  //arbitrary values
  const camera = new PerspectiveCamera(60, 1, 0.1, 100);
  return camera;
}

export { createCamera };