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
  Mouse,
  rightArmTorch,
  Timer,
  Result,
  scene,
} from "../components";
import { maze } from "../core";
import { CELL_SIZE, TIME_LIMIT } from "../utils";
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
    this.timeElapsed = 0;
    this.timeTotal = TIME_LIMIT; // in seconds
    this.timeStarted = -1;
    this.updateTime = true;
    this.openedLetter = false;

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

    this.createTimerComponent();
    this.createPointerComponent();

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
    this.loop.onRender = (delta) => {
      if (!this.isPopupOpen && this.controls.enabled) {
        this.player.update(delta); // update player movement, camera, and headbobbing
      }

      const direction = new Vector3();
      this.camera.getWorldDirection(direction);
      const yRotation = Math.atan2(direction.x, direction.z);
      this.playerModel.rotation.y = yRotation;
      this.playerModel.position.copy(this.camera.position);
      this.playerModel.position.y = this.camera.position.y - 4;

      direction.y = 0;
      direction.normalize();
      this.playerModel.position.add(direction.multiplyScalar(-1)); // negative = backward

      // move this to right arm update
      this.armTorchModel.traverse((child) => {
        let flickerAmount = Math.sin(Date.now() * 0.01) * 0.3; // 0 to 0.3 variation

        if (child.name === "mainTorchLight") {
          child.intensity = 20.0 * (1 + flickerAmount);
        } else {
          child.intensity = 3.0 * (1 + flickerAmount);
        }
      });

      this.updateTimeElapsed();
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

  createTimerComponent() {
    this.timeStarted = Date.now();

    this.timerMountDiv = document.createElement("div");
    this.timerMountDiv.id = "timer-mount";
    this.container.appendChild(this.timerMountDiv);

    this.timerRoot = createRoot(this.timerMountDiv);
    this.timerRoot.render(
      React.createElement(Timer, { timeStarted: this.timeStarted })
    );
  }

  createPointerComponent() {
    this.pointerMountDiv = document.createElement("div");
    this.pointerMountDiv.id = "pointer-mount";
    this.container.appendChild(this.pointerMountDiv);

    this.pointerRoot = createRoot(this.pointerMountDiv);
    this.pointerRoot.render(React.createElement(Mouse, {}));
  }

  disableControls() {
    // disable all camera/movement controls
    try {
      this.controls.unlock();
    } catch (e) {}

    this.controls.enabled = false; // disable mouse look

    // clear any held keys
    Object.keys(this.keys).forEach((key) => {
      this.keys[key] = false;
    });
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
        this.showLetter();
      }
    }
  }

  removeComponent(mount, root) {
    if (root) {
      try {
        root.unmount();
        root = null;
      } catch (e) {
        console.error("Error unmounting root:", e);
      }
    }

    if (mount && mount.parentNode) {
      try {
        mount.parentNode.removeChild(mount);
      } catch (e) {
        console.error("Error removing mount div:", e);
      }
    }
  }

  showResult(win) {
    this.updateTime = false;

    if (this.timerRoot) {
      this.removeComponent(this.timerMountDiv, this.timerRoot);
      this.timerMountDiv = null;
      this.timerRoot = null;
    }

    if (this.pointerRoot) {
      this.removeComponent(this.pointerMountDiv, this.pointerRoot);
      this.pointerMountDiv = null;
      this.pointerRoot = null;
    }

    this.disableControls();
    this.isPopupOpen = true;

    const resultMountDiv = document.createElement("div");
    this.container.appendChild(resultMountDiv);
    const resultRoot = createRoot(resultMountDiv);

    const onClose = () => {
      this.removeComponent(resultMountDiv, resultRoot);
      this.isPopupOpen = false;
      try {
        this.controls.enabled = true;
      } catch (e) {}
      if (typeof this.onExit === "function") {
        try {
          this.onExit();
          return;
        } catch (e) {
          console.error("Error calling this.onExit", e);
        }
      }
    };

    resultRoot.render(
      React.createElement(Result, {
        onClose,
        sad: this.openedLetter,
        timeElapsed: this.timeElapsed,
        win: win,
      })
    );
  }

  showLetter() {
    this.isPopupOpen = true;

    this.disableControls();

    this.removeComponent(this.pointerMountDiv, this.pointerRoot);
    this.pointerMountDiv = null;
    this.pointerRoot = null;

    this.letterMountDiv = document.createElement("div");
    this.container.appendChild(this.letterMountDiv);

    this.letterRoot = createRoot(this.letterMountDiv);

    const onCloseLetter = () => {
      this.removeComponent(this.letterMountDiv, this.letterRoot);
      this.letterMountDiv = null;
      this.letterRoot = null;
      this.isPopupOpen = false;
      this.openedLetter = true; // set it here so that if time runs out while in letter, player just ran out of time (not necessarily closing the letter)
      try {
        this.controls.enabled = true;
      } catch (e) {}
      this.createPointerComponent();
    };

    const onHome = () => {
      this.removeComponent(this.letterMountDiv, this.letterRoot);
      this.letterMountDiv = null;
      this.letterRoot = null;
      this.isPopupOpen = false;
      try {
        this.controls.enabled = true;
      } catch (e) {}
      this.openedLetter = false; // reset opened letter state
      this.showResult(true);
    };

    this.letterRoot.render(
      React.createElement(LetterPopup, {
        onCloseLetter,
        onHome,
      })
    );
  }

  updateTimeElapsed() {
    if (this.updateTime) {
      this.timeElapsed = (Date.now() - this.timeStarted) / 1000;
    }

    if (this.timeElapsed >= this.timeTotal && this.updateTime) {
      this.updateTime = false;
      if (this.isPopupOpen) {
        this.removeComponent(this.letterMountDiv, this.letterRoot);
        this.letterMountDiv = null;
        this.letterRoot = null;
      }
      this.showResult(false);
    }
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

    if (this.loop) {
      try {
        this.loop.stop();
      } catch (e) {}
      this.loop = null;
    }

    // dispose resizer
    if (this.resizer && typeof this.resizer.dispose === "function") {
      try {
        this.resizer.dispose();
      } catch (e) {}
      this.resizer = null;
    }

    // unmount any mounted react roots and remove mount nodes
    const safeRemoveRoot = (mountDiv, root) => {
      if (root) {
        try {
          root.unmount();
        } catch (e) {
          console.error(e);
        }
      }
      if (mountDiv && mountDiv.parentNode) {
        try {
          mountDiv.parentNode.removeChild(mountDiv);
        } catch (e) {}
      }
    };
    safeRemoveRoot(this.timerMountDiv, this.timerRoot);
    safeRemoveRoot(this.pointerMountDiv, this.pointerRoot);
    safeRemoveRoot(this.letterMountDiv, this.letterRoot);
    safeRemoveRoot(this.resultMountDiv, this.resultRoot);

    // remove canvas from DOM
    if (
      this.renderer &&
      this.renderer.domElement &&
      this.renderer.domElement.parentNode
    ) {
      try {
        this.renderer.domElement.parentNode.removeChild(
          this.renderer.domElement
        );
      } catch (e) {}
    }

    // remove objects added to the scene
    try {
      if (this.armTorchModel && this.camera)
        this.camera.remove(this.armTorchModel);
      if (this.ambientLight && this.scene) this.scene.remove(this.ambientLight);
      if (this.camera && this.scene) this.scene.remove(this.camera);
      if (this.ceilingObj) this.scene.remove(this.ceilingObj);
      if (this.endBlockObj) this.scene.remove(this.endBlockObj);
      if (this.playerModel) this.scene.remove(this.playerModel);

      if (Array.isArray(this.walls)) {
        this.walls.forEach((w) => this.scene.remove(w));
        this.walls = null;
      }
      if (Array.isArray(this.grounds)) {
        this.grounds.forEach((g) => this.scene.remove(g));
        this.grounds = null;
      }
    } catch (e) {
      console.warn("Error removing scene children:", e);
    }

    // dispose materials and textures by traversing the scene
    if (this.scene) {
      this.scene.traverse((obj) => {
        if (obj.isMesh) {
          if (obj.geometry) {
            try {
              obj.geometry.dispose();
            } catch (e) {}
          }
          const disposeMaterial = (mat) => {
            if (!mat) return;
            // textures
            [
              "map",
              "alphaMap",
              "aoMap",
              "bumpMap",
              "emissiveMap",
              "envMap",
              "lightMap",
              "metalnessMap",
              "normalMap",
              "roughnessMap",
            ].forEach((k) => {
              if (mat[k] && mat[k].dispose) {
                try {
                  mat[k].dispose();
                } catch (e) {}
              }
            });
            // material itself
            if (mat.dispose) {
              try {
                mat.dispose();
              } catch (e) {}
            }
          };
          if (Array.isArray(obj.material)) {
            obj.material.forEach(disposeMaterial);
          } else {
            disposeMaterial(obj.material);
          }
        }
      });
    }

    // clear other references from constructor
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.player = null;
    this.ambientLight = null;
    this.armTorchModel = null;
    this.timerRoot = null;
    this.timerMountDiv = null;
    this.pointerRoot = null;
    this.pointerMountDiv = null;
    this.letterRoot = null;
    this.letterMountDiv = null;
    this.resultRoot = null;
    this.resultMountDiv = null;
    this.keys = null;
    this.raycaster = null;
  }
}
