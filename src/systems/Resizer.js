export class Resizer {
  constructor(container, camera, renderer, onResize = null) {
    this.camera = camera;
    this.renderer = renderer;
    this.container = container;
    this.onResize = onResize;

    this.setSize();
    window.addEventListener('resize', () => this.setSize());
  }

  setSize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
    if (this.onResize) {
      this.onResize(width, height);
    }
  }
}
