import { PlaneGeometry, Mesh, MeshStandardMaterial, DoubleSide } from "three";
import { maze } from "../core";

// ceiling factory: returns a Mesh positioned above the maze
let ceiling = () => {
  const cell_size = 5;
  const width = maze[0].length * cell_size;
  const depth = maze.length * cell_size;

  const ceilingGeometry = new PlaneGeometry(width, depth);

  // use DoubleSide so the plane is visible from below (player is inside the maze)
  const ceilingMaterial = new MeshStandardMaterial({
    color: 0x808080,
    roughness: 1,
    metalness: 0.2,
    side: DoubleSide,
  });

  const ceilingMesh = new Mesh(ceilingGeometry, ceilingMaterial);
  // rotate so the plane faces downward (so top of walls meets the ceiling)
  ceilingMesh.rotation.x = Math.PI / 2;

  // place the ceiling at the top of wall height (walls are CELL_SIZE tall)
  ceilingMesh.position.set(width / 2, cell_size, depth / 2);

  return ceilingMesh;
};

export { ceiling };
