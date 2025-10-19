//in world.js

//1. import
import React, { useEffect, useRef } from "react";
import { DirectionalLight, AmbientLight, Color } from "three";
import { createCamera } from "../components/camera.js";
import { createCube } from "../components/cube.js";
import { createScene } from "../components/scene.js";

import { createRenderer } from "../systems/renderer.js";
// import { Resizer } from "../systems/Resizer.js";

class World {
  //synchronous set
  constructor(container) {
    this.camera = createCamera();
    this.scene = createScene();
    this.renderer = createRenderer();

    container.appendChild(this.renderer.domElement);

    this.scene.background = new Color(0x87CEEB); // Sky blue

    const width = container.clientWidth;
    const height = container.clientHeight;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Add lighting
    const light = new DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    this.scene.add(light);

    const ambientLight = new AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    this.cube = createCube();
    this.scene.add(this.cube);

    // this.resizer = new Resizer(container, this.camera, this.renderer);

    // async init() {
    //     // asynchronous setup here
    //     // load bird models
    // }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.dispose();
  }
}

export const ThreeJsWorld = () => {
  const containerRef = useRef(null);
  const worldRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize World
    worldRef.current = new World(containerRef.current);

    // Animation loop
    const animate = () => {
      worldRef.current.render();
      frameRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (worldRef.current) {
        worldRef.current.dispose();
      }
    };
  }, []);


  return (
    <>
      <div className="w-full h-screen">
        <div ref={containerRef} className="fullscreen" style={{ margin: 0, padding: 0, overflow: 'hidden' }} />
      </div>
    </>
  );
};
