import {
  DoubleSide,
  Mesh,
  MeshLambertMaterial,
  PlaneGeometry,
} from "three";
import { maze } from "../core";
import { CELL_SIZE } from "../utils";

export const ceiling = () => {
  let width = maze[0].length * CELL_SIZE;
  let depth = maze.length * CELL_SIZE;

  let ceilingGeometry = new PlaneGeometry(width, depth);

  let ceilingMaterial = new MeshLambertMaterial({
    color: 0x332227,
    side: DoubleSide, // allows player to see plane from below
  });

  let ceilingMesh = new Mesh(ceilingGeometry, ceilingMaterial);
  ceilingMesh.rotation.x = Math.PI / 2; // rotate to be horizontal

  ceilingMesh.position.set(width / 2, CELL_SIZE * 2, depth / 2); // places ceiling at top of maze walls

  ceilingMesh.userData = {
    type: "ceiling",
  };

  return ceilingMesh;
};
