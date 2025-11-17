import {
  Color,
  PCFSoftShadowMap,
  Raycaster,
  Vector2,
  Vector3,
} from "three";
import {
  ambientLight,
  camera,
  ceiling,
  createWall,
  endBlock,
  ground,
  player,
  startBlock, // removed for now; idk what to do for this yet
  scene,
  torch,
} from "../components";
// import { Resizer } from "../systems/Resizer.js";
import { maze } from "../core";
import {
  Loop,
  PlayerMovement,
  renderer,
  setupControls,
} from "../systems";

export class World {
  constructor(container, options = {}) {
    this.camera = camera();
    this.scene = scene();
    this.renderer = renderer(); // creates a canvas element
    this.onExit = options.onExit;
    this.isPopupOpen = false;
    this.torchLight = torch();
    this.raycaster = new Raycaster();
    this.mouse = new Vector2();
    this.ambientLight = ambientLight();
    this.player = player();

    let { controls, keys, dispose } = setupControls(
      this.camera,
      document.body,
      this.onObjectClick.bind(this),
      () => this.isPopupOpen
    );

    this.controls = controls;
    this.keys = keys;

    // reset controls
    this.renderer.domElement.style.pointerEvents = "none"; // disable click events on the renderer canvas
    this.controlsDispose = dispose;
    Object.keys(this.keys).forEach((key) => {
      // clear any held keys
      this.keys[key] = false;
    });

    this.playerMovementInstance = new PlayerMovement(
      this.camera,
      this.controls,
      this.keys
    );

    container.appendChild(this.renderer.domElement); // makes canvas visible and World attaches Three.js to div

    this.scene.background = new Color(0x87ceeb); // sky blue

    let width = container.clientWidth;
    let height = container.clientHeight;

    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;

    this.camera.aspect = width / height;
    // this.camera.updateProjectionMatrix();

    // attach to camera so it moves with player
    this.camera.add(this.torchLight);

    this.scene.add(
      this.ambientLight,
      this.camera,
      ceiling(),
      endBlock(),
      this.player
    );

    // this.resizer = new Resizer(container, this.camera, this.renderer);

    //add later loop.updatables.push(some thing);

    // add walls & ground
    for (let i = 0; i < maze.length; i++) {
      for (let j = 0; j < maze[i].length; j++) {
        if (maze[i][j] === 1) {
          let wall = createWall(i, j);
          this.scene.add(wall);
        }
        let groundBlock = ground(i, j);
        this.scene.add(groundBlock);
      }
    }

    // async init() {
    //     // asynchronous setup here
    // }

    // loop manager if needed elsewhere
    this.loop = new Loop(this.camera, this.scene, this.renderer);

    // hook up controls handling to the loop
    this.loop.onRender = () => {
      if (!this.isPopupOpen && this.controls.enabled) {
        // only update if popup is not open
        this.playerMovementInstance.update();
      }

      // torchlight animation
      this.torchLight.intensity = 5.0 + Math.sin(Date.now() * 0.01) * 0.3;

      // keep player model in sync with camera position
      this.player.position.copy(this.camera.position);
      this.player.position.y -= 0.9;

      // gets camera direction to later use for player model rotation
      const direction = new Vector3();
      this.camera.getWorldDirection(direction);

      // convert direction to Y rotation
      const yRotation = Math.atan2(direction.x, direction.z);
      if (this.player) this.player.rotation.y = yRotation;
    };
  }

  onObjectClick(event) {
    let mouseX, mouseY;

    if (document.pointerLockElement) {
      // treat the center of the screen as the click point
      mouseX = 0;
      mouseY = 0;
    } else {
      // normal click handling when not in pointer lock
      const rect = this.renderer.domElement.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    this.mouse.x = mouseX;
    this.mouse.y = mouseY;

    // update the raycaster with camera and mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // find intersected objects
    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;

      // check what type of object was clicked
      if (
        clickedObject.userData &&
        clickedObject.userData.type === "endBlock"
      ) {
        this.showEndBlockPopup(clickedObject);
        this.controls.unlock();
      }
    }
  }

  showEndBlockPopup(endBlock) {
    this.createDOMPopup("You found the missing shoe. Go home now.");
  }

  createDOMPopup(title) {
    // set popup state
    this.isPopupOpen = true;

    // disable all camera/movement controls
    this.controls.unlock(); // Release pointer lock
    this.controls.enabled = false; // Disable mouse look

    // clear any held keys
    Object.keys(this.keys).forEach((key) => {
      this.keys[key] = false;
    });

    const popup = document.createElement("div");
    popup.style.position = "fixed";
    popup.style.top = "50%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.background = "white";
    popup.style.border = "2px solid black";
    popup.style.padding = "20px";
    popup.style.zIndex = "1000";

    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.onclick = () => {
      popup.remove();
      this.isPopupOpen = false;
      // reenable controls when popup closes
      try {
        this.controls.enabled = true;
      } catch (e) {}

      if (typeof this.onExit === "function") {
        this.onExit();
      }
    };

    popup.innerHTML = `<h3>${title}</h3>`;
    popup.appendChild(closeButton);

    document.body.appendChild(popup);
  }

  dispose() {
    // cleanup control listeners
    if (this.controlsDispose) {
      try {
        this.controlsDispose();
      } catch (e) {
        // ignore errors during cleanup
      }
      this.controlsDispose = null;
    }

    this.renderer.dispose();

    // remove and clean up torch light if present
    if (this.torchLight) {
      try {
        this.camera.remove(this.torchLight);
      } catch (e) {}
    }

    try {
      if (this.ambientLight && this.scene) {
        this.scene.remove(this.ambientLight);
      }
    } catch (e) {}

  }
}
