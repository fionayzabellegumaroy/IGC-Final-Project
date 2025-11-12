import * as THREE from 'three';

import { PlaneGeometry, Mesh, MeshStandardMaterial } from "three";
import { startPosition } from "../core";


const startBlock = () => {
  let cell_size = 5;

  let geometry = new THREE.Mesh(
    new THREE.BoxGeometry(cell_size, 0.5, cell_size),
    new THREE.MeshStandardMaterial({ color: 0xFFFF00 })
  );

  geometry.position.set(
    startPosition[0] * cell_size + 1.5, //divide by 2 to center Plane Geometry [it starts with being at [-some number, some number] instead of [0,0]
    0,
    startPosition[1] * cell_size + 1.5
  );
  return geometry;
};

export { startBlock };
