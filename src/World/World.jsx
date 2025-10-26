import React, { useEffect, useRef } from "react";
import { DirectionalLight, AmbientLight, Color, HemisphereLight } from "three";
import { createCamera, createScene, createWall, ground } from "../components";
// import { Resizer } from "../systems/Resizer.js";
import { maze, startPosition, endPosition } from "../core";
import { createRenderer, Loop, setupControls } from "../systems";

class World {
  //synchronous set
  constructor(container) {
    this.camera = createCamera();
    this.scene = createScene();
    this.renderer = createRenderer(); // creates a canvas element

    let { controls, keys } = setupControls(this.camera, document.body);
    this.controls = controls;
    this.keys = keys;

    container.appendChild(this.renderer.domElement); // makes canvas visible and World attaches Three.js to div

    this.scene.background = new Color(0x87ceeb); // sky blue

    // finds the width and height for camera settings
    let width = container.clientWidth;
    let height = container.clientHeight;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // loop manager if needed elsewhere
    this.loop = new Loop(this.camera, this.scene, this.renderer);

    // hook up controls handling to the loop
    this.loop.onRender = () => {
      // makes onRender truthy
      this.handleControls();
    };

    let cell_size = 2; // what is set in wall.js

    console.log("start position: ", startPosition);

    // calculate maze start using mazeGeneration info
    // let mazeWidth = e;
    // let mazeDepth = startPosition[1].length * cell_size;
    // //  let mazeWidth = maze[0].length * cell_size;
    // // let mazeDepth = maze[1].length * cell_size;
    // let centerX = mazeWidth / 2;
    // let centerZ = mazeDepth / 2;

    // // // Position camera to see the whole maze on first load (overview)
    // this.camera.position.set(
    //   (startPosition[0].length * cell_size) / 2, // center horizontally
    //   15,      // height above maze
    //   (startPosition[1].length * cell_size)/2 + 10 // slight offset so we aren't directly above center
    // );
    // // Point camera at the center of the maze
    // this.camera.lookAt(centerX, 0, centerZ);

    // //this is first person POV
    this.camera.position.set(
      startPosition[0] * cell_size, // Starting position in maze
      1.6, // Eye height
      startPosition[1] * cell_size
    );

    // add lighting maybe to a different file later
    let directionalLight = new DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    let ambientLight = new AmbientLight(0xffffff, 0.3);
    let hemiLight = new HemisphereLight(
      0x87ceeb, // sky color
      0x654321, // ground color (brown)
      0.6
    );

    this.scene.add(ambientLight, directionalLight, ground(), hemiLight);

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

  handleControls() {
    if (this.controls && this.controls.isLocked && this.keys) {
      const moveSpeed = 5.0;
      const delta = 0.016; // roughly 60fps

      if (this.keys.w) this.controls.moveForward(moveSpeed * delta);
      if (this.keys.s) this.controls.moveForward(-moveSpeed * delta);
      if (this.keys.a) this.controls.moveRight(-moveSpeed * delta);
      if (this.keys.d) this.controls.moveRight(moveSpeed * delta);
    }
  }

  dispose() {
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
