import { Clock } from "three";

export class Loop {
  constructor(camera, scene, renderer) {
    this.camera = camera;
    this.scene = scene;
    this.renderer = renderer;
    this.updatables = [];
    this.onRender = null;
    this.clock = new Clock(false);
    this.frameCount = 0;
    this.isPaused = false;
  }

  start() {
    let firstFrame = true;

    this.renderer.setAnimationLoop(() => {
      if (this.isPaused) return;

      if (firstFrame) {
        this.clock.start();
        firstFrame = false;
        return;
      }

      let delta = this.clock.getDelta();

      this.tick(delta);
      if (this.onRender) {
        this.onRender(delta);
      }
      this.renderer.render(this.scene, this.camera);
    });
  }

  pause() {
    this.isPaused = true;
    this.clock.stop();
  }

  resume() {
    this.isPaused = false;
    this.clock.start();
  }

  stop() {
    this.renderer.setAnimationLoop(null);
    this.clock.stop();
  }

  tick(delta) {
    for (let object of this.updatables) {
      object.tick(delta);
    }
  }
}
