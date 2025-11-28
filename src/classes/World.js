import { Color, PCFSoftShadowMap, Raycaster, Vector2, Vector3 } from "three";
import {
  ambientLight,
  camera,
  ceiling,
  createWall,
  endBlock,
  ground,
  playerModel,
  LetterPopup,
  rightArmTorch,
  scene,
} from "../components";
import { maze } from "../core";
import { CELL_SIZE } from "../utils";
import { Loop, renderer, Resizer, setupControls } from "../systems";
import React from "react";
import { createRoot } from "react-dom/client";
import { Player } from "./";

export class World {
  constructor(container, options = {}) {
    this.camera = camera();
    this.scene = scene();
    this.renderer = renderer(); // creates a canvas element
    this.onExit = options.onExit;
    this.isPopupOpen = false;
    this.raycaster = new Raycaster();
    this.mouse = new Vector2();
    this.ambientLight = ambientLight();

    let { controls, keys, dispose } = setupControls(
      this.camera,
      document.body,
      this.onObjectClick.bind(this),
      () => this.isPopupOpen
    );

    this.controls = controls;
    this.keys = keys;

    this.player = new Player(
      this.scene,
      this.controls,
      this.camera,
      this.keys,
      () => !this.isPopupOpen
    );

    this.controlsDispose = dispose;

    this.container = container;

    this.init();
  }

  init() {
    this.container.appendChild(this.renderer.domElement); // makes canvas visible and World attaches Three.js to div

    // reset controls
    this.renderer.domElement.style.pointerEvents = "none"; // disable click events on the renderer canvas
    Object.keys(this.keys).forEach((key) => {
      this.keys[key] = false; // clear any held keys
    });

    this.scene.background = new Color(0x87ceeb); // sky blue

    let width = this.container.clientWidth;
    let height = this.container.clientHeight;

    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.playerModel = playerModel();
    this.armTorchModel = rightArmTorch();

    this.updateArmPosition = () => {
      let aspect = this.camera.aspect;
      let fov = this.camera.fov * (Math.PI / 180);

      let distance = 7.5;

      let vFOV = fov;
      let hFOV = 2 * Math.atan(Math.tan(vFOV / 2) * aspect);

      let rightEdge = Math.tan(hFOV / 2) * distance * 0.7;
      let bottomEdge = Math.tan(vFOV / 2) * distance * -1;

      this.armTorchModel.position.set(rightEdge, bottomEdge, -distance);
    };

    this.updateArmPosition();
    this.camera.add(this.armTorchModel);

    this.resizer = new Resizer(this.container, this.camera, this.renderer, () =>
      this.updateArmPosition()
    );

    // // idk if this is working
    // this.fireMaterial = null;

    // this.armTorchModel.traverse((child) => {
    //   if (child.isMesh && child.material.emissive && child.name === "FireMaterial") {
    //     this.fireMaterial = child.material;
    //   }
    // });

    this.scene.add(
      this.ambientLight,
      this.camera,
      ceiling(),
      endBlock(),
      this.playerModel
    );

    // loop manager if needed elsewhere
    this.loop = new Loop(this.camera, this.scene, this.renderer);

    // hook up controls handling to the loop
    this.loop.onRender = () => {
      if (!this.isPopupOpen && this.controls.enabled) {
        this.player.update(); // update player movement, camera, and headbobbing
      }

      // Get camera direction for rotation
      const direction = new Vector3();
      this.camera.getWorldDirection(direction);

      // Convert direction to Y rotation
      const yRotation = Math.atan2(direction.x, direction.z);
      this.playerModel.rotation.y = yRotation;

      // Position the model with offset relative to camera direction
      this.playerModel.position.copy(this.camera.position);
      this.playerModel.position.y = this.camera.position.y - 4;

      direction.y = 0;
      direction.normalize();
      this.playerModel.position.add(direction.multiplyScalar(-1)); // negative = backward

      // if (this.fireMaterial) {
      //   this.fireMaterial.emissiveIntensity =
      //     0.8 + Math.sin(Date.now() * 0.005) * 0.3;
      // }

      // // idk if this is right
      this.armTorchModel.traverse((child) => {
        let flickerAmount = Math.sin(Date.now() * 0.01) * 0.3; // 0 to 0.3 variation

        if (child.name === "mainTorchLight") {
          child.intensity = 20.0 * (1 + flickerAmount); 
        } 
        else {
          child.intensity = 3.0 * (1 + flickerAmount); 
        }
      });
    };
    //add later loop.updatables.push(some thing);

    // add walls & ground
    for (let i = 0; i < maze.length; i++) {
      for (let j = 0; j < maze[i].length; j++) {
        if (maze[i][j] === 1) {
          let wall = createWall(i, j, CELL_SIZE / 2);
          this.scene.add(wall);
          let secondWall = createWall(i, j, CELL_SIZE * 1.5);
          this.scene.add(secondWall);
          continue;
        }
        this.scene.add(ground(i, j));
      }
    }
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

      console.log("Clicked object:", clickedObject);
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

  showEndBlockPopup() {
    this.createDOMPopup();
  }

  createDOMPopup(opts) {
    const options = typeof opts === "string" ? { title: opts } : opts || {};
    const { image = null } = options;

    // set popup state
    this.isPopupOpen = true;

    // disable all camera/movement controls
    try {
      this.controls.unlock();
    } catch (e) {}

    this.controls.enabled = false; // disable mouse look

    // clear any held keys
    Object.keys(this.keys).forEach((key) => {
      this.keys[key] = false;
    });

    // create a mount node for the React popup and attach it to the world container
    const reactMount = document.createElement("div");
    reactMount.className = "world-popup-root";
    (this.container || document.body).appendChild(reactMount);

    const root = createRoot(reactMount);
    const onCloseLetter = () => {
      try {
        root.unmount();
      } catch (e) {}
      // remove only the popup mount node (do NOT remove the world container)
      try {
        if (reactMount.parentNode)
          reactMount.parentNode.removeChild(reactMount);
      } catch (e) {}
      this.isPopupOpen = false;
      try {
        this.controls.enabled = true;
      } catch (e) {}
    };

    const onHome = () => {
      try {
        root.unmount();
      } catch (e) {}
      this.isPopupOpen = false;
      try {
        this.controls.enabled = true;
      } catch (e) {}
      if (typeof this.onExit === "function") {
        this.onExit();
      }
    };

    // render without JSX to avoid needing a JSX transform for .js files
    root.render(
      React.createElement(LetterPopup, {
        onCloseLetter,
        onHome,
      })
    );
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

    try {
      if (this.ambientLight && this.scene) {
        this.scene.remove(this.ambientLight);
      }
    } catch (e) {}
  }
}
