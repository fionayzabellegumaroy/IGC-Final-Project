import { PlaneGeometry, Mesh, MeshStandardMaterial, DoubleSide } from "three";
import { maze } from "../core";

export const ceiling = () => {
  let cellSize = 5;
  let width = maze[0].length * cellSize;
  let depth = maze.length * cellSize;

  let ceilingGeometry = new PlaneGeometry(width, depth);

  let ceilingMaterial = new MeshStandardMaterial({
    color: 0x2e1503,
    roughness: 1,
    metalness: 0.2,
    side: DoubleSide, // allows player to see plane from below
  });

  let ceilingMesh = new Mesh(ceilingGeometry, ceilingMaterial);
  ceilingMesh.rotation.x = Math.PI / 2; // rotate to be horizontal

  ceilingMesh.position.set(width / 2, cellSize*2, depth / 2); // places ceiling at top of maze walls

  return ceilingMesh;
};
