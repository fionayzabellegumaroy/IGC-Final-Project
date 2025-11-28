import { Color, PCFSoftShadowMap, Raycaster, Vector2, Vector3 } from "three";
import {
  ambientLight,
  camera,
  ceiling,
  createWall,
  endBlock,
  ground,
  LetterPopup,
  scene,
  torch,
} from "../components";
// import { Resizer } from "../systems/Resizer.js";
import { maze } from "../core";
import { Loop, renderer, setupControls } from "../systems";
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
    this.torchLight = torch();
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

    // attach to camera so it moves with player
    this.camera.add(this.torchLight);

    this.scene.add(this.ambientLight, this.camera, ceiling(), endBlock());

    // loop manager if needed elsewhere
    this.loop = new Loop(this.camera, this.scene, this.renderer);

    // hook up controls handling to the loop
    this.loop.onRender = () => {
      if (!this.isPopupOpen && this.controls.enabled) {
        this.player.update(); // update player movement, camera, and headbobbing
      }

      // torchlight animation
      this.torchLight.intensity = 5.0 + Math.sin(Date.now() * 0.01) * 0.3;
    };

    // this.resizer = new Resizer(container, this.camera, this.renderer);

    //add later loop.updatables.push(some thing);

    // add walls & ground
    for (let i = 0; i < maze.length; i++) {
      for (let j = 0; j < maze[i].length; j++) {
        if (maze[i][j] === 1) {
          let wall = createWall(i, j, 5 / 2);
          this.scene.add(wall);
          let secondWall = createWall(i, j, 7.5);
          this.scene.add(secondWall);
          continue;
        }
        this.scene.add(ground(i,j), ceiling(i,j));
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
        if (reactMount.parentNode) reactMount.parentNode.removeChild(reactMount);
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
