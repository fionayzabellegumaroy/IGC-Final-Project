// using PointerLockControls for first-person controls
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'; 


export function setupControls(camera, domElement) {
  let controls = new PointerLockControls(camera, domElement);
  
  // key states for movement
  let keys = { w: false, a: false, s: false, d: false };
  
  // event listeners logic
  document.addEventListener('keydown', (e) => {
    if (e.key in keys) keys[e.key] = true;
  });
  
  document.addEventListener('keyup', (e) => {
    if (e.key in keys) keys[e.key] = false;
  });
  
  // "to lock" on click so we can move around; idk about this yet
  domElement.addEventListener('click', () => {
    controls.lock();
  });
  
  return { controls, keys };
}