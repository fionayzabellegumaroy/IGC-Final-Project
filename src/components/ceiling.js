import { maze } from "../core";
import { CELL_SIZE } from "../config";
import { DoubleSide, Mesh, MeshLambertMaterial, PlaneGeometry } from "three";

let ceilingGeometry = new PlaneGeometry(
  maze[0].length * CELL_SIZE,
  maze.length * CELL_SIZE
);
let ceilingMaterial = new MeshLambertMaterial({
  color: 0x332227,
  side: DoubleSide, // allows player to see plane from below
});

export const ceiling = () => {
  let ceilingMesh = new Mesh(ceilingGeometry, ceilingMaterial);
  ceilingMesh.rotation.x = Math.PI / 2; // rotate to be horizontal

  ceilingMesh.position.set(
    (maze[0].length * CELL_SIZE) / 2,
    CELL_SIZE * 2,
    (maze.length * CELL_SIZE) / 2
  ); // places ceiling at top of maze walls

  ceilingMesh.userData = {
    type: "ceiling",
  };

  return ceilingMesh;
};
