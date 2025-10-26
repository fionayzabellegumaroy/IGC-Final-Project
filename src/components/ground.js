import { PlaneGeometry, Mesh, MeshStandardMaterial } from "three";
import { maze } from "../core";

const ground = () => {
  let cell_size = 2;
  let groundGeometry = new PlaneGeometry(
    maze[0].length * cell_size,
    maze.length * cell_size
  );

  let groundMaterial = new MeshStandardMaterial({
    color: 0x228b22,
    roughness: 2,
    metalness: 0.2,
  });

  let ground = new Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2; // rotate to be horizontal

  ground.position.set(
    (maze[0].length * cell_size) / 2 - 1, //divide by 2 to center Plane Geometry [it starts with being at [-some number, some number] instead of [0,0]
    0,
    (maze.length * cell_size) / 2 - 1
  );
  return ground;
};

export { ground };
