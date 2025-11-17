//basic pattern for most of our new modules
import { WebGLRenderer } from "three";

export const renderer = () => {
  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.physicallyCorrectLights = true;

  return renderer;
}
