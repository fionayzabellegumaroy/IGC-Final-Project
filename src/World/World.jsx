import React, { useEffect, useRef } from "react";
import { AmbientLight, Color, PCFSoftShadowMap, PointLight } from "three";
import {
  ceiling,
  createCamera,
  createScene,
  createWall,
  endBlock,
  ground,
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
  constructor(container) {
    this.camera = createCamera();
    this.scene = createScene();
    this.renderer = createRenderer(); // creates a canvas element

    let { controls, keys, dispose } = setupControls(this.camera, document.body);
    this.controls = controls;
    this.keys = keys;
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

    // loop manager if needed elsewhere
    this.loop = new Loop(this.camera, this.scene, this.renderer);

    // hook up controls handling to the loop
    this.loop.onRender = () => {
      this.playerMovementInstance.update();
      this.torchLight.intensity = 2.0 + Math.sin(Date.now() * 0.01) * 0.3;
    };

    let cell_size = 5; // what is set in wall.js

    //this is first person POV
    this.camera.position.set(
      startPosition[0] * cell_size + cell_size / 2, // Starting position in maze
      1.6, // Eye height
      startPosition[1] * cell_size + cell_size / 2
    );

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    let ambientLight = new AmbientLight(0x404040, 0.5); // Much darker

    this.torchLight = new PointLight(
      0xF8E17A,
      3.0, // Intensity
      20, // Range/distance
      2 // Decay (how quickly it falls off)
    );

    this.torchLight.castShadow = true;
    this.torchLight.shadow.mapSize.width = 1024;
    this.torchLight.shadow.mapSize.height = 1024;
    this.torchLight.shadow.camera.near = 0.1;
    this.torchLight.shadow.camera.far = 15;

    // Position it slightly in front of and to the side of camera
    this.torchLight.position.set(0.5, -0.2, 0.5);
    this.camera.add(this.torchLight); // Attach to camera so it moves with player

    this.scene.add(
      ambientLight,
      this.camera,
      ceiling(),
      endBlock(),
      ground(),
      startBlock()
    );

    // this.resizer = new Resizer(container, this.camera, this.renderer);

    //add later loop.updatables.push(some thing);

    // add walls
    for (let i = 0; i < maze.length; i++) {
      for (let j = 0; j < maze[i].length; j++) {
        if (maze[i][j] === 1) {
          let wall = createWall(i, j);
          this.scene.add(wall);
        }
      }
    }

    // async init() {
    //     // asynchronous setup here
    //     // load bird models
    // }
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

export let ThreeJsWorld = () => {
  let containerRef = useRef(null); // holds the DOM node where we mount the canvas
  let worldRef = useRef(null); // stores the World instance

  useEffect(() => {
    if (!containerRef.current) return;

    // initialize world
    worldRef.current = new World(containerRef.current); // World now has handle to actual div

    // start the Loop system
    worldRef.current.loop.start();

    // cleanup function
    return () => {
      if (worldRef.current) {
        worldRef.current.loop.stop();
        worldRef.current.dispose();
      }
    };
  }, []); // empty dependency array ensures this runs once on mount and cleans up on unmount

  return (
    <>
      <div className="w-full h-screen">
        <div
          ref={containerRef} // JSX renders div and after first mount, React assigns real DOM node to containerRef.current
          className="fullscreen"
          style={{ margin: 0, padding: 0, overflow: "hidden" }}
        />
      </div>
    </>
  );
};
