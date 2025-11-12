import * as THREE from 'three';

import { PlaneGeometry, Mesh, MeshStandardMaterial } from "three";
import { endPosition } from "../core";

const endBlock = () => {
  let cell_size = 5;
  let geometry = new THREE.Mesh(
    new THREE.BoxGeometry(cell_size, 0.5, cell_size),
    new THREE.MeshStandardMaterial({ color: 0xFFA500 })
  );

  geometry.position.set(
    endPosition[0] * cell_size + cell_size / 2, //divide by 2 to center Plane Geometry [it starts with being at [-some number, some number] instead of [0,0]
    0,
    endPosition[1] * cell_size + cell_size / 2
  );
  return geometry;
};

export { endBlock };
