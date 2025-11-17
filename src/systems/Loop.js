import { Clock } from "three";

const clock = new Clock();

export class Loop {
  constructor(camera, scene, renderer) {
    this.camera = camera;
    this.scene = scene;
    this.renderer = renderer;
    this.updatables = [];
    this.onRender = null; //needed to avoid double-rendering and deals with world-specific logic
  }

  start() {
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
    const delta = clock.getDelta(); //call delta once per frame 

    // update all objects
    for (let object of this.updatables) {
      object.tick(delta);
    }
  }
}
