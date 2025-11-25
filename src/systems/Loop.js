import { Clock } from "three";
import { createDebugOverlay, updateDebugOverlay, disposeDebugOverlay } from './debugOverlay';

export class Loop {
  constructor(camera, scene, renderer) {
    this.camera = camera;
    this.scene = scene;
    this.renderer = renderer;
    this.updatables = [];
    this.onRender = null; //needed to avoid double-rendering and deals with world-specific logic
    this.clock = new Clock();
  }

  start() {
    // create per-loop overlay for debugging
    try { this._debug = createDebugOverlay(); } catch (e) {}

    this.renderer.setAnimationLoop(() => { // start the animation loop
      this.tick(); //update animations
      
      if (this.onRender) { // call world-specific render logic -> since loop initialized in World, it is truthy
        this.onRender(); //calls function World assigned (handleControls)
      }
      
      // render a frame
      this.renderer.render(this.scene, this.camera);
    });
  }

  stop() {
    this.renderer.setAnimationLoop(null); // stop the animation loop
  }

  tick() { // manages animations
    const rawDelta = this.clock.getDelta(); // call delta once per frame for this loop instance
    let delta = rawDelta;
    // clamp large deltas (e.g., when tab was inactive) to avoid big position jumps
    const MAX_DELTA = 0.05; // 50 ms
    if (delta > MAX_DELTA) delta = MAX_DELTA;

    // Log unusually large frame times to help diagnose stutter
    const LOG_THRESHOLD = 0.03; // 30 ms
    if (rawDelta > LOG_THRESHOLD) {
      try {
        const camPos = this.camera && this.camera.position ? this.camera.position.toArray() : null;
        console.warn(`[Loop] large frame delta detected: raw=${rawDelta.toFixed(3)}s clamped=${delta.toFixed(3)}s`, { camPos });
      } catch (e) {
        console.warn('[Loop] large frame delta detected', { rawDelta, delta });
      }
    }

    // update on-screen debug overlay
    try { updateDebugOverlay(delta, rawDelta, this.camera && this.camera.position ? this.camera.position.toArray() : null); } catch (e) {}

    // update all objects
    for (let object of this.updatables) {
      if (typeof object.tick === 'function') {
        try {
          object.tick(delta);
        } catch (err) {
          console.error('[Loop] error updating object tick', err);
        }
      }
    }
  }
}
