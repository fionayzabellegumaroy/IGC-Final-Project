// using PointerLockControls for first-person controls
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export function setupControls(camera, domElement, onObjectClick = null, getPopupState = null) {
  const controls = new PointerLockControls(camera, domElement);
  const keys = { w: false, a: false, s: false, d: false };

  const onKeyDown = (e) => {
    // don't register movement keys if popup is open
    if (getPopupState && getPopupState()) return;
    if (e.key in keys) keys[e.key] = true;
  };

  const onKeyUp = (e) => {
    // don't register movement keys if popup is open
    if (getPopupState && getPopupState()) return;
    if (e.key in keys) keys[e.key] = false;
  };

  const onClick = (event) => {
    const isPopupOpen = getPopupState ? getPopupState() : false;
    if (isPopupOpen) {
      // popup, so don't do anything
      return;
    }
    
    if (document.pointerLockElement) {
      // in pointer lock, handle object clicking
      if (onObjectClick) {
        onObjectClick(event);
      }
    } else {
      // no popup and not locked so allow locking
      controls.lock();
    }
  };

  // attach listeners
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  domElement.addEventListener('click', onClick);

  function dispose() {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    domElement.removeEventListener('click', onClick);
    try {
      controls.unlock();
    } catch (err) {
      // ignore
    }
  }

  return { controls, keys, dispose };
}