import React, { useEffect, useRef } from "react";
import { Grid } from "@mui/material";
import {
  AmbientLight,
  Color,
  PCFSoftShadowMap,
  PointLight,
  Raycaster,
  Vector2,
  Vector3,
} from "three";
import {
  ceiling,
  createCamera,
  createGround,
  createScene,
  createWall,
  endBlock,
  // ground,
  player,
  startBlock,
} from "../components";
// import { Resizer } from "../systems/Resizer.js";
import { maze, startPosition, endPosition } from "../core";
import {
  createRenderer,
  Loop,
  PlayerMovement,
  setupControls,
} from "../systems";

class World {
  //synchronous set
  constructor(container, options = {}) {
    this.camera = createCamera();
    this.scene = createScene();
    this.renderer = createRenderer(); // creates a canvas element
    this.onExit = options.onExit;
    this.isPopupOpen = false;

    let { controls, keys, dispose } = setupControls(
      this.camera,
      document.body,
      this.onObjectClick.bind(this), 
      () => this.isPopupOpen
    );
    this.controls = controls;
    this.keys = keys;

    // disable click events on the renderer canvas
    this.renderer.domElement.style.pointerEvents = "none";

    // clear any held keys
    Object.keys(this.keys).forEach((key) => {
      this.keys[key] = false;
    });

    this.controlsDispose = dispose;

    this.playerMovementInstance = new PlayerMovement(
      this.camera,
      this.controls,
      this.keys
    );

    container.appendChild(this.renderer.domElement); // makes canvas visible and World attaches Three.js to div

    this.scene.background = new Color(0x87ceeb); // sky blue

    // finds the width and height for camera settings
    let width = container.clientWidth;
    let height = container.clientHeight;
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;

    // add raycaster and mouse tracking
    this.raycaster = new Raycaster();
    this.mouse = new Vector2();

    let cell_size = 5; // what is set in wall.js

    //this is first person POV
    this.camera.position.set(
      startPosition[0] * cell_size + cell_size / 2,
      1.6, // Eye height
      startPosition[1] * cell_size + cell_size / 2
    );

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    let ambientLight = new AmbientLight(0x404040, 0.5);

    this.torchLight = new PointLight(
      0xf8e17a,
      5.0, // Intensity
      20, // Range/distance
      2 // Decay (how quickly it falls off)
    );

    this.torchLight.castShadow = true;
    this.torchLight.shadow.mapSize.width = 1024;
    this.torchLight.shadow.mapSize.height = 1024;
    this.torchLight.shadow.camera.near = 0.1;
    this.torchLight.shadow.camera.far = 15;

    this.torchLight.position.set(0.5, -0.2, 0.5); // position it slightly in front of and to the side of camera

    this.player = player();
    this.player.position.set(0, -0.75, 0); // adjust player model position relative to camera

    // attach to camera so it moves with player
    this.camera.add(this.torchLight);

    this.scene.add(
      ambientLight,
      this.camera,
      ceiling(),
      endBlock(),
      // ground(),
      // startBlock(),
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
        let groundBlock = createGround(i, j);
        this.scene.add(groundBlock);
      }
    }

    // async init() {
    //     // asynchronous setup here
    //     // load bird models
    // }
      // loop manager if needed elsewhere
    this.loop = new Loop(this.camera, this.scene, this.renderer);

    // hook up controls handling to the loop
    this.loop.onRender = () => {
      if (!this.isPopupOpen && this.controls.enabled) { // only update if popup is not open
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
      console.log("Clicked object:", clickedObject);
      console.log("Object userData:", clickedObject.userData);

      // check what type of object was clicked
      if (
        clickedObject.userData &&
        clickedObject.userData.type === "endBlock"
      ) {
        this.showEndBlockPopup(clickedObject);
        this.controls.unlock();
      }
    } else {
      console.log("No objects intersected");
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
      // Re-enable controls when popup closes
      try { this.controls.enabled = true; } catch (e) {}
      // If an exit callback was provided, call it to return to start screen
      if (typeof this.onExit === 'function') {
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
  }
}

// ThreeJsWorld React wrapper
export let ThreeJsWorld = ({ onExit } = {}) => {
  let containerRef = useRef(null); // holds the DOM node where we mount the canvas
  let worldRef = useRef(null); // stores the World instance

  useEffect(() => {
    if (!containerRef.current) return;

    // initialize world and pass the onExit callback into the World instance
    worldRef.current = new World(containerRef.current, { onExit });

    // start the Loop system
    worldRef.current.loop.start();

    // cleanup function
    return () => {
      if (worldRef.current) {
        try { worldRef.current.loop.stop(); } catch (e) {}
        try { worldRef.current.dispose(); } catch (e) {}
        worldRef.current = null;
      }
    };
  }, [onExit]); // re-run if onExit changes

  return (
    <>
      <Grid container id="world-container" sx={{ height: "100vh", position: "absolute", width: "100vw" }}>
        <Grid
          id="world"
          ref={containerRef} // JSX renders div and after first mount, React assigns real DOM node to containerRef.current
          style={{ margin: 0, padding: 0, overflow: "hidden", width: "100%", height: "100%" }}
        />
      </Grid>
    </>
  );
};
