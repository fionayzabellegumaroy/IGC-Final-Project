// using PointerLockControls for first-person controls
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export function setupControls(camera, domElement) {
  const controls = new PointerLockControls(camera, domElement);

  // key states for movement
  const keys = { w: false, a: false, s: false, d: false };

  // named event listeners so they can be removed later
  const onKeyDown = (e) => {
    if (e.key in keys) keys[e.key] = true;
  };

  const onKeyUp = (e) => {
    if (e.key in keys) keys[e.key] = false;
  };

  const onClick = () => {
    controls.lock();
  };

  // attach listeners
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  domElement.addEventListener('click', onClick);

  // dispose helper to remove listeners when the world is torn down
  function dispose() {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    domElement.removeEventListener('click', onClick);
    // make sure pointer lock is released
    try {
      controls.unlock();
    } catch (err) {
      // unlock may throw if not locked; ignore
    }
  }

  return { controls, keys, dispose };
}